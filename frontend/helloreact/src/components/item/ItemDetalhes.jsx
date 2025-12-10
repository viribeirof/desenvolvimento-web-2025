import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Toast from "../shared/Toast";
import RequestModal from "./RequestModal";
import { useAuthFetch } from "../../auth/useAuthFetch";
import '../../assets/ItemDetalhes.css'
import "../../assets/PerfilUsuario.css"

const DetalheItem = ({
  user = null,
  item = null,
  fotoCache = null,
  loading = false,
  error = null,
  setError,
  onEdit,
  onRequest,
  onBack,
  ownerInfo = null
}) => {
  const [showReq, setShowReq] = useState(false);

  const [requestSent, setRequestSent] = useState(false);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [itemConquistado, setItemConquistado] = useState(false);

  useEffect(() => {
    if (!item || !user) return;

    const checkRequest = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/api/requests/sent`);
        if (!res.ok) throw new Error("Erro ao verificar solicitações");

        const sentRequests = await res.json();
        const alreadySent = sentRequests.some(r => r.itemId === item.id);
        const hasAccepted = sentRequests.some(r => r.itemId === item.id && r.status === "ACEITA");

        setItemConquistado(hasAccepted);
        setRequestSent(alreadySent);
      } catch (err) {
        console.error(err);
      }
    };

    checkRequest();
  }, [item, user, authFetch]);

  const ownerName = ownerInfo?.nome ?? item?.nomeUsuario ?? "";
  const ownerEmail = ownerInfo?.email ?? item?.userEmail ?? "";
  const ownerId = ownerInfo?.id ?? item?.usuarioId ?? null;
  const ownerFoto = ownerInfo?.fotoSrc ?? item?.fotoUsuario ?? "/placeholder.png";

  const isOwner = item?.userEmail === user?.sub;

  const openOwnerProfile = () => {
    if (ownerId) navigate(`/usuario/${ownerId}`);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando detalhes do item...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <Toast error={error} setError={setError ? () => setError(null) : undefined} />
      </Container>
    );
  }

  if (!item) {
    return (
      <Container className="mt-5 text-center">
        <h3 className="text-danger">Item não encontrado.</h3>
        <p>O item solicitado não retornou nenhum registro.</p>

        <div className="d-flex justify-content-center  mt-3">
          {onBack ? (
            <button className="btn btn-secondary" onClick={onBack}>
              Voltar
            </button>
          ) : null}
          {onEdit ? (
            <button className="btn btn-primary" onClick={() => onEdit(item?.id)}>
              Editar
            </button>
          ) : null}
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="item-details-root d-flex justify-content-center align-items-start"
        style={{ minHeight: "100vh", paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
        <div className="item-details-shell">
          <div className="item-card-animated">

            {error && <Toast error={error} setError={setError ? () => setError(null) : undefined} />}

            <div className="owner-post-header d-flex align-items-center mb-3 d-md-none">
              <button
                type="button"
                className="btn p-0 me-3"
                onClick={openOwnerProfile}
                style={{ background: "transparent", border: "none", padding: 0 }}
                title={ownerName ? `Ver perfil de ${ownerName}` : "Proprietário"}
              >
                <img
                  src={ownerFoto}
                  alt={ownerName || "Proprietário"}
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", boxShadow: "0 3px 10px rgba(0,0,0,0.18)" }}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/avatar-placeholder.png"; }}
                />
              </button>

              <div className="d-flex flex-column">
                <strong style={{ fontSize: "1rem" }}>{ownerName || "Usuário"}</strong>
                <span className="text-light" style={{ fontSize: "0.85rem" }}>{ownerEmail || "—"}</span>
              </div>
            </div>

            <div className="item-header-grid">
              <div className="row g-4 align-items-start">
                <div className="col-12 col-md-5">
                  <div
                    className="item-media"
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={fotoCache ?? "/placeholder.png"}
                      alt={item.nome ? `Foto do item ${item.nome}` : "Foto do item"}
                      loading="lazy"
                      style={{
                        width: "90%",
                        height: "90%",
                        maxHeight: 720,
                        display: "block",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />

                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    {itemConquistado && (
                      <span
                        className="badge bg-success"
                        style={{
                          fontSize: "1rem",
                          padding: "0.6rem 1rem",
                          animation: "fadeIn 0.5s ease-in-out",
                        }}
                      >
                        🎉 Você conseguiu esse item!
                      </span>
                    )}
                  </div>

                </div>

                <div className="col-12 col-md-7 d-flex flex-column item-info">
                  <div className=" w-100 mb-2 align-items-start">
                    <div className="d-flex flex-column flex-md-row w-100 align-items-start gap-2 gap-md-3">                      <div className="flex-grow-1 align-self-center" style={{ minWidth: 0 }}>
                      <h2
                        className="item-title mb-1 text-center text-md-start"
                        style={{ margin: 0, wordBreak: "break-word" }}
                      >
                        {item.nome}
                      </h2>

                      <div
                        className="d-flex gap-2 mb-2 flex-wrap justify-content-center justify-content-md-start"
                        aria-hidden="true"
                      >
                      </div>
                    </div>

                      <div className="owner-info d-none d-md-flex flex-column align-items-end" style={{ width: 160 }}>
                        <button
                          type="button"
                          className="btn p-0 d-flex align-items-center justify-content-center"
                          onClick={openOwnerProfile}
                          style={{ background: "transparent", border: "none", padding: 0 }}
                          title={ownerName ? `Ver perfil de ${ownerName}` : "Proprietário"}
                        >
                          <img
                            src={ownerFoto}
                            alt={ownerName ? `Avatar de ${ownerName}` : "Avatar do proprietário"}
                            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", boxShadow: "0 6px 18px rgba(2,6,23,0.35)" }}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/avatar-placeholder.png"; }}
                          />
                        </button>

                        <div className="text-end mt-2" style={{ maxWidth: 160 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", overflowWrap: "break-word" }}>{ownerName || "Usuário"}</div>
                          <div className="muted" style={{ fontSize: "0.82rem", wordBreak: "break-word" }}>{ownerEmail || "—"}</div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="mt-auto pt-2">
                    <div className="item-actions d-flex flex-row align-items-center gap-2">
                      {isOwner && onEdit && (
                        <button
                          className="btn btn-edit"
                          onClick={() => onEdit(item.id)}
                          disabled={item.status === "INDISPONIVEL"}
                          title={item.status === "INDISPONIVEL" ? "Não é possível editar itens indisponíveis" : "Editar item"}
                        >
                          {item.status === "INDISPONIVEL" ? "Não é possível editar itens indisponíveis" : "Editar item"}
                        </button>
                      )}

                      {!isOwner && (
                        <>
                          {item.status === "DISPONIVEL" ? (
                            <button
                              className={`btn text-light btn-primary-lg ${requestSent ? "disabled" : ""}`}
                              onClick={() => setShowReq(true)}
                              disabled={requestSent}
                            >
                              {requestSent ? "Solicitado" : "Solicitar Troca"}
                            </button>
                          ) : (
                            <button className="btn btn-secondary" disabled title="Item indisponível">Indisponível</button>
                          )}
                        </>
                      )}

                      <button
                        className="btn btn-exit btn-primary-lg ms-md-auto"
                        onClick={() => navigate(-1)}
                      >
                        Voltar
                      </button>
                    </div>

                  </div>

                </div>
              </div>

              <div className="item-body-content refined mt-4">
                <h5 className="section-head">Descrição Completa</h5>
                <p className="item-desc">{item.descricao || "Sem descrição detalhada disponível."}</p>
              </div>
            </div>

            <div className="bg-decor" aria-hidden="true">
              <span className="dot dot-1" />
              <span className="dot dot-2" />
            </div>
          </div>
        </div>
      </Container>

      <RequestModal
        show={showReq}
        onClose={() => setShowReq(false)}
        item={item}
        user={user}
        onRequestSuccess={() => setRequestSent(true)}
      />
    </>
  );
};

export default DetalheItem;
