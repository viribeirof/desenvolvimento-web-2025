import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate, Outlet } from "react-router-dom";
import { Container, Alert } from "react-bootstrap";
import Navegacao from "../components/Navbar";
import ItemBusca from "../components/item/ItemBusca";
import Itens from "../components/item/Itens";
import { useAuthFetch } from "../auth/useAuthFetch";
import { useAuth } from "../auth/useAuth";
import { fetchImageWithToken } from "../components/shared/fetchImageWithToken";
import Toast from "../components/shared/Toast";
import '../assets/App.css'

const carregarFotos = async (itens) => {
    return await Promise.all(
        itens.map(async (item) => ({
            ...item,
            fotoSrc: item.fotoItem ? await fetchImageWithToken(item.fotoItem) : "/placeholder.png",
        }))
    );
};

const ListarItens = () => {

    const navigate = useNavigate();
    const { user, authLoading } = useAuth();
    const authFetch = useAuthFetch();

    const [itens, setItens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const cacheKey = "itens_cache";

    const fetchItens = useCallback(async () => {
        try {
            const res = await authFetch("http://localhost:8080/api/itens", { method: "GET" });
            let data = [];

            if (res.status === 200) {
                data = await res.json();
                try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { }
            } else if (res.status === 304) {
                const cache = localStorage.getItem(cacheKey);
                data = cache ? JSON.parse(cache) : [];
            } else {
                const body = await res.json().catch(() => null);
                throw new Error(body?.erro || `Erro HTTP: ${res.status}`);
            }

            const mapped = await carregarFotos(Array.isArray(data) ? data : []);
            setItens(mapped);
            setError(null);
        } catch (err) {
            const cache = localStorage.getItem(cacheKey);
            if (cache) {
                try {
                    const data = JSON.parse(cache);
                    const mapped = await carregarFotos(Array.isArray(data) ? data : []);
                    setItens(mapped);
                } catch {
                    setItens([]);
                }
            } else {
                setItens([]);
            }

            if (!localStorage.getItem(cacheKey)) {
                setError("Erro ao carregar itens.");
            } else {
                setError(null);
            }
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchItens();
        const interval = setInterval(fetchItens, 10000);
        return () => clearInterval(interval);
    }, [fetchItens]);

    if (authLoading) return null;
    if (loading) return <p className="text-info text-center mt-5">Carregando itens...</p>;
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    const itensFiltrados = itens.filter((item) =>
        item.nome.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />

                {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                <ItemBusca
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar itens por nome..."
                />

                <Itens
                    itens={itensFiltrados}
                    onItemClick={(item) => navigate(`/item/${item.id}`)}
                    currentUserId={user?.sub}
                    isAdmin={user?.papel === 1}
                />
            </Container>
        </>
    );
};

export default ListarItens;
