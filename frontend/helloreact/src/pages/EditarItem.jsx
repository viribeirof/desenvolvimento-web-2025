import Navegacao from '../components/Navbar';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../auth/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AtualizarItem from '../components/item/AtualizarItem';
import { useAuthFetch } from '../auth/useAuthFetch';

const EditarItem = () => {
    const { id } = useParams();
    const { user, authLoading } = useAuth();
    const authFetch = useAuthFetch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [itemExists, setItemExists] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const ac = new AbortController();

        const verificarItem = async () => {
            try {
                const resp = await authFetch(`http://localhost:8080/api/itens/${id}`, { signal: ac.signal });
                if (!resp.ok) throw new Error('Item não encontrado');
                const data = await resp.json();
                if (!data || data.usuarioId !== user.id || data.status !== 'DISPONIVEL') {
                    navigate('/item');
                    return;
                }
                setItemExists(true); 
                navigate('/item');
            } finally {
                setLoading(false);
            }
        };

        verificarItem();

        return () => ac.abort();
    }, [authLoading, user, id, authFetch, navigate]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
            </div>
        );
    }

    if (!itemExists) return null;

    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <AtualizarItem />
            </Container>
        </>
    );
};

export default EditarItem;
