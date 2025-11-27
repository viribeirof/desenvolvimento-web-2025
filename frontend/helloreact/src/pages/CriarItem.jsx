import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import FormItem from '../components/item/FormItem';

const CriarItem = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />
                <FormItem />
            </Container>
        </>
    )
}
export default CriarItem
