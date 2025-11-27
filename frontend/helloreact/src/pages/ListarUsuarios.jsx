import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Usuarios from '../components/usuario/Usuarios';

const ListarUsuarios = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />
                <Usuarios />
            </Container>
        </>
    )
}
export default ListarUsuarios
