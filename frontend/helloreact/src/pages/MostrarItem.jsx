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

  const imgObjectUrlRef = useRef(null);
  const imgAbortRef = useRef(null);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    let mounted = true;
    const controller = new AbortController();

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
          navigate("/login", { replace: true });
          throw new Error(`Falha ao carregar item ${id}: ${errorText}`);
        }

        if (!mounted) return;
        const data = await res.json();
        setItem(data);
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        console.error("Erro ao buscar item:", err);
        if (!mounted) return;
        setError("Não foi possível carregar os detalhes do item. Tente novamente mais tarde.");
        setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchItem();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [user, authFetch, id, navigate]);

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
      setFotoCache("/placeholder.png");
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
        if (err?.name === "AbortError") {
          return;
        }
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

  const handleEdit = () => navigate(`/item/editar/${id}`);

  if (authLoading) return null;

  console.log(item);

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
        onEdit={handleEdit}
      />
    </>
  );
};

export default MostrarItem;
