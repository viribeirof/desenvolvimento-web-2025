import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../shared/Toast";
import { Container } from "react-bootstrap";
import "../../assets/Login.css";


const CriarUsuario = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState(null);
  const [imagemBase64, setImagemBase64] = useState(null);
  const [imagemContentType, setImagemContentType] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        try { URL.revokeObjectURL(previewUrlRef.current); } catch {}
        previewUrlRef.current = null;
      }
    };
  }, []);
  

  const validateClient = () => {
    if (!nome.trim()) return "Nome é obrigatório.";
    if (!email.trim()) return "Email é obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido.";
    if (!senha) return "Senha é obrigatória.";
    if (senha.length < 6) return "Senha precisa ter ao menos 6 caracteres.";
    return null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;

    setError(null);
    setFotoPerfilFile(null);
    setImagemBase64(null);
    setImagemContentType(null);

    if (previewUrlRef.current) {
      try { URL.revokeObjectURL(previewUrlRef.current); } catch {}
      previewUrlRef.current = null;
    }
    setFotoPerfilPreview(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecione um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Imagem muito grande. Máximo 3MB.");
      return;
    }

    try {
      const objUrl = URL.createObjectURL(file);
      previewUrlRef.current = objUrl;
      setFotoPerfilPreview(objUrl);
    } catch (err) {
      console.warn("Não foi possível gerar objectURL, fallback para FileReader", err);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string" && result.includes("base64,")) {
        const parts = result.split("base64,");
        const base64 = parts[1];
        const prefix = parts[0];
        const m = prefix.match(/data:(.*);/);
        const contentType = m ? m[1] : file.type;
        setImagemContentType(contentType);
        setImagemBase64(base64);
      } else {
        setImagemContentType(file.type);
        setImagemBase64(result);
      }
    };
    reader.onerror = (err) => {
      console.error("Erro ao ler arquivo (base64):", err);
      setError("Não foi possível processar a imagem para upload.");
    };
    reader.readAsDataURL(file);
    setFotoPerfilFile(file);
  };

  const parseErrorBody = async (response) => {
    try {
      const body = await response.json().catch(() => null);
      if (!body) return `Erro HTTP: ${response.status} ${response.statusText}`;

      if (Array.isArray(body.messages)) return body.messages.join("\n");
      if (body.messages && typeof body.messages === "object") {
        const msgs = Object.values(body.messages).flat();
        return msgs.join("\n");
      }
      if (body.message) return body.message;
      if (body.erro) return body.erro;
      return JSON.stringify(body);
    } catch (err) {
      return `Erro HTTP: ${response.status} ${response.statusText}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const clientErr = validateClient();
    if (clientErr) {
      setError(clientErr);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha,
        fotoPerfil: imagemBase64 ? imagemBase64 : null,
        fotoPerfilContentType: imagemContentType ? imagemContentType : null,
      };

      const response = await fetch("http://localhost:8080/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errMsg = await parseErrorBody(response);
        setError(errMsg);
        return;
      }

      setSuccess("Usuário criado com sucesso! Redirecionando...");
      setNome("");
      setEmail("");
      setSenha("");
      setFotoPerfilFile(null);
      setFotoPerfilPreview(null);
      setImagemBase64(null);
      setImagemContentType(null);

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      console.error("Request error:", err);
      setError("Erro ao conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const RenderToast = ({ message, onClose }) => {
    try {
      return <Toast error={message} setError={onClose} />;
    } catch {
      return (
        <div className="alert alert-danger" role="alert" style={{ whiteSpace: "pre-line" }}>
          {message}
        </div>
      );
    }
  };

return (
  <Container fluid className="lux-bg d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
    <div className="login-wrap w-100" style={{ maxWidth: 920 }}>
      <div className="glass-card-login p-4">
        <div className="d-flex align-items-center mb-3">
          <div className="me-3">
            <div className="brand-logo" style={{ width: 56, height: 56, borderRadius: 12 }}>
              {fotoPerfilPreview ? (
                <img
                  src={fotoPerfilPreview}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: 56, height: 56, objectFit: "cover" }}
                />
              ) : (
                <div className="brand-logo-placeholder d-flex align-items-center justify-content-center" aria-hidden="true">
                  <strong style={{ fontSize: 16, color: "rgba(233,238,248,0.95)" }}>BB</strong>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-0" style={{ color: "#fff" }}>Criar Conta</h3>
            <small className="muted">Preencha seus dados para criar a conta</small>
          </div>
        </div>

        {error && <div className="mb-3"><RenderToast message={error} onClose={() => setError(null)} /></div>}
        {success && <div className="alert alert-success" role="alert">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <div className="form-floating">
                <input
                  id="nome"
                  name="nome"
                  className="form-control fancy-input"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  aria-required="true"
                />
                <label htmlFor="nome">Nome</label>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-floating">
                <input
                  id="email"
                  name="email"
                  className="form-control fancy-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@exemplo.com"
                  aria-required="true"
                />
                <label htmlFor="email">Email</label>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-floating">
                <input
                  id="senha"
                  name="senha"
                  className="form-control fancy-input"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  aria-required="true"
                />
                <label htmlFor="senha">Senha</label>
              </div>
              <div className="form-text mt-1 muted">Use ao menos 6 caracteres.</div>
            </div>

            <div className="col-12">
              <label className="form-label muted" htmlFor="fotoPerfil">Foto de Perfil (arquivo)</label>

              <div className="d-flex gap-3 align-items-center">
                <label className="upload-box" htmlFor="fotoPerfil" style={{ cursor: "pointer" }}>
                  <input
                    id="fotoPerfil"
                    name="fotoPerfil"
                    className="d-none"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    aria-required="false"
                  />
                  <div className="upload-inner">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">Clique ou arraste para enviar (max 3MB)</div>
                  </div>
                </label>

                {fotoPerfilPreview && !error && (
                  <div className="mt-0 p-2 d-flex align-items-center gap-3" style={{ minWidth: 120 }}>
                    <img src={fotoPerfilPreview} alt="Preview" className="rounded-circle" style={{ width: 96, height: 96, objectFit: "cover" }} />
                    <div className="small muted">Preview</div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-outline-light btn-exit" onClick={() => window.history.back()} disabled={loading}>
                Cancelar
              </button>

              <button type="submit" className="fancy-button btn-lg btn-glow" disabled={loading}>
                {loading && <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>}
                {loading ? "Enviando..." : " Criar "}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="card-footer muted text-center mt-3" style={{ maxWidth: 420, margin: "12px auto 0" }}>
        <small>© {new Date().getFullYear()} BuddieBag. Todos os direitos.</small>
      </div>
    </div>

    <div className="bg-decor" aria-hidden="true">
      <span className="dot dot-1" />
      <span className="dot dot-2" />
      <span className="dot dot-3" />
    </div>
  </Container>
);


};

export default CriarUsuario;
