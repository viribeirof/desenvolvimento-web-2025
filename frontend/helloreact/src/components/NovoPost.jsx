import { useState } from "react";
const Like = ({ curtidas, onCurtir }) => {
    return <button onClick={onCurtir}>👍 {curtidas}</button>;
}
const NovoPost = () => {
    const [texto, setTexto] = useState("");
    const [curtidas, setCurtidas] = useState(0);
    const publicar = (e) => {
        e.preventDefault();
        if (!texto.trim()) return;
        alert(`Publicado: ${texto}`);
        setTexto("");
    }
    return (
        <form onSubmit={publicar}>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} />
            <div>
                <button type="submit">Publicar</button>
                <Like curtidas={curtidas} onCurtir={(e) => {
                    e.preventDefault(); setCurtidas(c => c + 1);
                }} />
            </div>
        </form>
    )
}
export default NovoPost