import { useState } from "react";
import { useAuthFetch } from "../../auth/useAuthFetch";

const RequestModal = ({ show, onClose, item, user, onRequestSuccess }) => {
  const authFetch = useAuthFetch();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); 

  if (!show) return null;

  const handleSend = async () => {
    if (!user) {
      setModalError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setModalError(null);
    setSuccessMessage(null);

    try {
      const res = await authFetch("http://localhost:8080/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: user.id,
          itemId: item.id,
          message,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        if (onRequestSuccess) onRequestSuccess(); 
        setMessage("");
        handleClose();
      }

      await res.json();
      setMessage("");
      setSuccessMessage("Solicitação enviada com sucesso!"); 
      if (onRequestSuccess) onRequestSuccess();

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);

    } catch (err) {
      setModalError("Erro ao enviar solicitação: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setModalError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-lg shadow-lg border-0">
          <div className="modal-header border-bottom-0">
            <h5 className="modal-title fw-bold text-primary">Solicitar Troca: {item.nome}</h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {modalError && (
              <div className="alert alert-danger p-2 text-sm" role="alert">
                {modalError}
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success p-2 text-sm" role="alert">
                {successMessage}
              </div>
            )}
            <p className="text-muted mb-3">
              Envie uma mensagem opcional para o proprietário do item ({item.usuarioId}).
            </p>
            <div className="form-group">
              <textarea
                id="requestMessage"
                className="form-control"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Olá! Tenho interesse em trocar por este item..."
                rows="4"
                disabled={loading}
              />
            </div>
          </div>
          <div className="modal-footer border-top-0 d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enviando...
                </>
              ) : 'Enviar Solicitação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
