import { Form } from "react-bootstrap";
import "../../assets/Login.css"

const ItemBusca = ({ value, onChange, placeholder = "Buscar por nome" }) => {
  return (
    <Form className="search-box w-100">
      <div className="input-group shadow-sm">
        <span className="input-group-text bg-transparent border-0 search-icon" id="search-addon">
          🔍
        </span>
        <Form.Control
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label="Buscar itens"
          className="form-control fancy-input search-input text-light"
          style={{ height: '35px', fontSize: '0.9rem' }} 
        />
      </div>
    </Form>
  );
};

export default ItemBusca;
