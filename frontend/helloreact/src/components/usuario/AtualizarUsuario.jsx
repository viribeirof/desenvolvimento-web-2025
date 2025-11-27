import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../shared/Toast';
import Navegacao from '../Navbar';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../auth/useAuth';
import { useAuthFetch } from '../../auth/useAuthFetch';

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

      const [prefix, base64] = result.split('base64,');
      const contentTypeMatch = prefix.match(/data:(.*);/);
      const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/png';

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

      try { localStorage.setItem(`usuario_${id}`, JSON.stringify({ nome, email })); } catch {}

      setSuccess("Usuário atualizado com sucesso!");
      setTimeout(() => navigate(" /usuario/perfil"), 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navegacao />
      <Container className="mt-3">
        {error && <Toast error={error} setError={() => setError(null)} />}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="m-3">
          <h4>Editar usuário</h4>

          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              className="form-control"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loadingUser}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loadingUser}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Foto de Perfil</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleImageChange}
            />

            {fotoPerfilPreview && (
              <div className="mt-2">
                <img
                  src={fotoPerfilPreview}
                  alt="preview"
                  style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
                />
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading || loadingUser}>
              {loading ? "Salvando..." : "Atualizar Usuário"}
            </button>

            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </Container>
    </>
  );
};

export default AtualizarUsuario;
