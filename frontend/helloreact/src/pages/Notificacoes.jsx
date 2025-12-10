import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import RequestsRecebidas from '../components/usuario/Notificacoes';

const Notificacoes = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />
                <RequestsRecebidas />   
            </Container>
        </>
    )
}
export default Notificacoes
