import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const Sobre = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet /> 
            </Container>
            <h1>Sobre</h1>
        </>
    )
}
export default Sobre
