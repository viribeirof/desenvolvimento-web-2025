import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../shared/Toast';
import Navegacao from '../Navbar';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../auth/useAuth';
import { useAuthFetch } from '../../auth/useAuthFetch';

import '../../assets/Login.css';

const AtualizarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const authFetch = useAuthFetch();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState(null);
  const [imagemBase64, setImagemBase64] = useState(null);
  const [imagemContentType, setImagemContentType] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const MAX_FILE_BYTES = 3 * 1024 * 1024;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
     if (String(user.id) !== String(id)) {
        navigate('/usuario/perfil'); 
        return;
      }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(true);
      setError(null);

      try {
        const resp = await authFetch(`http://localhost:8080/api/usuarios/${encodeURIComponent(id)}`, { method: 'GET' });

        if (resp.status === 200) {
          const data = await resp.json();

          setNome(data.nome ?? '');
          setEmail(data.email ?? '');

          if (data.fotoPerfil && data.fotoPerfilContentType) {
            setFotoPerfilPreview(`data:${data.fotoPerfilContentType};base64,${data.fotoPerfil}`);
          } else if (data.avatarUrl) {
            setFotoPerfilPreview(data.avatarUrl);
          } else {
            setFotoPerfilPreview(null);
          }
        } else if (resp.status === 304) {
          const cache = localStorage.getItem(`usuario_${id}`);
          if (cache) {
            const data = JSON.parse(cache);
            setNome(data.nome ?? '');
            setEmail(data.email ?? '');
            if (data.fotoPerfil && data.fotoPerfilContentType) {
              setFotoPerfilPreview(`data:${data.fotoPerfilContentType};base64,${data.fotoPerfil}`);
            } else if (data.avatarUrl) {
              setFotoPerfilPreview(data.avatarUrl);
            } else {
              setFotoPerfilPreview(null);
            }
          } else {
            setError('Nenhum dado em cache disponível.');
          }
        } else {
          const body = await resp.json().catch(() => null);
          throw new Error(body?.message || `Erro ao carregar usuário: ${resp.status}`);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erro ao carregar usuário.');
      } finally {
        setLoadingUser(false);
      }
    };

    if (!authLoading) loadUser();
  }, [authFetch, id, authLoading]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;

    setError(null);
    setImagemBase64(null);
    setImagemContentType(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('Imagem maior que 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setFotoPerfilPreview(result);

      const [prefix, base64] = String(result).split('base64,');
      const contentTypeMatch = prefix?.match(/data:(.*);/);
      const contentType = contentTypeMatch ? contentTypeMatch[1] : file.type;

      setImagemBase64(base64);
      setImagemContentType(contentType);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        nome,
        email,
        fotoPerfil: imagemBase64 || null,
        fotoPerfilContentType: imagemContentType || null
      };

      const resp = await authFetch(`http://localhost:8080/api/usuarios/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        throw new Error(body?.message || `Erro ao atualizar usuário: ${resp.status}`);
      }

      try { localStorage.setItem(`usuario_${id}`, JSON.stringify({ nome, email })); } catch { }

      setSuccess("Usuário atualizado com sucesso!");
      setTimeout(() => navigate("/usuario/perfil", { replace: true }), 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    navigate('/login');
  }

  return (
    <>
      <Navegacao />
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
                <h3 className="mb-0" style={{ color: "#fff" }}>Editar Perfil</h3>
                <small className="muted">Atualize seus dados</small>
              </div>
            </div>

            {error && <div className="mb-3"><Toast error={error} setError={() => setError(null)} /></div>}
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
                      disabled={loadingUser}
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
                      disabled={loadingUser}
                    />
                    <label htmlFor="email">Email</label>
                  </div>
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
                        <div className="upload-text">Clique ou arraste para selecionar (max 3MB)</div>
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
                  <button type="button" className="btn btn-outline-light btn-exit" onClick={() => navigate("/usuario/perfil")} disabled={loading}>
                    Cancelar
                  </button>

                  <button type="submit" className="fancy-button btn-lg btn-glow" disabled={loading || loadingUser}>
                    {loading && <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>}
                    {loading ? "Salvando..." : "Salvar alterações"}
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
    </>
  );
};

export default AtualizarUsuario;
