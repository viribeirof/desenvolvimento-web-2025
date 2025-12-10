import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Toast from "../shared/Toast";
import { Container } from "react-bootstrap";
import { useAuthFetch } from "../../auth/useAuthFetch";
import { useAuth } from "../../auth/useAuth";
import "../../assets/CriarUsuario.css"

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB
const CACHE_KEY = "itens_cache";

const parseErrorBody = async (res) => {
  try {
    const body = await res.json().catch(() => null);
    if (!body) return `Erro HTTP: ${res.status}`;
    return body.message || body.erro || JSON.stringify(body);
  } catch {
    return `Erro HTTP: ${res.status}`;
  }
};

const FormItem = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { user, authLoading } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("DISPONIVEL");

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      setFotoFile(null);
      setFotoPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Imagem muito grande, máximo 3MB.");
      return;
    }

    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    const previewUrl = URL.createObjectURL(file);
    setFotoFile(file);
    setFotoPreview(previewUrl);
  };

  const validateClient = () => {
    if (!nome.trim()) return "Nome é obrigatório.";
    if (!descricao.trim()) return "Descrição é obrigatória.";
    return null;
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // atualiza cache local inserindo novo item no começo 
  const updateLocalCacheWithCreated = (created) => {
    if (!created) return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      // remove possível duplicata
      const filtered = Array.isArray(arr) ? arr.filter(i => i.id !== created.id) : [];
      filtered.unshift(created);
      localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.warn("Falha ao atualizar cache local:", err);
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
      const fd = new FormData();
      fd.append("nome", nome.trim());
      fd.append("descricao", descricao.trim());
      fd.append("status", status);
      if (fotoFile) fd.append("imagem", fotoFile);

      const res = await authFetch("http://localhost:8080/api/itens", {
        method: "POST",
        body: fd,
      });

      // 201 created 
      if (res.status === 201 || res.status === 200) {
        const created = await res.json().catch(() => null);

        // atualiza cache local 
        updateLocalCacheWithCreated(created);
        try {
          window.dispatchEvent(new CustomEvent("itens:updated", { detail: created }));
        } catch (err) {
        }

        setSuccess("Item criado com sucesso!");
        setNome("");
        setDescricao("");
        setStatus("DISPONIVEL");
        setFotoFile(null);
        if (fotoPreview) {
          URL.revokeObjectURL(fotoPreview);
          setFotoPreview(null);
        }

        setTimeout(() => navigate("/item"), 800);
        return;
      }

      if (res.status === 401) {
        setError("Sessão expirada. Redirecionando para login...");
        setTimeout(() => {
          try { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); } catch { }
          window.location.href = "/login";
        }, 800);
        return;
      }

      if (res.status === 403) {
        setError("Você não tem permissão para criar itens.");
        return;
      }

      const errMsg = await parseErrorBody(res);
      setError(errMsg);
    } catch (err) {
      console.error("FormItem submit error:", err);
      setError("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // se o auth ainda está carregando nao mostra o form
  if (authLoading) return null;

  return (

    <Container fluid className="lux-bg d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="login-wrap w-100" style={{ maxWidth: 920 }}>
        <div className="glass-card-login p-4">
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <div className="brand-logo" style={{ width: 56, height: 56, borderRadius: 12 }}>
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="preview"
                    className="rounded-circle"
                    style={{ width: 56, height: 56, objectFit: "cover" }}
                  />
                ) : (
                  <div className="brand-logo-placeholder d-flex align-items-center justify-content-center" aria-hidden="true">
                    <strong style={{ fontSize: 16, color: "rgba(233,238,248,0.95)" }}>IT</strong>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-0" style={{ color: "#fff" }}>Criar Item</h3>
              <small className="muted">Preencha os dados para cadastrar um novo item</small>
            </div>
          </div>

          {error && <div className="mb-3"><RenderToast message={error} onClose={() => setError(null)} /></div>}
          {success && <div className="alert alert-success" role="alert">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-12">
                <div className="form-floating">
                  <input
                    id="nomeItem"
                    name="nomeItem"
                    className="form-control fancy-input"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do item"
                    aria-required="true"
                  />
                  <label htmlFor="nomeItem">Nome do Item</label>
                </div>
              </div>

              <div className="col-12">
                <div className="">
                  <label htmlFor="descricaoItem">Descrição</label>
                  <textarea
                    id="descricaoItem"
                    name="descricaoItem"
                    className="form-control fancy-input"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Digite aqui..."        // <- importante: placeholder NÃO pode ser vazio
                    rows={3}
                    style={{ minHeight: 90, resize: "vertical" }}
                  />
                </div>
              </div>



              <div className="col-12 col-md-6">
                <div className="form-floating">
                  <select
                    id="statusItem"
                    name="statusItem"
                    className="form-control fancy-input bg-dark fancy-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="INDISPONIVEL">Indisponível</option>
                  </select>
                  <label htmlFor="statusItem">Status</label>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label muted" htmlFor="fotoItem">Foto do Item (arquivo)</label>

                <div className="d-flex gap-3 align-items-center">
                  <label className="upload-box" htmlFor="fotoItem" style={{ cursor: "pointer" }}>
                    <input
                      id="fotoItem"
                      name="fotoItem"
                      className="d-none"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      aria-required="false"
                    />
                    <div className="upload-inner d-flex align-items-center gap-2">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">Clique ou arraste para enviar (max 3MB)</div>
                    </div>
                  </label>

                  {fotoPreview && !error && (
                    <div className="mt-0 p-2 d-flex align-items-center gap-3" style={{ minWidth: 120 }}>
                      <img src={fotoPreview} alt="Preview" className="rounded-circle" style={{ width: 96, height: 96, objectFit: "cover" }} />
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
                  {loading ? "Enviando..." : " Criar Item "}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="card-footer muted text-center mt-3" style={{ maxWidth: 420, margin: "12px auto 0" }}>
          <small>© {new Date().getFullYear()} BuddieBag. Todos os direitos.</small>
        </div>
      </div>

      {/* mantém as bolhas do background (já vem do .lux-bg) */}
      <div className="bg-decor" aria-hidden="true">
        <span className="dot dot-1" />
        <span className="dot dot-2" />
        <span className="dot dot-3" />
      </div>
    </Container>
  );


};

export default FormItem;
