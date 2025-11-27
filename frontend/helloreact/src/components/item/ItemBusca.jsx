import React from "react";
import { Form } from "react-bootstrap";

const ItemBusca = ({ value, onChange, placeholder = "Buscar por nome" }) => {
  return (
    <Form className="mb-3">
      <Form.Control
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </Form>
  );
};

export default ItemBusca;
