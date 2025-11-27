import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Usuarios from '../components/usuario/Usuarios';
import RequestsEnviadas from '../components/usuario/RequestsEnviadas';

const Solicitacoes = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />
                <RequestsEnviadas />
            </Container>
        </>
    )
}
export default Solicitacoes
