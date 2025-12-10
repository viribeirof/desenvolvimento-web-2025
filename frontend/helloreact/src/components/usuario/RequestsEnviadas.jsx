import React, { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Container, ListGroup, Spinner, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";
import ItemBusca from "../../components/item/ItemBusca";
import '../../assets/Requests.css';

const RequestsEnviadas = () => {
    const { user, authLoading } = useAuth();
    const authFetch = useAuthFetch();
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const mountedRef = useRef(true);
    const abortRef = useRef(null);

    const loadRequests = async (firstLoad = false) => {
        if (firstLoad) setLoading(true);
        setError(null);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await authFetch("http://localhost:8080/api/requests/sent", {
                method: "GET",
                signal: controller.signal,
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
                            signal: controller.signal
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
            if (err?.name === "AbortError") return;
            console.error("Erro ao carregar requests:", err);
            if (mountedRef.current) {
                setError("Falha ao carregar suas solicitações.");
                if (firstLoad) setRequests([]);
            }
        } finally {
            if (firstLoad && mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;

        if (!user) return;

        loadRequests(true);

        const interval = setInterval(() => {
            if (mountedRef.current) loadRequests(false);
        }, 15000);

        return () => {
            mountedRef.current = false;
            clearInterval(interval);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [user]);

    const filteredRequests = requests.filter(req =>
        req.itemName.toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading || loading)
        return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;

    if (!user) return <Navigate to="/login" replace />;

    return (
        <Container className="requests-container mt-4">
            <h4 className="mb-4 section-title">Minhas Solicitações Enviadas</h4>

            <div className="mb-3">
                <ItemBusca value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por item..." />
            </div>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            {filteredRequests.length === 0 ? (
                <p className="empty-text">Nenhuma solicitação encontrada.</p>
            ) : (
                <ListGroup className="request-list">
                    {filteredRequests.map(req => (
                        <ListGroup.Item key={req.id} className="request-item py-3 shadow-hover">
                            <div>
                                <strong
                                    className="d-block fs-5 item-title"
                                    style={{ cursor: "pointer", textDecoration: "underline" }}
                                    onClick={() => navigate(`/item/${req.itemId}`)}
                                >
                                    {req.itemName ?? "Item desconhecido"}
                                </strong>                                <span className="item-message">{req.message}</span>
                                <small className="d-block mt-2 item-meta">
                                    <span>Status: </span>
                                    <Badge
                                        className={`status-badge ${req.status === "ACEITA" ? "status-aceita" :
                                            req.status === "PENDENTE" ? "status-pendente" : "status-recusada"}`}
                                    >
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
              <div className="bg-decor" aria-hidden="true">
                    <span className="dot dot-1" />
                    <span className="dot dot-2" />
                    <span className="dot dot-3" />
                </div>
        </Container>
    );
};

export default RequestsEnviadas;
