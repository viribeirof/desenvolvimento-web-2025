import React, { useEffect, useState, useRef } from "react";
import { Container, ListGroup, Button, Spinner, Badge, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";
import { Navigate } from "react-router-dom";
import ItemBusca from "../../components/item/ItemBusca";
import '../../assets/Notificacoes.css';

const RequestsRecebidas = () => {
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");

  const mountedRef = useRef(true);
  const abortRef = useRef(null);

  const fetchRequests = async (firstLoad = false) => {
    if (firstLoad) setLoading(true);
    setError(null);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await authFetch("http://localhost:8080/api/requests/received", {
        method: "GET",
        signal: ac.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.erro || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];

      const itemIds = Array.from(new Set(arr.map(r => r.itemId ?? (r.item?.id)).filter(Boolean)));
      const itemCache = new Map();

      await Promise.all(
        itemIds.map(async id => {
          try {
            const resItem = await authFetch(`http://localhost:8080/api/itens/${encodeURIComponent(id)}`, {
              method: "GET",
              signal: ac.signal
            });
            if (resItem.ok) {
              const itemData = await resItem.json();
              itemCache.set(id, itemData);
            }
          } catch (err) {
            console.warn("Erro ao buscar item", id, err);
          }
        })
      );

      const merged = arr.map(r => {
        const id = r.itemId ?? (r.item?.id);
        const itemObj = id ? itemCache.get(id) ?? null : (r.item ?? null);
        return {
          ...r,
          itemName: itemObj?.nome ?? itemObj?.name ?? `Item ${id ?? ""}`
        };
      });

      merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (mountedRef.current) setRequests(merged);

    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Erro ao carregar requests:", err);
      if (mountedRef.current) {
        setError("Falha ao carregar requests.");
        if (firstLoad) setRequests([]); // só limpa na primeira carga
      }
    } finally {
      if (firstLoad && mountedRef.current) setLoading(false);
    }
  };


  useEffect(() => {
    mountedRef.current = true;
    if (!user) return;

    fetchRequests(true);

    const interval = setInterval(() => {
      if (mountedRef.current) fetchRequests(false);
    }, 15000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [authFetch, user]);


  const handleAction = async (req, action) => {

    const backendAction = action === "ACEITA" ? "ACEITA" : "RECUSADA";
    const prevRequests = requests;

    try {
      setActionLoading(req.id);

      setRequests(prev =>
        prev.map(r => {
          if (r.id === req.id) {
            return { ...r, status: backendAction };
          } if (backendAction === "ACEITA" && (r.itemId ?? r.item?.id) === (req.itemId ?? req.item?.id)) {
            return { ...r, status: "RECUSADA" };
          }
          return r;
        })
      );

      const res = await authFetch(`http://localhost:8080/api/requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: backendAction }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.messages?.[0] || body?.erro || `Erro HTTP ${res.status}`);
      }

    } catch (err) {
      console.error("Erro ao processar ação:", err);
      setError(err.message || "Não foi possível processar ação.");

      setRequests(prev => {
        return prevRequests;
      });
    } finally {
      setActionLoading(null);
    }
  };


  const filteredRequests = requests.filter(req =>
    req.itemName.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading)
    return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Container className="requests-container mt-4">
      <h4 className="mb-4 section-title">Minhas Notificações</h4>

      {/* Busca */}
      <div className="mb-3">
        <ItemBusca value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por item..." />
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {filteredRequests.length === 0 ? (
        <p className="text-light">Nenhuma request encontrada.</p>
      ) : (
        <ListGroup>
          {filteredRequests.map(req => (
            <ListGroup.Item key={req.id} className="request-item py-3 shadow-hover">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong
                    className="d-block fs-5 item-title"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate(`/item/${req.itemId}`)}
                  >
                    {req.itemName ?? "Item desconhecido"}
                  </strong>

                  <span className="item-message">{req.message}</span>

                  <small className="d-block mt-2 item-meta">
                    Solicitado por: <b>{req.requester?.name}</b> ({req.requester?.email})
                    <br />
                    {new Date(req.createdAt).toLocaleString()}
                  </small>
                </div>

                {req.status === "PENDENTE" ? (
                  <div className="d-flex flex-column gap-2 action-buttons">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={actionLoading === req.id}
                      className="btn-action"
                      onClick={() => handleAction(req, "ACEITA")}
                    >
                      {actionLoading === req.id ? "..." : "Aceitar"}
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      disabled={actionLoading === req.id}
                      className="btn-action"
                      onClick={() => handleAction(req, "RECUSA")}
                    >
                      {actionLoading === req.id ? "..." : "Recusar"}
                    </Button>
                  </div>
                ) : (
                  <Badge
                    className={`status-badge align-self-start ${req.status === "ACEITA" ? "status-aceita" :
                      req.status === "PENDENTE" ? "status-pendente" :
                        "status-recusada"
                      }`}
                  >
                    {req.status === "ACEITA" ? "Você aceitou" :
                      req.status === "PENDENTE" ? "Pendente" :
                        "Você recusou"}
                  </Badge>
                )}
              </div>

            </ListGroup.Item>

          ))}
          <div className="bg-decor" aria-hidden="true">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
          </div>
        </ListGroup>
      )}
    </Container>
  );
};

export default RequestsRecebidas;
