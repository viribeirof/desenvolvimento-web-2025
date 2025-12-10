import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import Toast from '../shared/Toast';
import { useAuthFetch } from "../../auth/useAuthFetch";
import { fetchImageWithToken } from '../shared/fetchImageWithToken';
import "../../assets/Login.css"
import "../../assets/CriarUsuario.css"

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB

const AtualizarItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    const imgObjectUrlRef = useRef(null);

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('DISPONIVEL');
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoCache, setFotoCache] = useState('/placeholder.png');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Cleanup do objectURL
    useEffect(() => () => {
        if (imgObjectUrlRef.current) {
            URL.revokeObjectURL(imgObjectUrlRef.current);
            imgObjectUrlRef.current = null;
        }
    }, []);

    useEffect(() => {
        const ac = new AbortController();

        const carregarItem = async () => {
            setLoading(true);
            try {
                const resp = await authFetch(`http://localhost:8080/api/itens/${id}`, { signal: ac.signal });
                const data = await resp.json();

                setNome(data.nome ?? '');
                setDescricao(data.descricao ?? '');
                setStatus(data.status ?? 'DISPONIVEL');

                if (data.fotoItem) {
                    try {
                        const result = await fetchImageWithToken(data.fotoItem, { signal: ac.signal });
                        if (result instanceof Blob) {
                            const objUrl = URL.createObjectURL(result);
                            imgObjectUrlRef.current = objUrl;
                            setFotoCache(objUrl);
                        } else if (typeof result === 'string') {
                            setFotoCache(result);
                        } 
                    } catch {
                        setFotoCache('/placeholder.png');
                    }
                }
            } catch (err) {
                setError('Erro ao carregar item');
            } finally {
                setLoading(false);
            }
        };

        carregarItem();
        return () => ac.abort();
    }, [id, authFetch]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setError(null);
        setFotoFile(null);

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Selecione uma imagem válida.');
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            setError('Imagem maior que 3MB.');
            return;
        }

        setFotoFile(file);
        if (imgObjectUrlRef.current) URL.revokeObjectURL(imgObjectUrlRef.current);
        imgObjectUrlRef.current = URL.createObjectURL(file);
        setFotoCache(imgObjectUrlRef.current);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append('nome', nome.trim());
            fd.append('descricao', descricao.trim());
            fd.append('status', status);
            if (fotoFile) fd.append('imagem', fotoFile);

            const resp = await authFetch(`http://localhost:8080/api/itens/${id}`, {
                method: 'PUT',
                body: fd
            });

            if (!resp.ok) {
                const body = await resp.json().catch(() => null);
                throw new Error(body?.message || `Erro HTTP: ${resp.status}`);
            }

            localStorage.removeItem('itens_cache');
            setSuccess('Item atualizado com sucesso!');
            setTimeout(() => navigate('/item'), 1200);
        } catch (err) {
            setError(err.message || 'Erro ao atualizar item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="criar-usuario-darkroot">
            <div className="item-form-wrap">
                <h3 className="mb-3">Editar item</h3>

                {error && <div style={{ marginBottom: 12 }}><Toast error={error} setError={() => setError(null)} /></div>}
                {success && <div style={{ marginBottom: 12 }}><Toast success={success} setError={() => setSuccess(null)} /></div>}

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="nome">Nome</label>
                            <input
                                id="nome"
                                className="form-control"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                                maxLength={120}
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="descricao">Descrição</label>
                            <textarea
                                id="descricao"
                                className="form-control"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                maxLength={2000}
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-3 d-flex flex-column flex-sm-row align-items-start gap-3">
                            <div className="d-flex flex-column align-items-center" style={{ minWidth: 96 }}>
                                <img
                                    src={fotoCache}
                                    alt="Preview"
                                    className="image-preview"
                                    style={{ width: 96, height: 96, borderRadius: 12 }}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label htmlFor="imagem">Upload de imagem</label>
                                <input
                                    id="imagem"
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={handleImageChange}
                                    disabled={loading}
                                />
                                <small className="text-light d-block mt-2">Máx. 3MB. Tipos de imagem suportados: jpg, png, webp, etc.</small>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                className="form-control"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={loading}
                            >
                                <option value="DISPONIVEL">Disponível</option>
                                <option value="INDISPONIVEL">Indisponível</option>
                            </select>
                        </div>

                        <div className="edit-actions">
                            <Button variant="outline-light" className="btn-delete" onClick={() => navigate(-1)} disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Voltar'}
                            </Button>

                            <Button type="submit" className=" btn-glow" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Salvar alterações'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AtualizarItem;
