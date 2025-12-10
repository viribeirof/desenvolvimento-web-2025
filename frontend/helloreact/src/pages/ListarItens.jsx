import { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate, Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Navegacao from "../components/Navbar";
import ItemBusca from "../components/item/ItemBusca";
import Itens from "../components/item/Itens";
import { useAuthFetch } from "../auth/useAuthFetch";
import { useAuth } from "../auth/useAuth";
import '../assets/TelaItens.css';
import '../assets/ItemDetalhes.css';
import '../assets/CriarItem.css';
import '../assets/PerfilUsuario.css';
import "../assets/App.css"

const ListarItens = () => {
  
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const abortRef = useRef(null);
  const mountedRef = useRef(true);
  const objectUrlsRef = useRef([]); 

  useEffect(() => {
    mountedRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;

    const fetchFotoParaItem = async (item, signal) => {
      try {
        if (item.fotoSrc) return item.fotoSrc;
        if (item.fotoItem && typeof item.fotoItem === "string" && item.fotoItem.startsWith("http")) {
          return item.fotoItem;
        }
        const fotoEndpoint = `http://localhost:8080/api/itens/${item.id}/foto`;
        const res = await authFetch(fotoEndpoint, { method: "GET", signal });
        if (!res.ok) return null;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlsRef.current.push(url);
        return url;
      } catch (err) {
        if (err && err.name === "AbortError") return null;
        console.warn("Erro ao buscar foto do item", item.id, err);
        return null;
      }
    };

    const fetchItens = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch("http://localhost:8080/api/itens", {
          method: "GET",
          signal: ac.signal,
        });

        if (res.status === 200) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : [];

          const fotosPromises = arr.map((it) => fetchFotoParaItem(it, ac.signal));
          const fotos = await Promise.all(fotosPromises);

          const mapped = arr.map((it, idx) => {
            const fotoSrc = fotos[idx] || it.fotoSrc || "/shopping-bag.png";
            return { ...it, fotoSrc };
          });

          if (mountedRef.current) setItens(mapped);
        } else {
          const body = await res.json().catch(() => null);
          throw new Error(body?.erro || `Erro HTTP: ${res.status}`);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Erro ao buscar itens:", err);
        if (mountedRef.current) {
          setError("Erro ao carregar itens.");
          setItens([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchItens();

    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch { }
      }
      objectUrlsRef.current.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
      objectUrlsRef.current = [];
    };
  }, [authFetch]);

  if (authLoading) return null;
  if (loading) return <p className="text-light text-center mt-5">Carregando itens...</p>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const itensFiltrados = itens.filter((item) =>
    item.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navegacao />
      <Outlet />

      <Container fluid className="lux-bg d-flex justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="profile-wrapper" style={{ width: "100%", maxWidth: 1200 }}>
           <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4 w-100">
                <ItemBusca
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar itens por nome..."
                />
              </div>
          <div className="glass-card profile-card">
            <div className="profile-body">
             

              <section className="section-block mb-4">
                <div className="carrossel-wrapper shop-carousel">
                  <Itens
                    itens={itensFiltrados}
                    onItemClick={(item) => navigate(`/item/${item.id}`)}
                    userId={user?.id}
                  />
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
    </>
  );
};

export default ListarItens;
