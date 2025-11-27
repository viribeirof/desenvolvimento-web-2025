import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Toast from "../shared/Toast";
import { Container } from "react-bootstrap";
import { useAuthFetch } from "../../auth/useAuthFetch";
import { useAuth } from "../../auth/useAuth";

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

  // se o auth ainda está carregando, evita mostrar o form
  if (authLoading) return null;

  return (
    <Container className="mt-3">
      {error && <Toast error={error} setError={() => setError(null)} />}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="m-3" noValidate>
        <div className="mb-3">
          <label className="form-label">Nome do Item</label>
          <input
            className="form-control"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            className="form-control"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="DISPONIVEL">Disponível</option>
            <option value="INDISPONIVEL">Indisponível</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Foto do Item</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {fotoPreview && (
            <div className="mt-2">
              <img
                src={fotoPreview}
                alt="preview"
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Enviando..." : "Criar Item"}
        </button>
      </form>
    </Container>
  );
};

export default FormItem;
