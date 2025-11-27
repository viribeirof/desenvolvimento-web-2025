// src/components/item/DetalheItem.jsx
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import Toast from "../shared/Toast";
import RequestModal from "./RequestModal";
import { useAuthFetch } from "../../auth/useAuthFetch";

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
}) => {
  const [showReq, setShowReq] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    if (!item || !user) return;

    const checkRequest = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/api/requests/sent`);
        if (!res.ok) throw new Error("Erro ao verificar solicitações");

        const sentRequests = await res.json();
        const alreadySent = sentRequests.some(r => r.itemId === item.id);
        setRequestSent(alreadySent);
      } catch (err) {
        console.error(err);
      }
    };

    checkRequest();
  }, [item, user]);

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

        <div className="d-flex justify-content-center gap-2 mt-3">
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


  const isOwner = item?.userEmail === user?.sub;
  console.log(requestSent);

  return (
    <>
      <Container className="mt-4">
        <div className="card shadow-lg border-0 rounded-4 p-4 mx-auto bg-white" style={{ maxWidth: 600 }}>
          {error && <Toast error={error} setError={setError ? () => setError(null) : undefined} />}

          <div className="text-center mb-4 border-bottom pb-3">
            <h2 className="fw-bold text-3xl text-gray-800 mb-3">{item.nome}</h2>

            <div
              className="rounded-xl overflow-hidden mx-auto mb-3 shadow-md"
              style={{ width: 250, height: 250, backgroundColor: "#f6f7f8" }}
            >
              <img
                src={fotoCache ?? "/placeholder.png"}
                alt={item.nome ? `Foto do item ${item.nome}` : "Foto do item"}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>

            <span className={`badge ${item.status === "DISPONIVEL" ? "bg-success" : "bg-secondary"} mt-2 text-base p-2`}>
              {item.status === "DISPONIVEL" ? "Disponível para Troca" : "Indisponível"}
            </span>
          </div>

          <div className="mb-4">
            <h6 className="text-muted font-semibold border-bottom pb-1">Descrição Completa</h6>
            <p className="mb-0 text-gray-700 leading-relaxed">
              {item.descricao || "Sem descrição detalhada disponível."}
            </p>
          </div>
          {isOwner && <div className="mb-4">
            <p className="mb-0 text-gray-700">Você é o proprietário</p>
          </div>}
          <div className="d-flex justify-content-center gap-3 mb-3 pt-3 border-top">
            {isOwner && onEdit ? (
              <button
                className="btn btn-warning btn-lg px-5 shadow-sm"
                onClick={() => onEdit(item.id)}
              >
                Editar Item
              </button>
            ) : null}

            {!isOwner && (
              <button
                className={`btn btn-primary btn-lg px-5 shadow-sm ${requestSent ? "disabled" : ""}`}
                onClick={() => setShowReq(true)}
                disabled={requestSent}
              >
                {requestSent ? "Solicitado" : "Solicitar Troca"}
              </button>
            )}
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
