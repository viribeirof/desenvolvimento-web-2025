import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Usuarios = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async (signal) => {
    try {
      setError(null);

      const etagKey = "usuarios_etag";
      const etag = localStorage.getItem(etagKey);
      const headers = etag ? { "If-None-Match": etag } : {};

      const response = await fetch("http://localhost:8080/api/usuarios", {
        method: "GET",
        headers,
        signal,
      });

      if (response.status === 304) {
        const cacheString = localStorage.getItem("usuarios_cache");
        if (cacheString) {
          const cache = JSON.parse(cacheString);
          setUsuarios(Array.isArray(cache.content) ? cache.content : []);
        }
        return;
      }

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const data = await response.json();
      const lista = Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : [];
      setUsuarios(lista);

      const responseETag = response.headers.get("ETag");
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
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const id = setInterval(() => fetchUsuarios(controller.signal), 15000);
    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, []);

  if (loading) return <p>Carregando usuários...</p>;

  return (
    <div className="container py-4">
      {error && <p className="text-danger">{error}</p>}

      <h1 className="h3 fw-bold mb-4">Usuários</h1>

      <div className="row g-3">
        {usuarios.map((user) => (
          <div
            key={user.id}
            className="col-12 col-sm-6 col-md-4 col-lg-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/usuario/${user.id}`)}
          >
            <div className="card shadow-sm border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3">
              <div
                className="rounded-circle overflow-hidden flex-shrink-0"
                style={{ width: "70px", height: "70px", backgroundColor: "#f0f0f0" }}
              >
                <img
                  src={user.fotoPerfil || "/placeholder.png"}
                  alt={`Foto de perfil de ${user.nome}`}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                  onError={(e) => (e.target.src = "/placeholder.png")}
                />
              </div>

              <div className="flex-grow-1 text-truncate">
                <h5 className="mb-1 text-truncate">{user.nome}</h5>
                <p className="text-muted small mb-0 text-truncate">{user.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Usuarios;
