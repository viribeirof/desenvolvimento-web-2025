// src/pages/RequestsEnviadas.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { Container, ListGroup, Spinner, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";

const RequestsEnviadas = () => {
    const { user, authLoading } = useAuth();
    const authFetch = useAuthFetch();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = useCallback(async (signal) => {
        const res = await authFetch("http://localhost:8080/api/requests/sent", { method: "GET", signal });
        if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.erro || `Erro HTTP ${res.status}`);
        }
        return await res.json();
    }, [authFetch]);

    const fetchItemById = useCallback(async (itemId, signal) => {
        const res = await authFetch(`http://localhost:8080/api/itens/${encodeURIComponent(itemId)}`, { method: "GET", signal });
        if (!res.ok) return null;
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

            // coletar ids unicos 
            const ids = Array.from(new Set(arr.map(r => r.itemId ?? (r.item && r.item.id)).filter(Boolean)));

            // cache em memória para evitar fetch duplicado
            const itemCache = new Map();
            const fetchPromises = ids.map(async (id) => {
                try {
                    const item = await fetchItemById(id, controller.signal);
                    if (item) itemCache.set(id, item);
                } catch (err) {
                    console.warn("Erro ao buscar item", id, err);
                }
            });

            await Promise.all(fetchPromises);

            const merged = arr.map(r => {
                const id = r.itemId ?? (r.item && r.item.id);
                const itemObj = id ? itemCache.get(id) ?? null : (r.item ?? null);
                return {
                    ...r,
                    itemName: itemObj?.nome ?? itemObj?.name ?? (r.item?.name) ?? `Item ${id ?? ""}`,
                    itemObj
                };
            });

            setRequests(merged);
            setError(null);
        } catch (err) {
            if (err?.name === "AbortError") return;
            console.error("Erro ao carregar requests/enviadas:", err);
            setError("Falha ao carregar suas solicitações.");
            setRequests([]);
        } finally {
            setLoading(false);
            if (controller) try { controller.abort(); } catch { }
        }
    }, [fetchRequests, fetchItemById]);

    useEffect(() => {
        if (!user) return;
        loadAll();
        const interval = setInterval(loadAll, 15000);
        return () => clearInterval(interval);
    }, [user, loadAll]);

    if (authLoading || loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <Container className="mt-4">
            <h4 className="mb-3">Minhas Solicitações Enviadas</h4>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            {requests.length === 0 ? (
                <p className="text-muted">Você não enviou nenhuma solicitação.</p>
            ) : (
                <ListGroup>
                    {requests.map((req) => (
                        <ListGroup.Item key={req.id} className="py-3">
                            <div>
                                <strong className="d-block fs-5">{req.itemName ?? "Item desconhecido"}</strong>
                                <span>{req.message}</span>

                                <small className="text-muted d-block mt-2">
                                    <span>Status: </span>
                                    <Badge bg="secondary">
                                        {req.status}
                                    </Badge>
                                    <br />
                                    Solicitado em: {new Date(req.createdAt).toLocaleString()}
                                </small>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
};

export default RequestsEnviadas;
