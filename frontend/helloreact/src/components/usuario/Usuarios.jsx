import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Card } from "react-bootstrap";

const Usuarios = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIntervalRef = useRef(null);

  const fetchUsuarios = async (signal) => {
    try {
      setError(null);

      const etagKey = "usuarios_etag";
      const etag = localStorage.getItem(etagKey);
      const headers = etag ? { "If-None-Match": etag } : {};

      const res = await fetch("http://localhost:8080/api/usuarios", { method: "GET", headers, signal });

      if (res.status === 304) {
        const cacheString = localStorage.getItem("usuarios_cache");
        if (cacheString) {
          const cache = JSON.parse(cacheString);
          setUsuarios(Array.isArray(cache.content) ? cache.content : []);
        }
        return;
      }

      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

      const data = await res.json();
      const lista = Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : [];
      setUsuarios(lista);

      const responseETag = res.headers.get("ETag");
      if (responseETag) localStorage.setItem(etagKey, responseETag);
      localStorage.setItem("usuarios_cache", JSON.stringify({ content: lista }));
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Erro ao carregar usuários:", err);
      setError(err.message || "Erro ao carregar usuários");

      const cacheString = localStorage.getItem("usuarios_cache");
      if (cacheString) {
        try {
          const cache = JSON.parse(cacheString);
          setUsuarios(Array.isArray(cache.content) ? cache.content : []);
        } catch {
          setUsuarios([]);
        }
      } else {
        setUsuarios([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUsuarios(controller.signal);
    fetchIntervalRef.current = setInterval(() => fetchUsuarios(controller.signal), 15000);

    return () => {
      controller.abort();
      clearInterval(fetchIntervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Carregando usuários...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <h1 className="h3 fw-bold mb-4">Usuários do Sistema</h1>

      <Row className="g-3">
        {usuarios.map((user) => (
          <Col key={user.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              className="shadow-sm rounded-4 p-3 d-flex flex-row align-items-center gap-3"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/usuario/${user.id}`)}
            >
              <div
                className="rounded-circle overflow-hidden flex-shrink-0"
                style={{ width: 70, height: 70, backgroundColor: "#f0f0f0" }}
              >
                <img
                  src={user.fotoPerfil || "/placeholder.png"}
                  alt={`Foto de perfil de ${user.nome}`}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
              </div>

              <div className="flex-grow-1 text-truncate">
                <h5 className="mb-1 text-truncate">{user.nome}</h5>
                <p className="text-muted small mb-0 text-truncate">{user.email}</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Usuarios;
