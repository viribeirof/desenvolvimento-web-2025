-- ===================================================================================
-- BuddieBag - Script de Criação do Banco de Dados e Dados de Teste
-- ===================================================================================

-- ------------------------
-- DROP DATABASE
-- ------------------------
DROP DATABASE IF EXISTS buddiebag;
CREATE DATABASE buddiebag;

\c buddiebag; -- conecta no banco criado (psql)

-- ------------------------
-- Tabelas
-- ------------------------
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150),
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel INT NOT NULL,
    foto_perfil VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Item (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150),
    descricao VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',
    foto_item VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
);

-- ------------------------
-- Inserções de Teste
-- ------------------------
INSERT INTO Usuario (nome, email, senha_hash, papel, foto_perfil)
VALUES 
('Vitória Ribeiro', 'vitoria@email.com', 'hash_senha1', 1, 'perfil1.jpg'),
('Carlos Silva', 'carlos@email.com', 'hash_senha2', 2, 'perfil2.jpg'),
('Ana Souza', 'ana@email.com', 'hash_senha3', 1, NULL),
('João Pereira', 'joao@email.com', 'hash_senha4', 3, 'perfil4.png');

INSERT INTO Item (nome, descricao, status, foto_item, usuario_id) VALUES
('Notebook Dell', 'Notebook Dell Inspiron 15, 16GB RAM', 'DISPONIVEL', 'notebook.jpg', 1),
('Smartphone Samsung', 'Samsung Galaxy S23, 256GB', 'DOADO', 'samsung.jpg', 2),
('Cadeira Gamer', 'Cadeira Gamer ergonômica preta', 'DISPONIVEL', NULL, 1),
('Mesa de Escritório', 'Mesa de madeira com gavetas', 'DOADO', 'mesa.jpg', 3);

-- ------------------------
-- Consultas Úteis
-- ------------------------

-- Todos os usuários e os nomes de todos os itens de cada usuário
SELECT u.nome AS usuario, i.nome AS item
FROM Item i
INNER JOIN Usuario u ON i.usuario_id = u.id;

-- Itens cadastrados por um usuário específico
SELECT u.nome AS usuario, i.nome AS item
FROM Item i
INNER JOIN Usuario u ON i.usuario_id = u.id
WHERE u.nome = 'Vitória Ribeiro';

-- Todos os itens cadastrados
SELECT * FROM Item;

-- Todos os usuários cadastrados
SELECT * FROM Usuario;

-- Itens disponíveis
SELECT * FROM Item WHERE status = 'DISPONIVEL';
