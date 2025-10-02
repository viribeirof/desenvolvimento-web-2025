import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./components/App.jsx";
import Sobre from "./pages/Sobre.jsx";
import Contato from "./pages/Contato.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/sobre", element: <Sobre /> },
  { path: "/contato", element: <Contato /> },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
