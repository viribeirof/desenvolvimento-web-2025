import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext.jsx";
import {jwtDecode} from "jwt-decode";
import { login as loginService } from "../api/AuthService.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

 const handleLogin = async (e) => {
  e.preventDefault();
  setErro("");
  setLoading(true);

  try {
    const data = await loginService(email.trim(), senha);

    const token = data.accessToken || data.token || data.access_token;
    if (!token) {
      setErro("Resposta do servidor não contém accessToken.");
      setLoading(false);
      return;
    }

    const authData = {
      accessToken: token,
      refreshToken: data.refreshToken || data.refresh_token, 
    };

    sessionStorage.setItem('authData', JSON.stringify(authData)); 
    
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
      setUser(null);
    }
    
    setLoading(false);
    navigate("/item"); 
  } catch (err) {
    console.error("Login error:", err);
    setErro(err.message || "Erro de rede. Tente novamente.");
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={styles.input}
        />

        {erro && <p style={styles.error}>{erro}</p>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

          <button style={styles.button} disabled={loading}  onClick={() => navigate("/usuario/criar")}>
          "Cadastrar"
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#fff",
    padding: "1rem",
  },
  form: {
    backgroundColor: "#f2f2f2ff",
    padding: "2rem",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    boxShadow: "0 10px 10px rgba(0,0,0,0.08)",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  error: {
    color: "crimson",
    fontSize: "0.9rem",
    margin: 0,
  },
};

export default Login;
