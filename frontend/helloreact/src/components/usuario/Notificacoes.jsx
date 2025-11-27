import React, { useEffect, useState, useCallback } from "react";
import { Container, ListGroup, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";
import { Navigate } from "react-router-dom";

const RequestsRecebidas = () => {
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = useCallback(async (signal) => {
    const res = await authFetch("http://localhost:8080/api/requests/received", { method: "GET", signal });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.erro || `Erro HTTP ${res.status}`);
    }
    return await res.json();
  }, [authFetch]);

  const fetchItemById = useCallback(async (itemId, signal) => {
    const res = await authFetch(`http://localhost:8080/api/itens/${encodeURIComponent(itemId)}`, { method: "GET", signal });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  }, [authFetch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    let controller;
    try {
      controller = new AbortController();
      const raw = await fetchRequests(controller.signal);

      const arr = Array.isArray(raw) ? raw : [];

      const ids = Array.from(new Set(
        arr.map(r => r.itemId ?? (r.item && r.item.id)).filter(Boolean)
      ));

      const itemCache = new Map();
      const itemFetchPromises = ids.map(async (id) => {
        try {
          const item = await fetchItemById(id, controller.signal);
          if (item) itemCache.set(id, item);
        } catch (err) {
          console.warn("Erro ao buscar item", id, err);
        }
      });

      await Promise.all(itemFetchPromises);

      const merged = arr.map(r => {
        const id = r.itemId ?? (r.item && r.item.id);
        const itemObj = id ? itemCache.get(id) ?? null : (r.item ?? null);
        return {
          ...r,
          itemName: itemObj?.nome ?? itemObj?.name ?? (r.item?.name) ?? (itemObj?.nomePt) ?? `Item ${id ?? ""}`,
          itemObj,
        };
      });

      setRequests(merged);
      setError(null);
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }
      console.error("Erro ao carregar requests + items:", err);
      setError("Falha ao carregar requests.");
      setRequests([]);
    } finally {
      setLoading(false);
      if (controller) try { controller.abort(); } catch {}
    }
  }, [fetchRequests, fetchItemById]);

  useEffect(() => {
    if (!user) return;
    loadAll();
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, [user, loadAll]);

  const handleAction = async (req, action) => {
    try {
      setActionLoading(req.id);

      const res = await authFetch(`http://localhost:8080/api/requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.messages?.[0] || body?.erro || `Erro HTTP ${res.status}`);
      }

      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err.message || "Não foi possível processar ação.");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Container className="mt-4">
      <h4 className="mb-3">Requests Recebidas</h4>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {requests.length === 0 && (
        <p className="text-muted">Nenhuma request recebida.</p>
      )}

      <ListGroup>
        {requests.map((req) => (
          <ListGroup.Item key={req.id} className="py-3">
            <div className="d-flex justify-content-between">
              <div>
                <strong className="d-block fs-5">{req.itemName ?? "Item desconhecido"}</strong>
                <span>{req.message}</span>

                <small className="text-muted d-block mt-2">
                  Solicitado por:
                  <b> {req.requester?.name}</b> ({req.requester?.email})
                  <br />
                  {new Date(req.createdAt).toLocaleString()}
                </small>
              </div>

              {req.status === "PENDENTE" ? (
                <div className="d-flex flex-column gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    disabled={actionLoading === req.id}
                    onClick={() => handleAction(req, "ACEITA")}
                  >
                    {actionLoading === req.id ? "..." : "Aceitar"}
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    disabled={actionLoading === req.id}
                    onClick={() => handleAction(req, "RECUSA")}
                  >
                    {actionLoading === req.id ? "..." : "Recusar"}
                  </Button>
                </div>
              ) : (
                <Badge bg="secondary" className="align-self-start">
                  {req.status}
                </Badge>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default RequestsRecebidas;
