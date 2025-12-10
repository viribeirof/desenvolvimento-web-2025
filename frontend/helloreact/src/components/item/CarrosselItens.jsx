import { useRef, useState, useEffect } from "react";

const CarrosselItens = ({ listaItens, onItemClick }) => {
  const carrosselRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollBy = (offset) => {
    if (!carrosselRef.current) return;
    carrosselRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") scrollBy(300);
    if (e.key === "ArrowLeft") scrollBy(-300);
  };

  if (!listaItens?.length) return null;

  return (
    <div className="carrossel-wrapper mb-4 position-relative">
      {!isMobile && (
        <>
          <button
            className="carrossel-btn carrossel-btn-left"
            onClick={() => scrollBy(-320)}
          >
            ‹
          </button>
          <button
            className="carrossel-btn carrossel-btn-right"
            onClick={() => scrollBy(320)}
          >
            ›
          </button>
        </>
      )}

      <div
        ref={carrosselRef}
        className={`carrossel ${isMobile ? "carrossel-mobile" : ""} ${listaItens.length === 1 ? "single" : ""}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {listaItens.map((item) => (
          <article
            key={item.id}
            className="item-card"
            onClick={() => onItemClick(item)}
            onKeyDown={(e) => e.key === "Enter" && onItemClick(item)}
          >
            <div className="item-media">
              <img
                src={item.fotoSrc || "/placeholder.png"}
                alt={item.nome}
                loading="lazy"
                onError={(ev) => (ev.currentTarget.src = "/placeholder.png")}
              />
            </div>
            <div className="item-body">
              <h6 className="item-title">{item.nome}</h6>
              <div className="item-footer">
                <span
                  className={`item-badge ${item.status === "DISPONIVEL" ? "badge-available" : "badge-unavailable"
                    }`}
                >
                  {item.status === "DISPONIVEL" ? "Disponível" : "Indisponível"}
                </span>
                <button
                  className="btn btn-detalhes"
                  onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                >
                  Detalhes
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {isMobile && (
        <div className="d-flex justify-content-center gap-2 mt-2">
          <button className="btn btn-outline-light btn-sm" onClick={() => scrollBy(-300)}>‹</button>
          <button className="btn btn-outline-light btn-sm" onClick={() => scrollBy(300)}>›</button>
        </div>
      )}
    </div>
  );

};

export default CarrosselItens;
