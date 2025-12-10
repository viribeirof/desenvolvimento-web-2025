import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import Navegacao from "../Navbar";
import Toast from "../shared/Toast";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";
import { fetchImageWithToken } from "../shared/fetchImageWithToken";
import CarrosselItens from "../item/CarrosselItens"
import '../../assets/PerfilUsuario.css';
import '../../assets/CriarItem.css';
import "../../assets/App.css"


const PerfilUsuario = ({ onEditProfile, onItemClick: parentOnItemClick, onEditItem }) => {
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/avatar-placeholder.png");
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const objectUrlsRef = useRef([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setError("Usuário inválido.");
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    const signal = ac.signal;

    const revokeAll = () => {
      objectUrlsRef.current.forEach((u) => {
        URL.revokeObjectURL(u);
      });
      objectUrlsRef.current = [];
    };

    const loadImage = async (refOrUrl) => {
      if (!refOrUrl) return null;
      if (typeof refOrUrl === "string" && (refOrUrl.startsWith("http") || refOrUrl.startsWith("data:") || refOrUrl.startsWith("blob:"))) {
        return refOrUrl;
      }
      try {
        const result = await fetchImageWithToken(refOrUrl, { signal });
        if (!result) return null;
        if (result instanceof Blob) {
          const url = URL.createObjectURL(result);
          objectUrlsRef.current.push(url);
          return url;
        }
        if (typeof result === "string") return result;
        if (result && typeof result.blob === "function") {
          const blob = await result.blob();
          const url = URL.createObjectURL(blob);
          objectUrlsRef.current.push(url);
          return url;
        }
        return null;
      } catch (err) {
        if (err?.name === "AbortError") return null;
        console.warn("Erro ao carregar imagem:", err);
        return null;
      }
    };

    const fetchPerfilEItens = async () => {
      setLoading(true);
      setError(null);
      try {
        const perfilRes = await authFetch(`http://localhost:8080/api/usuarios/${user.id}`, { method: "GET", signal });
        if (!perfilRes.ok) throw new Error(`Erro ao buscar perfil: ${perfilRes.status}`);
        const perfilData = await perfilRes.json();
        setPerfil(perfilData ?? null);

        const itensRes = await authFetch(`http://localhost:8080/api/usuarios/${user.id}/itens`, { method: "GET", signal });
        let itensData = [];
        if (itensRes.ok) itensData = await itensRes.json();

        const avatarRef = perfilData?.fotoPerfil
        if (avatarRef) {
          const u = await loadImage(avatarRef);
          if (u) setAvatarSrc(u);
        } else {
          setAvatarSrc("/avatar-placeholder.png");
        }

        const itemsArr = Array.isArray(itensData) ? itensData : [];
        const fotosPromises = itemsArr.map(async (it) => {
          if (it.fotoSrc) return it.fotoSrc;
          if (it.fotoItem && typeof it.fotoItem === "string" && it.fotoItem.startsWith("http")) return it.fotoItem;
          if (it.fotoItem) {
            const u = await loadImage(it.fotoItem);
            return u ?? it.fotoUrl ?? "/placeholder.png";
          }
          return it.fotoUrl ?? "/placeholder.png";
        });

        const fotos = await Promise.all(fotosPromises);
        const mapped = itemsArr.map((it, idx) => ({ ...it, fotoSrc: fotos[idx] ?? it.fotoSrc ?? "/placeholder.png" }));

        setItens(mapped);
        setError(null);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Erro ao carregar perfil/itens:", err);
        setError("Erro ao carregar perfil e itens.");
        setItens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfilEItens();

    return () => {
       ac.abort();
      revokeAll();
    };
  }, [authFetch, authLoading, user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const disponiveis = itens.filter(i => i.status === "DISPONIVEL");
  const indisponiveis = itens.filter(i => i.status !== "DISPONIVEL");

  const handleItemClick = (item) => {
    parentOnItemClick?.(item);
    navigate(`/item/${item.id}`);
  };

  return (
    <>
      <Navegacao />

      <Container fluid className="lux-bg d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}

        <div className="profile-wrapper">
          <div className="glass-card profile-card">
            <div className="profile-header">
              <div className="profile-avatar-frame">
                <div className="profile-avatar">
                  <img
                    src={avatarSrc}
                    alt={perfil?.nome ?? user?.name ?? "Avatar"}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/avatar-placeholder.png"; }}
                  />
                </div>
                <div className="avatar-badge">
                  <span className="badge badge-special">{perfil?.nome}</span>
                </div>
              </div>

              <div className="profile-headinfo">
                <h4 className="profile-name">{perfil?.nome ?? user?.name ?? user?.email}</h4>
                <p className="profile-email muted">{perfil?.email ?? user?.email ?? "—"}</p>

                <div className="d-flex align-items-center gap-2 mt-2 justify-content-center justify-content-sm-start">
                  <button className="btn-edit" onClick={() => navigate(`/usuario/editar/${perfil?.id}`)}>
                    Editar perfil
                  </button>
                </div>

              </div>

              <div className="
                  profile-stats-panel 
                  d-flex 
                  flex-row 
                  justify-content-between 
                  flex-sm-column 
                  gap-3
                ">
                <div className="stat">
                  <small className="muted">Total</small>
                  <strong>{itens.length}</strong>
                </div>
                <div className="stat">
                  <small className="muted">Disponíveis</small>
                  <strong>{disponiveis.length}</strong>
                </div>
              </div>


            </div>

            <div className="profile-body">
              <h5 className="section-title">Meus Itens</h5>
              <section className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Todos</h6>
                  <small className="muted">{itens.length} encontrados</small>
                </div>

                <div className="carrossel-wrapper shop-carousel">
                  <CarrosselItens listaItens={itens} onItemClick={handleItemClick} />
                </div>
              </section>
              <section className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Disponíveis</h6>
                  <small className="muted">{disponiveis.length} encontrados</small>
                </div>

                <div className="carrossel-wrapper shop-carousel">
                  <CarrosselItens listaItens={disponiveis} onItemClick={handleItemClick} />
                </div>
              </section>

              <section>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Indisponíveis</h6>
                  <small className="muted">{indisponiveis.length} encontrados</small>
                </div>

                <div className="carrossel-wrapper shop-carousel">
                  <CarrosselItens listaItens={indisponiveis} onItemClick={handleItemClick} />
                </div>
              </section>
            </div>
          </div>

          <div className="bg-decor" aria-hidden="true">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="dot dot-3" />
          </div>
        </div>
      </Container>
      {error && <Toast error={error} setError={() => setError(null)} />}
    </>
  );
};

export default PerfilUsuario;
