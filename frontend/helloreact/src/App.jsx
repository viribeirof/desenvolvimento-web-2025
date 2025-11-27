import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ListarItens from "./pages/ListarItens.jsx";
import Login from './pages/login.jsx';
import { useAuth } from "./auth/useAuth.jsx";

const App = () => {

    const { user, authLoading } = useAuth();

    if (authLoading) {
        return <p>Carregando...</p>; 
    }
    return (
        <>
            <Container className="mt-3">
                <Outlet />
                {user && <ListarItens />}
                {!user && <Login />}
            </Container>
        </>
    )
}
export default App