import Contador from "./Contador.jsx";
import Feed from "./Feed.jsx";
import FeedFiltravel from "./FeedFiltravel.jsx";
import NovoPost from "./NovoPost.jsx";
import Perfil from "./Perfil.jsx";
import Saudacao from "./Saudacao.jsx";
import Navegacao from './Navbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';



const App = () => {
    return (
        <>
            <Navegacao />
            <Container className="mt-3">
                <Outlet />
            </Container>
            <Perfil />
            <Saudacao nome="Ester" />
            <Contador />
            <Feed />
            <NovoPost />
            <FeedFiltravel />
        </>
    )
}
export default App
