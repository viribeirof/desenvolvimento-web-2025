import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const Contato = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />
            </Container>
            <h1>Contato</h1>
        </>
    )
}
export default Contato
