// src/pages/itens/ItemDetalhes.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import Navegacao from '../components/Navbar';
import ItemDetalhes from "../components/item/ItemDetalhes";
import { useAuthFetch } from "../auth/useAuthFetch";
import { useAuth } from "../auth/useAuth";
import { fetchImageWithToken } from "../components/shared/fetchImageWithToken";

const MostrarItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { user, authLoading } = useAuth();

  const [item, setItem] = useState(null);
  const [fotoCache, setFotoCache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [owner, setOwner] = useState({ nome: "", email: "", id: null, fotoSrc: null });

  const imgObjectUrlRef = useRef(null);
  const imgAbortRef = useRef(null);

  const ownerObjectUrlRef = useRef(null);
  const ownerAbortRef = useRef(null);

  const mainAbortRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    let mounted = true;
    mountedRef.current = true;
    const controller = new AbortController();
    mainAbortRef.current = controller;

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await authFetch(`http://localhost:8080/api/itens/${id}`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => `Erro HTTP ${res.status}`);
          if (res.status === 401 || res.status === 403) {
            navigate("/login", { replace: true });
          }
          throw new Error(`Falha ao carregar item ${id}: ${errorText}`);
        }

        if (!mountedRef.current) return;
        const data = await res.json();
        setItem(data);
        setError(null);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Erro ao buscar item:", err);
        if (!mountedRef.current) return;
        setError("Não foi possível carregar os detalhes do item. Tente novamente mais tarde.");
        setItem(null);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchItem();

    return () => {
      mounted = false;
      mountedRef.current = false;
      try { controller.abort(); } catch { }
      mainAbortRef.current = null;
    };
  }, [user, id, authFetch, navigate]);

  useEffect(() => {
    if (imgObjectUrlRef.current) {
      try { URL.revokeObjectURL(imgObjectUrlRef.current); } catch { }
      imgObjectUrlRef.current = null;
    }
    if (imgAbortRef.current) {
      try { imgAbortRef.current.abort(); } catch { }
      imgAbortRef.current = null;
    }

    if (!item) {
      setFotoCache(null);
      return;
    }

    if (!item.fotoItem) {
      setFotoCache(item.fotoSrc ?? "/placeholder.png");
      return;
    }

    const ac = new AbortController();
    imgAbortRef.current = ac;

    const carregar = async () => {
      try {
        const result = await fetchImageWithToken(item.fotoItem, { signal: ac.signal });
        if (!result) {
          setFotoCache("/placeholder.png");
          return;
        }

        if (result instanceof Blob) {
          const objUrl = URL.createObjectURL(result);
          imgObjectUrlRef.current = objUrl;
          setFotoCache(objUrl);
          return;
        }

        if (typeof result === "string") {
          setFotoCache(result);
          return;
        }

        if (result && typeof result.blob === "function") {
          const blob = await result.blob();
          const objUrl = URL.createObjectURL(blob);
          imgObjectUrlRef.current = objUrl;
          setFotoCache(objUrl);
          return;
        }

        setFotoCache("/placeholder.png");
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.warn("Erro ao carregar imagem do item:", err);
        setFotoCache("/placeholder.png");
      } finally {
        if (imgAbortRef.current === ac) imgAbortRef.current = null;
      }
    };

    carregar();

    return () => {
      if (imgAbortRef.current) {
        try { imgAbortRef.current.abort(); } catch { }
        imgAbortRef.current = null;
      }
      if (imgObjectUrlRef.current) {
        try { URL.revokeObjectURL(imgObjectUrlRef.current); } catch { }
        imgObjectUrlRef.current = null;
      }
    };
  }, [item]);

  useEffect(() => {
    if (ownerObjectUrlRef.current) {
      try { URL.revokeObjectURL(ownerObjectUrlRef.current); } catch { }
      ownerObjectUrlRef.current = null;
    }
    if (ownerAbortRef.current) {
      try { ownerAbortRef.current.abort(); } catch { }
      ownerAbortRef.current = null;
    }
    if (!item || !item.usuarioId) {
      setOwner({ nome: item?.nomeUsuario ?? "", email: item?.userEmail ?? "", id: item?.usuarioId ?? null, fotoSrc: null });
      return;
    }

    const ac = new AbortController();
    ownerAbortRef.current = ac;

    const carregarOwner = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/api/usuarios/${encodeURIComponent(item.usuarioId)}`, {
          method: "GET",
          signal: ac.signal,
        });

        if (!res.ok) {
          setOwner({
            nome: item.nomeUsuario ?? "",
            email: item.userEmail ?? "",
            id: item.usuarioId ?? null,
            fotoSrc: null
          });
          return;
        }

        const userData = await res.json();

        const ownerInfo = {
          nome: userData.nome ?? item.nomeUsuario ?? "",
          email: userData.email ?? item.userEmail ?? "",
          id: userData.id ?? item.usuarioId ?? null,
          fotoSrc: null
        };

        const possibleRefs = [
          userData.fotoPerfil,
          item.fotoPerfil
        ].filter(Boolean);

        let assignedFoto = null;

        for (const ref of possibleRefs) {
          if (typeof ref === "string" && (ref.startsWith("http") || ref.startsWith("data:") || ref.startsWith("blob:"))) {
            assignedFoto = ref;
            break;
          }
        }

        if (assignedFoto) {
          ownerInfo.fotoSrc = assignedFoto;
          setOwner(ownerInfo);
          return;
        }
        setOwner(ownerInfo);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.warn("Erro ao carregar dados do proprietário:", err);
        setOwner({
          nome: item.nomeUsuario ?? "",
          email: item.userEmail ?? "",
          id: item.usuarioId ?? null,
          fotoSrc: null
        });
      } finally {
        if (ownerAbortRef.current === ac) ownerAbortRef.current = null;
      }
    };

    carregarOwner();

    return () => {
      if (ownerAbortRef.current) {
        try { ownerAbortRef.current.abort(); } catch { }
        ownerAbortRef.current = null;
      }
      if (ownerObjectUrlRef.current) {
        try { URL.revokeObjectURL(ownerObjectUrlRef.current); } catch { }
        ownerObjectUrlRef.current = null;
      }
    };
  }, [item, authFetch]);

  const handleEdit = () => navigate(`/item/editar/${id}`);

  if (authLoading) return null;

  return (
    <>
      <Navegacao />
      <Outlet />
      <ItemDetalhes
        user={user}
        item={item}
        fotoCache={fotoCache}
        loading={loading}
        error={error}
        setError={setError}
        onEdit={handleEdit}
        ownerInfo={owner}
      />
    </>
  );
};

export default MostrarItem;
