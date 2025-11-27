import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Toast from '../shared/Toast';
import { useAuthFetch } from "../../auth/useAuthFetch";
import { fetchImageWithToken } from '../shared/fetchImageWithToken';

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB

const AtualizarItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const imgObjectUrlRef = useRef(null);
    const imgAbortRef = useRef(null);
    const authFetch = useAuthFetch();

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('DISPONIVEL');
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoCache, setFotoCache] = useState('/placeholder.png');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => () => {
        if (imgObjectUrlRef.current) {
            URL.revokeObjectURL(imgObjectUrlRef.current);
            imgObjectUrlRef.current = null;
        }
    }, []);

    // carregar dados do item
    useEffect(() => {
        const ac = new AbortController();
        imgAbortRef.current = ac;

        const carregarItem = async () => {
            setLoading(true);
            try {
                const resp = await authFetch(`http://localhost:8080/api/itens/${id}`);
                if (!resp.ok) throw new Error('Erro ao carregar item');
                const data = await resp.json();

                setNome(data.nome ?? '');
                setDescricao(data.descricao ?? '');
                setStatus(data.status ?? 'DISPONIVEL');

                // carregar imagem
                if (data.fotoItem) {
                    let result;
                    try {
                        result = await fetchImageWithToken(data.fotoItem, { signal: ac.signal });
                    } catch {
                        result = null;
                    }

                    if (!result) {
                        setFotoCache('/placeholder.png');
                    } else if (result instanceof Blob) {
                        const objUrl = URL.createObjectURL(result);
                        imgObjectUrlRef.current = objUrl;
                        setFotoCache(objUrl);
                    } else if (typeof result === 'string') {
                        setFotoCache(result);
                    } else if (typeof result.blob === 'function') {
                        const blob = await result.blob();
                        const objUrl = URL.createObjectURL(blob);
                        imgObjectUrlRef.current = objUrl;
                        setFotoCache(objUrl);
                    } else {
                        setFotoCache('/placeholder.png');
                    }
                }
            } catch (err) {
                if (err?.name !== 'AbortError') setError('Erro ao carregar item');
            } finally {
                if (imgAbortRef.current === ac) imgAbortRef.current = null;
                setLoading(false);
            }
        };

        carregarItem();
        return () => ac.abort();


    }, [id]);

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
        const previewUrl = URL.createObjectURL(file);
        imgObjectUrlRef.current = previewUrl;
        setFotoCache(previewUrl);

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
                const msg = body?.message || `Erro HTTP: ${resp.status}`;
                throw new Error(msg);
            }

            localStorage.removeItem('itens_cache');
            setSuccess('Item atualizado com sucesso!');
            setTimeout(() => navigate('/item'), 1200);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }


    };

    return (<Container className="mt-3"> <h1 className="mb-4">Atualizar Item (ID: {id})</h1>

        {error && <Toast error={error} setError={() => setError(null)} />}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="m-3">
            <div className="mb-3">
                <label className="form-label">Nome</label>
                <input className="form-control" type="text" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label className="form-label">Descrição</label>
                <textarea className="form-control" rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} required />
            </div>

            <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="INDISPONIVEL">Indisponível</option>
                    <option value="EM_USO">Em Uso</option>
                    <option value="FINALIZADO">Finalizado</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Foto do Item</label>
                <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
                <small className="text-muted">Max: 3MB. Selecione um novo arquivo para substituir o atual.</small>

                {fotoCache && (
                    <div className="mt-2">
                        <img src={fotoCache} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    </div>
                )}
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Atualizar Item'}
            </button>
        </form>
    </Container>

    )
};

export default AtualizarItem;
