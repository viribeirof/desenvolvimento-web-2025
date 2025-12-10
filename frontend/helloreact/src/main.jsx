import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Sobre from "./pages/ListarItens.jsx";
import Contato from "./pages/CriarItem.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import CriarUsuario from "./components/usuario/CriarUsuario.jsx";
import AtualizarUsuario from "./components/usuario/AtualizarUsuario.jsx";
import UsuarioDetalhes from "./components/usuario/UsuarioDetalhes.jsx";
import MostrarItem from "./pages/MostrarItem.jsx";
import EditarItem from "./pages/EditarItem.jsx";
import CriarItem from "./pages/CriarItem.jsx";
import ListarItens from "./pages/ListarItens.jsx";
import ListarUsuarios from "./pages/ListarUsuarios.jsx";
import Login from "./pages/login.jsx";
import PrivateRoute from "./auth/PrivateRoute.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import Notificacoes from "./pages/Notificacoes.jsx";
import Solicitacoes from "./pages/Solicitacoes.jsx";
import PerfilUsuario from "./components/usuario/Perfil.jsx";

const router = createBrowserRouter([
  // rotas públicas
  { path: "/login", element: <Login /> },
  { path: "/usuario/criar", element: <CriarUsuario /> },

  // rotas privadas
  { path: "/", element: <PrivateRoute><App /></PrivateRoute> },
  { path: "/sobre", element: <PrivateRoute><Sobre /></PrivateRoute> },
  { path: "/contato", element: <PrivateRoute><Contato /></PrivateRoute> },
  { path: "/item/criar", element: <PrivateRoute><CriarItem /></PrivateRoute> },
  // { path: "/usuario", element: <PrivateRoute><ListarUsuarios /></PrivateRoute> },
  { path: "/item", element: <PrivateRoute><ListarItens /></PrivateRoute> },
  { path: "/usuario/:id", element: <PrivateRoute><UsuarioDetalhes /></PrivateRoute> },
  { path: "/usuario/editar/:id", element: <PrivateRoute><AtualizarUsuario /></PrivateRoute> },
  { path: "/item/:id", element: <PrivateRoute><MostrarItem /></PrivateRoute> },
  { path: "/item/editar/:id", element: <PrivateRoute><EditarItem /></PrivateRoute> },
  { path: "/usuario/notificacao", element: <PrivateRoute><Notificacoes /></PrivateRoute> },
  { path: "/requests/enviadas", element: <PrivateRoute><Solicitacoes /></PrivateRoute> },
  { path: "/usuario/perfil", element: <PrivateRoute><PerfilUsuario /></PrivateRoute> },
]);

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
