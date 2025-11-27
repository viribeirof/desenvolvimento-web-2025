// src/pages/UsuarioDetalhes.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import Navegacao from "../Navbar";
import { Container } from "react-bootstrap";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";
import Toast from "../shared/Toast";
import { fetchImageWithToken } from "../shared/fetchImageWithToken";

const UsuarioDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/placeholder.png");

  const imgObjectUrlRef = useRef(null);
  const imgAbortRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user && !authLoading) return;

    let mounted = true;
    const controller = new AbortController();
    const cacheKey = `usuario_${id}_cache`;

    const loadUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await authFetch(`http://localhost:8080/api/usuarios/${encodeURIComponent(id)}`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!mounted) return;

        if (resp.status === 200) {
          const data = await resp.json();
          setUsuario(data);
          try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
        } else if (resp.status === 304) {
          const cache = localStorage.getItem(cacheKey);
          if (cache) {
            const cached = JSON.parse(cache);
            setUsuario(cached);
          } else {
            setError("Nenhum dado em cache.");
          }
        } else {
          const body = await resp.json().catch(() => null);
          throw new Error(body?.message || `Erro ao carregar usuário: ${resp.status}`);
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        console.error("Erro ao carregar usuário:", err);
        const cache = localStorage.getItem(cacheKey);
        if (cache) {
          try {
            setUsuario(JSON.parse(cache));
            setError(null);
          } catch {
            setUsuario(null);
            setError("Erro ao carregar usuário.");
          }
        } else {
          setUsuario(null);
          setError(err.message || "Erro ao carregar usuário.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id, authFetch, authLoading, user]);

  useEffect(() => {
    if (imgAbortRef.current) {
      try { imgAbortRef.current.abort(); } catch {}
      imgAbortRef.current = null;
    }
    if (imgObjectUrlRef.current) {
      try { URL.revokeObjectURL(imgObjectUrlRef.current); } catch {}
      imgObjectUrlRef.current = null;
    }

    if (!usuario) {
      setAvatarSrc("/placeholder.png");
      return;
    }

    const foto = usuario.fotoPerfil ?? usuario.avatar ?? usuario.avatarUrl ?? null;
    if (!foto) {
      setAvatarSrc("/placeholder.png");
      return;
    }

    if (typeof foto === "string" && (foto.startsWith("data:") || foto.startsWith("http"))) {
      setAvatarSrc(foto);
      return;
    }

    const ac = new AbortController();
    imgAbortRef.current = ac;

    const carregar = async () => {
      try {
        const result = await fetchImageWithToken(foto, { signal: ac.signal });

        if (!result) {
          setAvatarSrc("/placeholder.png");
          return;
        }

        // se result for um Blob 
        if (result instanceof Blob) {
          const objUrl = URL.createObjectURL(result);
          imgObjectUrlRef.current = objUrl;
          setAvatarSrc(objUrl);
          return;
        }

        // se for string (URL)
        if (typeof result === "string") {
          setAvatarSrc(result);
          return;
        }

        // se for Response-like, tenta extrair blob
        if (result && typeof result.blob === "function") {
          const blob = await result.blob();
          const objUrl = URL.createObjectURL(blob);
          imgObjectUrlRef.current = objUrl;
          setAvatarSrc(objUrl);
          return;
        }
        setAvatarSrc("/placeholder.png");
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        console.warn("Erro ao carregar avatar:", err);
        setAvatarSrc("/placeholder.png");
      } finally {
        if (imgAbortRef.current === ac) imgAbortRef.current = null;
      }
    };

    carregar();

    // cleanup quando usuario muda/desmonta
    return () => {
      if (imgAbortRef.current) {
        try { imgAbortRef.current.abort(); } catch {}
        imgAbortRef.current = null;
      }
      if (imgObjectUrlRef.current) {
        try { URL.revokeObjectURL(imgObjectUrlRef.current); } catch {}
        imgObjectUrlRef.current = null;
      }
    };
  }, [usuario]);

  if (authLoading) return null;
  if (loading) return <p className="text-center mt-4">Carregando usuário...</p>;

  return (
    <>
      <Navegacao />
      <Container className="mt-3">
        <Outlet />

        {error && <Toast error={error} setError={() => setError(null)} />}

        {!usuario ? (
          <div className="mt-4 text-center">
            <p>Usuário não encontrado.</p>
          </div>
        ) : (
          <div className="mt-4">
            <h2>{usuario.nome}</h2>
            <p><b>Email:</b> {usuario.email}</p>

            <div
              className="rounded-circle overflow-hidden flex-shrink-0"
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#f0f0f0",
              }}
            >
              <img
                src={avatarSrc}
                alt={`Foto de perfil de ${usuario.nome}`}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>

            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/usuario/editar/${id}`)}
              >
                Editar Usuário
              </button>
            </div>
          </div>
        )}
      </Container>
    </>
  );
};

export default UsuarioDetalhes;
