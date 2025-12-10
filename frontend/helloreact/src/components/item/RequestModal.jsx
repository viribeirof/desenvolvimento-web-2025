import { useState } from "react";
import { useAuthFetch } from "../../auth/useAuthFetch";
import "../../assets/RequestModel.css"

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
<div className="request-modal-overlay">
  <div className="request-modal-content">
    <div className="request-modal-header">
      <h5>Solicitar Troca: {item.nome}</h5>
      <button type="button" className="btn-close" onClick={handleClose}></button>
    </div>
    <div className="request-modal-body">
      {modalError && <div className="alert alert-danger">{modalError}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <p>Faça a sua oferta!</p>
      <textarea
        className="form-control"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Olá! Tenho interesse em trocar por este item..."
        rows={4}
        disabled={loading}
      />
    </div>
    <div className="request-modal-footer">
      <button className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancelar</button>
      <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
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

  );
};

export default RequestModal;
