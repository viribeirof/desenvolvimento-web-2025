import Navegacao from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FormItem from '../components/item/FormItem';
import { useAuth } from '../auth/useAuth';



const CriarItem = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
        if (!user) {
            navigate('/login');
            return;
        }

    return (
        <>
            <Navegacao />
            <Outlet />
            <FormItem />
        </>
    )
}
export default CriarItem
