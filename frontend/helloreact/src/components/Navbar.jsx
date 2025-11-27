import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";


const Navegacao = () => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg"> <Container className="bg-dark">
      <Navbar.Brand as={Link} to="/">Home</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav"> <Nav className="me-auto">
        <Nav.Link as={Link} to="/item">Itens</Nav.Link>
        <Nav.Link as={Link} to="/item/criar">Criar Item</Nav.Link>
        <Nav.Link as={Link} to={`/usuario/notificacao`}>Notificações</Nav.Link>
        <Nav.Link as={Link} to={`/usuario/perfil`}>Perfil</Nav.Link>
        <Nav.Link as={Link} to={"/requests/enviadas"}>Solicitações</Nav.Link> </Nav>
        {user && (<div className="d-flex align-items-center gap-2">
          <Navbar.Text className="text-white">
            {user.sub}
          </Navbar.Text> <Button variant="outline-light" size="sm" onClick={logout}>
            Logout </Button> </div>
        )}
      </Navbar.Collapse> </Container> </Navbar>
  );
};

export default Navegacao;
