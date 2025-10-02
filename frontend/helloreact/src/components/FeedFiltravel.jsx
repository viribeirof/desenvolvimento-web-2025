import { useState } from "react";

const Filtro = ({ autor, conteudo, onAutorChange, onConteudoChange }) => {
  return (
    <>
      <input
        placeholder="Filtrar por autor..."
        value={autor}
        onChange={e => onAutorChange(e.target.value)}
        style={{ marginRight: "5px" }}
      />
      <input
        placeholder="Filtrar por conteúdo..."
        value={conteudo}
        onChange={e => onConteudoChange(e.target.value)}
      />
    </>
  );
};

const Lista = ({ items, autor, conteudo }) => {
  const filtro = items.filter(
    post =>
      post.autor.toLowerCase().includes(autor.toLowerCase()) &&
      post.texto.toLowerCase().includes(conteudo.toLowerCase())
  );

  return filtro.map(p => (
    <div key={p.id} style={{ borderBottom: "1px solid #ccc", marginBottom: "5px" }}>
      <strong>{p.autor}</strong>: {p.texto} <br />
      Likes: {p.likes}
    </div>
  ));
};

const FeedFiltravel = () => {
  const [filtroAutor, setFiltroAutor] = useState("");
  const [filtroConteudo, setFiltroConteudo] = useState("");

  const posts = [
    { id: 1, autor: "Ana", texto: "JSX ❤️", likes: 7 },
    { id: 2, autor: "Leo", texto: "Hooks são poderosos", likes: 5 },
  ];

  return (
    <>
      <Filtro
        autor={filtroAutor}
        conteudo={filtroConteudo}
        onAutorChange={setFiltroAutor}
        onConteudoChange={setFiltroConteudo}
      />
      <Lista items={posts} autor={filtroAutor} conteudo={filtroConteudo} />
    </>
  );
};

export default FeedFiltravel;
