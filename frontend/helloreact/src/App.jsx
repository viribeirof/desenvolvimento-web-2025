import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ListarItens from "./pages/ListarItens.jsx";
import Login from './pages/login.jsx';
import { useAuth } from "./auth/useAuth.jsx";
import './assets/Login.css'
import './assets/App.css'
const App = () => {

    const { user, authLoading } = useAuth();

    if (authLoading) {
        return <p>Carregando...</p>;
    }
    return (
        <>
                <Outlet />
                {user && <ListarItens />}
                {!user && <Login />}
        </>
    )
}
export default App