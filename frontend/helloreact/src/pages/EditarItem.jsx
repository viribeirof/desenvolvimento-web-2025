import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AtualizarItem from '../components/item/AtualizarItem';

const EditarItem = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />
                <AtualizarItem />
            </Container>
        </>
    )
}
export default EditarItem
