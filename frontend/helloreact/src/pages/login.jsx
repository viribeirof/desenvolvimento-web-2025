import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import { login as loginService } from "../api/AuthService.jsx";
import "../assets/Login.css";

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

      sessionStorage.setItem("authData", JSON.stringify({
        accessToken: token,
        refreshToken: data.refreshToken || data.refresh_token,
      }));

      try {
        setUser(jwtDecode(token));
      } catch (err) {
        console.error("Erro ao decodificar token:", err);
        setUser(null);
      }

      setLoading(false);
      navigate("/item");
    } catch (err) {
      console.error("Login error:", err);

      let message = err.message || "Erro de rede. Tente novamente.";

      if (err.message === "Failed to fetch") {
        message = "Não foi possível conectar ao servidor. Verifique sua internet.";
      }

      setErro(message);
      setLoading(false);
    }



  };

  return (
    <div className="lux-bg d-flex align-items-center justify-content-center text-light">
      <div className="login-wrap">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            <img
              src="/shopping-bag.png"
              alt=""
              className="logo-img"
            />
          </div>
          <h1 className="brand-title">BuddieBag</h1>
        </div>

        <form className="glass-card-login p-4" onSubmit={handleLogin} aria-label="Formulário de login">
          <h2 className="mb-3">Bem-vindo!</h2>
          <p className="muted mb-3">Insira suas credenciais para acessar o painel.</p>

          <div className="form-floating mb-3">
            <input
              id="email"
              type="email"
              className="form-control fancy-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-label="Email"
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="form-floating mb-2">
            <input
              id="senha"
              type="password"
              className="form-control fancy-input"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              aria-required="true"
              aria-label="Senha"
            />
            <label htmlFor="senha">Senha</label>
          </div>

          {erro && (
            <div className="alert alert-danger my-2 py-2" role="alert" aria-live="polite">
              {erro}
            </div>
          )}

          <div className="d-grid gap-2 mt-2">
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-glow"
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                  <span className="ms-2">Entrando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </div>

          <div className="small muted mt-3 d-flex justify-content-between align-items-center">
            <span className="muted">Ainda não tem conta? </span>
            <button className="link-plain ps-1" type="button" onClick={() => navigate("/usuario/criar")}>Criar</button>
          </div>
        </form>

        <div className="card-footer muted text-center mt-3">
          <small>© {new Date().getFullYear()} BuddieBag. Todos os direitos.</small>
        </div>
      </div>

      <div className="bg-decor">
        <span className="dot dot-1" />
        <span className="dot dot-2" />
        <span className="dot dot-3" />
      </div>
    </div>
  );
};

export default Login;
