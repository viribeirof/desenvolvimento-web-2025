import React, { useState, useEffect, useRef } from "react";
import CarrosselItens from "../item/CarrosselItens"
import "../../assets/TelaItens.css"
import "../../assets/ItemDetalhes.css"

const Itens = ({ itens, onItemClick, userId }) => {
  const itensDeOutros = itens.filter(item => item.usuarioId !== userId);
  const disponiveis = itensDeOutros.filter(item => item.status === "DISPONIVEL");
  const indisponiveis = itensDeOutros.filter(item => item.status !== "DISPONIVEL");
  const meusItens = itens.filter(item => item.usuarioId === userId)
  console.log(itensDeOutros);
  if (!itens.length) return <p className="no-items text-center my-5">Nenhum item encontrado.</p>;

  return (
    <div className="itens-root">
      <section className="section-block">
        <h5 className="section-title">Nossos Itens</h5>
        <CarrosselItens listaItens={itensDeOutros} onItemClick={onItemClick} />
      </section>
      {disponiveis.length > 0 && (
        <section className="section-block">
          <h5 className="section-title">Itens Disponíveis</h5>
          <CarrosselItens listaItens={disponiveis} onItemClick={onItemClick} />
        </section>
      )}

      <section className="section-block">
        <h5 className="section-title">Seus itens</h5>
        <CarrosselItens listaItens={meusItens} onItemClick={onItemClick} />
      </section>
      {indisponiveis.length > 0 && (
        <section className="section-block">
          <h5 className="section-title">Itens Indisponíveis</h5>
          <CarrosselItens listaItens={indisponiveis} onItemClick={onItemClick} />
        </section>
      )}
    </div>
  );


};

export default Itens;
