// src/pages/UsuarioDetalhes.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import Navegacao from "../Navbar";
import { Container, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";
import Toast from "../shared/Toast";
import { fetchImageWithToken } from "../shared/fetchImageWithToken";
import CarrosselItens from "../item/CarrosselItens";

import '../../assets/PerfilUsuario.css';
import '../../assets/CriarItem.css';
import '../../assets/App.css';

const UsuarioDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();

  const [usuario, setUsuario] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/avatar-placeholder.png");
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const objectUrlsRef = useRef([]);
  const imgAbortRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user && !authLoading) return;

    const ac = new AbortController();
    const signal = ac.signal;
    let mounted = true;

    const revokeAll = () => {
      objectUrlsRef.current.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });
      objectUrlsRef.current = [];
    };

    const carregarImagem = async (refOrUrl) => {
      if (!refOrUrl) return null;
      if (typeof refOrUrl === "string" && (refOrUrl.startsWith("http") || refOrUrl.startsWith("data:") || refOrUrl.startsWith("blob:"))) {
        return refOrUrl;
      }
      try {
        const result = await fetchImageWithToken(refOrUrl, { signal });
        if (!result) return null;
        if (result instanceof Blob) {
          const objUrl = URL.createObjectURL(result);
          objectUrlsRef.current.push(objUrl);
          return objUrl;
        }
        if (typeof result === "string") return result;
        if (result && typeof result.blob === "function") {
          const blob = await result.blob();
          const objUrl = URL.createObjectURL(blob);
          objectUrlsRef.current.push(objUrl);
          return objUrl;
        }
        return null;
      } catch (err) {
        if (err?.name === "AbortError") return null;
        console.warn("Erro ao carregar imagem:", err);
        return null;
      }
    };

    const fetchUsuarioEItens = async () => {
      setLoading(true);
      setError(null);

      try {
        const usuarioRes = await authFetch(`http://localhost:8080/api/usuarios/${encodeURIComponent(id)}`, { method: "GET", signal });
        if (!usuarioRes.ok) {
          const body = await usuarioRes.json().catch(() => null);
          throw new Error(body?.message || `Erro ao buscar usuário: ${usuarioRes.status}`);
        }
        const usuarioData = await usuarioRes.json();
        if (!mounted) return;
        setUsuario(usuarioData ?? null);

        const avatarRef = usuarioData?.avatar || usuarioData?.avatarUrl || usuarioData?.fotoPerfil || usuarioData?.foto || null;
        if (avatarRef) {
          const a = await carregarImagem(avatarRef);
          if (a) setAvatarSrc(a);
          else setAvatarSrc("/avatar-placeholder.png");
        } else {
          setAvatarSrc("/avatar-placeholder.png");
        }

        const itensRes = await authFetch(`http://localhost:8080/api/usuarios/${encodeURIComponent(id)}/itens`, { method: "GET", signal });
        let itensArr = [];
        if (itensRes.ok) itensArr = await itensRes.json();

        const fotosPromises = (Array.isArray(itensArr) ? itensArr : []).map(async (it) => {
          if (it.fotoSrc) return it.fotoSrc;
          if (it.fotoItem && typeof it.fotoItem === "string" && it.fotoItem.startsWith("http")) return it.fotoItem;
          if (it.fotoItem) {
            const u = await carregarImagem(it.fotoItem);
            return u ?? it.fotoUrl ?? "/placeholder.png";
          }
          return it.fotoUrl ?? "/placeholder.png";
        });

        const fotos = await Promise.all(fotosPromises);
        const mapped = (Array.isArray(itensArr) ? itensArr : []).map((it, idx) => ({ ...it, fotoSrc: fotos[idx] ?? it.fotoSrc ?? "/placeholder.png" }));

        if (!mounted) return;
        setItens(mapped);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Erro ao carregar usuário/itens:", err);
        setError(err.message || "Erro ao carregar dados do usuário.");
        setUsuario(null);
        setItens([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsuarioEItens();

    return () => {
      mounted = false;
      try { ac.abort(); } catch {}
      revokeAll();
    };
  }, [id, authFetch, authLoading, user]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
      objectUrlsRef.current = [];
      if (imgAbortRef.current) {
        try { imgAbortRef.current.abort(); } catch {}
        imgAbortRef.current = null;
      }
    };
  }, []);

  if (authLoading) return null;
  if (loading) return (
    <>
      <Navegacao />
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <Spinner animation="border" />
      </Container>
    </>
  );

  return (
    <>
      <Navegacao />
      <Outlet />

      <Container fluid className="lux-bg d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="profile-wrapper" style={{ width: "100%", maxWidth: 1200 }}>
          <div className="glass-card profile-card">
            {error && <div className="p-3"><Toast error={error} setError={() => setError(null)} /></div>}

            {!usuario ? (
              <div className="p-4 text-center">
                <Alert variant="warning">Usuário não encontrado.</Alert>
              </div>
            ) : (
              <>
                <div className="profile-header">
                  <div className="profile-avatar-frame">
                    <div className="profile-avatar">
                      <img
                        src={avatarSrc}
                        alt={usuario?.nome ?? "Avatar"}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/avatar-placeholder.png"; }}
                      />
                    </div>
                    <div className="avatar-badge">
                      <span className="badge badge-special">{usuario?.nome}</span>
                    </div>
                  </div>

                  <div className="profile-headinfo">
                    <h4 className="profile-name">{usuario?.nome}</h4>
                    <p className="profile-email muted">{usuario?.email ?? "—"}</p>

                    <div className="d-flex align-items-center gap-2 mt-2 justify-content-center justify-content-sm-start">
                      {user?.id === String(usuario?.id) ? (
                        <button className="btn-edit" onClick={() => navigate(`/usuario/editar/${usuario?.id}`)}>Editar perfil</button>
                      ) : (
                        <button className="btn-outline-light" onClick={() => navigate(-1)}>Voltar</button>
                      )}
                    </div>
                  </div>

                  <div className="profile-stats-panel d-flex flex-row justify-content-between flex-sm-column gap-3">
                    <div className="stat">
                      <small className="muted">Total</small>
                      <strong>{itens.length}</strong>
                    </div>
                    <div className="stat">
                      <small className="muted">Disponíveis</small>
                      <strong>{itens.filter(i => i.status === "DISPONIVEL").length}</strong>
                    </div>
                  </div>
                </div>

                <div className="profile-body">
                  <h5 className="section-title">Itens de {usuario?.nome}</h5>

                  <section className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Todos</h6>
                      <small className="muted">{itens.length} encontrados</small>
                    </div>

                    <div className="carrossel-wrapper shop-carousel">
                      <CarrosselItens listaItens={itens} onItemClick={(item) => navigate(`/item/${item.id}`)} />
                    </div>
                  </section>

                  <section className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Disponíveis</h6>
                      <small className="muted">{itens.filter(i => i.status === "DISPONIVEL").length} encontrados</small>
                    </div>

                    <div className="carrossel-wrapper shop-carousel">
                      <CarrosselItens listaItens={itens.filter(i => i.status === "DISPONIVEL")} onItemClick={(item) => navigate(`/item/${item.id}`)} />
                    </div>
                  </section>

                  <section>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Indisponíveis</h6>
                      <small className="muted">{itens.filter(i => i.status !== "DISPONIVEL").length} encontrados</small>
                    </div>

                    <div className="carrossel-wrapper shop-carousel">
                      <CarrosselItens listaItens={itens.filter(i => i.status !== "DISPONIVEL")} onItemClick={(item) => navigate(`/item/${item.id}`)} />
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>

          <div className="bg-decor" aria-hidden="true">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="dot dot-3" />
          </div>
        </div>
      </Container>
    </>
  );
};

export default UsuarioDetalhes;
