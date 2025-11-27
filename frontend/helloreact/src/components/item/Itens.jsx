import React, { useState, useEffect, useRef } from "react";

const FotoItem = ({ fotoSrc, alt }) => {
const [src, setSrc] = useState(fotoSrc || "/placeholder.png");


useEffect(() => {
    if (fotoSrc) setSrc(fotoSrc);
}, [fotoSrc]);

return (
    <img
        src={src}
        alt={alt}
        className="w-100"
        style={{ height: "200px", objectFit: "cover" }}
        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
        loading="lazy"
    />
);


};

const CarrosselItens = ({ listaItens, onItemClick }) => {
const carrosselRef = useRef(null);


const scroll = (offset) => {
    if (carrosselRef.current) {
        carrosselRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
};

if (!listaItens.length) return null;

return (
    <div className="position-relative mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
            <button className="btn btn-outline-secondary rounded-circle p-2" onClick={() => scroll(-300)}>
                &#8592;
            </button>
            <button className="btn btn-outline-secondary rounded-circle p-2" onClick={() => scroll(300)}>
                &#8594;
            </button>
        </div>

        <div
            ref={carrosselRef}
            className="d-flex overflow-auto"
            style={{ scrollBehavior: "smooth", paddingBottom: "10px", gap: "28px" }}
        >
            {listaItens.map((item) => (
                <div
                    key={item.id}
                    className="card border flex-shrink-0 w-20"
                    style={{
                        width: "220px",
                        cursor: "pointer",
                        borderRadius: "10px",
                        boxShadow: "2px 2px 6px rgba(0,0,0,0.08)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    }}
                    onClick={() => onItemClick(item)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                    }}
                >
                    <FotoItem fotoSrc={item.fotoSrc} alt={item.nome} />
                    <div className="card-body p-2 text-center">
                        <h6 className="mb-1 text-truncate fw-bold">{item.nome}</h6>
                        <p className="mb-2 text-muted small text-truncate">{item.descricao || "—"}</p>
                        <span className={`badge ${item.status === "DISPONIVEL" ? "bg-success" : "bg-secondary"} py-1 px-2`}>
                            {item.status === "DISPONIVEL" ? "Disponível" : "Indisponível"}
                        </span>
                        <div className="mt-2">
                            <button className="btn btn-sm btn-dark w-80">Ver detalhes</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


};

const Itens = ({ itens, onItemClick }) => {
const disponiveis = itens.filter(item => item.status === "DISPONIVEL");
const indisponiveis = itens.filter(item => item.status !== "DISPONIVEL");


if (!itens.length) return <p className="text-center my-5">Nenhum item encontrado.</p>;

return (
    <div>
        <CarrosselItens listaItens={itens} onItemClick={onItemClick} />
        {disponiveis.length > 0 && (
            <>
                <h5 className="mt-4 mb-2 bg-light profile-card">Itens Disponíveis</h5>
                <CarrosselItens listaItens={disponiveis} onItemClick={onItemClick} />
            </>
        )}

        {indisponiveis.length > 0 && (
            <>
                <h5 className="mt-4 mb-2">Itens Indisponíveis</h5>
                <CarrosselItens listaItens={indisponiveis} onItemClick={onItemClick} />
            </>
        )}
    </div>
);


};

export default Itens;
