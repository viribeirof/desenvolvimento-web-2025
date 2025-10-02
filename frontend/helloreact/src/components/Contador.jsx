import { useState } from "react";

const Contador = () => {
    const [valor, setValor] = useState(0);
    return (
        <div>
            <button onClick={() => setValor(v => v - 1)}>-</button>
            <input
                type="number"
                value={valor}
                onChange={e => setValor(Number(e.target.value))}
            />
            <button onClick={() => setValor(v => v + 1)}>+</button>
        </div>
    )
}
export default Contador
