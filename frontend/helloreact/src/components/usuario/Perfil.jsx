import React, { useEffect, useState, useRef, useCallback } from "react"; 
import { Container, Row, Col, Alert } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import Navegacao from "../Navbar";
import Toast from "../shared/Toast";
import { useAuth } from "../../auth/useAuth";
import { useAuthFetch } from "../../auth/useAuthFetch";
import { fetchImageWithToken } from "../shared/fetchImageWithToken";


const CarrosselItens = ({ listaItens = [], onItemClick }) => {
  const carrosselRef = useRef(null);
  const scroll = (offset) => carrosselRef.current?.scrollBy({ left: offset, behavior: "smooth" });

  if (!listaItens || listaItens.length === 0) {
    return <div className="py-4 text-center text-muted">Nenhum item nesta seção.</div>;
  }

  return (
    <div className="position-relative mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn btn-outline-secondary rounded-circle p-2" onClick={() => scroll(-300)} aria-label="Anterior">
          &#8592;
        </button>
        <button className="btn btn-outline-secondary rounded-circle p-2" onClick={() => scroll(300)} aria-label="Próximo">
          &#8594;
        </button>
      </div>

      <div ref={carrosselRef} className="d-flex overflow-auto" style={{ gap: "20px", paddingBottom: 6 }}>
        {listaItens.map((item) => (
          <article
            key={item.id}
            className="card border flex-shrink-0"
            style={{
              width: 180,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              cursor: "pointer",
              overflow: "hidden",
            }}
            onClick={() => onItemClick?.(item)}
            title={item.nome}
          >
            <div style={{ width: "100%", height: 140, backgroundColor: "#f6f7f8" }} className="overflow-hidden">
              <img
                src={item.fotoSrc ?? "/placeholder.png"}
                alt={item.nome ?? "Item"}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                loading="lazy"
              />
            </div>

            <div className="card-body p-2 text-center">
              <h6 className="mb-1 text-truncate" style={{ fontSize: 14 }}>{item.nome}</h6>
              <p className="mb-2 text-muted small text-truncate">{item.descricao ?? "—"}</p>

              <div className="d-flex align-items-center justify-content-center">
                <span className={`badge ${item.status === "DISPONIVEL" ? "bg-success" : "bg-secondary"} py-1 px-2`} style={{ fontSize: 12 }}>
                  {item.status === "DISPONIVEL" ? "Disponível" : "Indisponível"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const PerfilUsuario = ({ onEditProfile, onItemClick, onEditItem }) => {
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/avatar-placeholder.png");
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const avatarObjectUrlRef = useRef(null);
  const avatarAbortRef = useRef(null);
  const itemObjectUrlsRef = useRef(new Map()); 
  const itemAbortControllersRef = useRef(new Map());

  const cachePerfilKey = "perfil_cache";
  const cacheItensKey = "perfil_itens_cache";

  const loadImageAsUrl = useCallback(async (refOrUrl, signal) => {
    if (!refOrUrl) return null;

    if (typeof refOrUrl === "string" && (refOrUrl.startsWith("data:") || refOrUrl.startsWith("http"))) {
      return refOrUrl;
    }

    try {
      const result = await fetchImageWithToken(refOrUrl, { signal });

      if (!result) return null;
      if (result instanceof Blob) {
        const objUrl = URL.createObjectURL(result);
        return objUrl;
      }

      if (typeof result === "string") {
        return result;
      }

      if (result && typeof result.blob === "function") {
        const blob = await result.blob();
        const objUrl = URL.createObjectURL(blob);
        return objUrl;
      }

      return null;
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      console.warn("loadImageAsUrl error:", err);
      return null;
    }
  }, []);

  const fetchPerfilMe = useCallback(async () => {
    setLoading(true);
    setError(null);

    // cleanup de imagens anteriores
    itemObjectUrlsRef.current.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch (err) { console.debug("revoke item url failed", err); }
    });
    itemObjectUrlsRef.current.clear();
    itemAbortControllersRef.current.forEach((ac) => {
      try { ac.abort(); } catch (err) { console.debug("abort item controller failed", err); }
    });
    itemAbortControllersRef.current.clear();

    if (avatarAbortRef.current) {
      try { avatarAbortRef.current.abort(); } catch (err) { console.debug("abort avatar failed", err); }
      avatarAbortRef.current = null;
    }
    if (avatarObjectUrlRef.current) {
      try { URL.revokeObjectURL(avatarObjectUrlRef.current); } catch (err) { console.debug("revoke avatar url failed", err); }
      avatarObjectUrlRef.current = null;
    }

    try {
      const res = await authFetch("http://localhost:8080/api/usuarios/me", { method: "GET" });

      let perfilData = null;
      let itensData = [];

      if (res.status === 200) {
        const payload = await res.json();
        if (payload?.usuario || payload?.itens) {
          perfilData = payload.usuario ?? payload.user ?? payload;
          itensData = payload.itens ?? payload.items ?? [];
        } else if (payload?.id || payload?.email) {
          perfilData = payload;
          try {
            const itensRes = await authFetch(`http://localhost:8080/api/usuarios/${perfilData.id}/itens`, { method: "GET" });
            if (itensRes.ok) {
              itensData = await itensRes.json();
            } else {
              const itensByEmail = await authFetch(`http://localhost:8080/api/itens?ownerEmail=${encodeURIComponent(perfilData.email)}`, { method: "GET" });
              if (itensByEmail.ok) itensData = await itensByEmail.json();
            }
          } catch (err) {
            // falha ao buscar itens por id/email — não é fatal, logamos e seguiremos com fallback se houver
            if (err?.name !== "AbortError") console.warn("fetch itens for perfil failed:", err);
          }
        } else if (Array.isArray(payload)) {
          itensData = payload;
          perfilData = null;
        }
      } else if (res.status === 304) {
        const cachePerfil = localStorage.getItem(cachePerfilKey);
        const cacheItens = localStorage.getItem(cacheItensKey);
        if (cachePerfil) perfilData = JSON.parse(cachePerfil);
        if (cacheItens) itensData = JSON.parse(cacheItens);
      } else {
        const email = user?.email ?? user?.sub;
        if (email) {
          const tries = [
            `http://localhost:8080/api/usuarios/${encodeURIComponent(email)}`,
            `http://localhost:8080/api/usuarios?email=${encodeURIComponent(email)}`,
            `http://localhost:8080/api/usuarios/by-email/${encodeURIComponent(email)}`,
          ];
          for (const ep of tries) {
            try {
              const r = await authFetch(ep, { method: "GET" });
              if (r.ok) {
                perfilData = await r.json();
                break;
              }
              if (r.status === 304) {
                const cache = localStorage.getItem(cachePerfilKey);
                perfilData = cache ? JSON.parse(cache) : null;
                break;
              }
            } catch (err) {
              // tenta próximo endpoint; log em debug para não poluir produção
              if (err?.name !== "AbortError") console.debug(`try ${ep} failed:`, err);
            }
          }
        }
        if (perfilData?.id) {
          try {
            const r = await authFetch(`http://localhost:8080/api/usuarios/${perfilData.id}/itens`, { method: "GET" });
            if (r.ok) itensData = await r.json();
          } catch (err) {
            if (err?.name !== "AbortError") console.warn("fetch itens by perfil id failed:", err);
          }
        } else if (perfilData?.email || user?.email || user?.sub) {
          const owner = perfilData?.email ?? user?.email ?? user?.sub;
          try {
            const r = await authFetch(`http://localhost:8080/api/itens?ownerEmail=${encodeURIComponent(owner)}`, { method: "GET" });
            if (r.ok) itensData = await r.json();
          } catch (err) {
            if (err?.name !== "AbortError") console.warn("fetch itens by ownerEmail failed:", err);
          }
        } else {
          try {
            const all = await authFetch("http://localhost:8080/api/itens", { method: "GET" });
            if (all.ok) {
              const allData = await all.json();
              const owner = perfilData?.email ?? user?.email ?? user?.sub;
              itensData = Array.isArray(allData) ? allData.filter(it => (it.usuarioEmail ?? it.ownerEmail ?? it.owner) === owner) : [];
            }
          } catch (err) {
            if (err?.name !== "AbortError") console.warn("fallback fetch all itens failed:", err);
          }
        }
      }

      try { localStorage.setItem(cachePerfilKey, JSON.stringify(perfilData)); } catch (err) { console.debug("localStorage set perfil failed:", err); }
      try { localStorage.setItem(cacheItensKey, JSON.stringify(itensData)); } catch (err) { console.debug("localStorage set itens failed:", err); }

      let avatarUrl = "/avatar-placeholder.png";
      if (perfilData) {
        const acAvatar = new AbortController();
        avatarAbortRef.current = acAvatar;
        try {
          const avatarRef = perfilData.avatar || perfilData.avatarUrl || perfilData.foto || perfilData.fotoPerfil;
          if (avatarRef) {
            const u = await loadImageAsUrl(avatarRef, acAvatar.signal);
            if (u) {
              if (u.startsWith("blob:")) {
                avatarObjectUrlRef.current = u;
              }
              avatarUrl = u;
            }
          } else if (user?.picture) {
            avatarUrl = user.picture;
          }
        } catch (err) {
          if (err?.name !== "AbortError") console.warn("Erro ao carregar avatar:", err);
        } finally {
          avatarAbortRef.current = null;
        }
      } else if (user?.picture) {
        avatarUrl = user.picture;
      }

      const mappedItens = [];
      for (const it of (Array.isArray(itensData) ? itensData : [])) {
        let fotoUrl = "/placeholder.png";
        if (it.fotoItem) {
          const acItem = new AbortController();
          itemAbortControllersRef.current.set(it.id, acItem);
          try {
            const u = await loadImageAsUrl(it.fotoItem, acItem.signal);
            if (u) {
              if (u.startsWith("blob:")) {
                itemObjectUrlsRef.current.set(it.id, u);
              }
              fotoUrl = u;
            }
          } catch (err) {
            if (err?.name !== "AbortError") console.warn(`Erro ao carregar imagem do item ${it.id}:`, err);
            fotoUrl = "/placeholder.png";
          } finally {
            itemAbortControllersRef.current.delete(it.id);
          }
        } else if (it.fotoUrl) {
          fotoUrl = it.fotoUrl;
        }
        mappedItens.push({ ...it, fotoSrc: fotoUrl });
      }

      setPerfil(perfilData);
      setAvatarSrc(avatarUrl ?? "/avatar-placeholder.png");
      setItens(mappedItens ?? []);
      setError(null);
    } catch (err) {
      console.error("Erro geral ao carregar perfil e itens:", err);
      const cachePerfil = localStorage.getItem(cachePerfilKey);
      const cacheItens = localStorage.getItem(cacheItensKey);
      if (cachePerfil) {
        try {
          const p = JSON.parse(cachePerfil);
          setPerfil(p);
          if (p?.fotoPerfil) {
            try {
              const ac = new AbortController();
              const u = await loadImageAsUrl(p.fotoPerfil, ac.signal);
              if (u) {
                avatarObjectUrlRef.current = u.startsWith("blob:") ? u : null;
                setAvatarSrc(u);
              }
            } catch (innerErr) {
              console.debug("fallback avatar load failed:", innerErr);
            }
          }
        } catch (parseErr) {
          console.debug("parse cachePerfil failed:", parseErr);
        }
      }
      if (cacheItens) {
        try {
          const data = JSON.parse(cacheItens);
          // map to fotoSrc (no network attempt)
          const mapped = (Array.isArray(data) ? data : []).map(it => ({ ...it, fotoSrc: it.fotoUrl ?? "/placeholder.png" }));
          setItens(mapped);
        } catch (parseErr) {
          console.debug("parse cacheItens failed:", parseErr);
          setItens([]);
        }
      }

      if (!localStorage.getItem(cacheItensKey) && !localStorage.getItem(cachePerfilKey)) {
        setError("Erro ao carregar perfil e itens.");
      } else {
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch, user, loadImageAsUrl]);

  // roda periodicamente e no mount
  useEffect(() => {
    if (!authLoading) fetchPerfilMe();
    const interval = setInterval(() => { if (!authLoading) fetchPerfilMe(); }, 15000);
    return () => clearInterval(interval);
  }, [fetchPerfilMe, authLoading]);

  // cleanup final ao desmontar: aborts + revoga todos objectURLs
  useEffect(() => {
    return () => {
      if (avatarAbortRef.current) {
        try { avatarAbortRef.current.abort(); } catch (err) { console.debug("avatar abort failed", err); }
        avatarAbortRef.current = null;
      }
      if (avatarObjectUrlRef.current) {
        try { URL.revokeObjectURL(avatarObjectUrlRef.current); } catch (err) { console.debug("revoke avatar failed", err); }
        avatarObjectUrlRef.current = null;
      }
      itemAbortControllersRef.current.forEach((ac) => { try { ac.abort(); } catch (err) { console.debug("item abort failed", err); } });
      itemAbortControllersRef.current.clear();
      itemObjectUrlsRef.current.forEach((url) => {
        try { URL.revokeObjectURL(url); } catch (err) { console.debug("revoke item url failed", err); }
      });
      itemObjectUrlsRef.current.clear();
    };
  }, []);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const disponiveis = itens.filter(i => i.status === "DISPONIVEL");
  const indisponiveis = itens.filter(i => i.status !== "DISPONIVEL");

  return (
    <>
      <Navegacao />
      <Container className="my-5">
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        <div className="card p-4 rounded bg-light" profile-card style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}>
          <Row className="gy-4">
            <Col md={4} className="d-flex flex-column align-items-center">
              <div style={{ width: 140, height: 140 }} className="rounded-circle overflow-hidden mb-3 border">
                <img src={avatarSrc} alt={perfil?.nome ?? user?.name ?? "Avatar"} className="w-100 h-100" style={{ objectFit: "cover" }} onError={(e) => (e.currentTarget.src = "/avatar-placeholder.png")} />
              </div>

              <h4 className="mb-1">{perfil?.nome ?? user?.name ?? user?.email}</h4>
              <p className="text-muted mb-2" style={{ fontSize: 14 }}>{perfil?.email ?? user?.email ?? "—"}</p>

              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate(`/usuario/editar/${perfil?.id}`)}
                >
                  Editar perfil
                </button>
              </div>

              <div className="w-100 mt-2">
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Total</small>
                  <strong>{itens.length}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Disponíveis</small>
                  <strong>{disponiveis.length}</strong>
                </div>
              </div>
            </Col>

            <Col md={8}>
              <h5 className="mb-3">Meus Itens</h5>

              <section className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Disponíveis</h6>
                  <small className="text-muted">{disponiveis.length} encontrados</small>
                </div>
                <CarrosselItens listaItens={disponiveis} onItemClick={(item) => onItemClick?.(item)} />
              </section>

              <section>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Indisponíveis</h6>
                  <small className="text-muted">{indisponiveis.length} encontrados</small>
                </div>
                <CarrosselItens listaItens={indisponiveis} onItemClick={(item) => onItemClick?.(item)} />
              </section>
            </Col>
          </Row>
        </div>
      </Container>
      {error && <Toast error={error} setError={() => setError(null)} />}
    </>
  );
};

export default PerfilUsuario;
