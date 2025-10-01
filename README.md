# BuddieBag — Plataforma de Doação e Troca de Itens  

## 1) Problema  
Muitas pessoas acumulam objetos em casa que não usam mais, enquanto outras poderiam reutilizá-los.  
Em comunidades e universidades, isso gera desperdício e dificuldade em encontrar quem precise dos itens.  
Isso causa acúmulo desnecessário, impacto ambiental e gastos evitáveis.  
No início, o foco será **estudantes universitários** com o objetivo de **facilitar o compartilhamento de objetos e reduzir o desperdício**.  

---

## 2) Atores e Decisores (quem usa / quem decide)  
**Usuários principais:**  
- Pessoas que querem desapegar de itens (doadores).  
- Pessoas que procuram itens usados (receptores).  

**Decisores/Apoiadores:**  
- Comunidade acadêmica.  
- Professores da disciplina (avaliação).  

---

## 3) Casos de uso (de forma simples)  
- **Todos:** Logar/deslogar do sistema; Manter dados cadastrais.  
- **Doadores:** Manter (inserir, mostrar, editar, remover) seus itens cadastrados.  
- **Receptores:** Pesquisar e visualizar itens disponíveis; manifestar interesse em um item.  
- **Administrador:** Gerenciar todos os usuários e itens (edição/remoção).  

---

## 4) Limites e suposições  

- **Limites:**  
  - O sistema será desenvolvido como parte da disciplina, com entrega final até **2025-11-30**.  
  - Funcionalidades mínimas: CRUD de itens e usuários, autenticação/login e gerenciamento básico.  
  - Deploy acadêmico, sem preocupação com alta disponibilidade ou escalabilidade.  

- **Suposições:**  
  - Os usuários terão **acesso à internet** para utilizar o sistema.  
  - O banco de dados padrão será o **PostgreSQL**, acessado pelo **pgAdmin 4** ou linha de comando `psql`.  
  - O ambiente de testes terá **acesso ao GitHub** para deploy/hospedagem.  
  - Estudantes possuem **e-mail institucional** para cadastro e autenticação.  
  - Será possível usar dispositivos pessoais ou laboratórios da universidade para rodar o sistema.  

- **Plano B:**  
  - Sem internet → rodar localmente (Angular em modo dev + Spring Boot + MySQL local).  
  - Se o **MySQL Workbench** não estiver disponível → acesso ao banco via **phpMyAdmin**.  
  - Caso falte tempo do professor → simulação rápida com **3 usuários e 2 itens cadastrados**.  


---

## 5) Hipóteses + validação  

- **H-Valor:** Se os alunos conseguirem cadastrar itens e encontrar rapidamente o que procuram, então o sistema será útil e incentivará o compartilhamento.  
  - *Validação (valor):* teste piloto com 5 colegas da universidade; sucesso se ≥4 conseguirem cadastrar e localizar pelo menos 1 item em até **3 minutos**, sem ajuda externa.  

- **H-Viabilidade:** Com a aplicação web (Spring Boot + Angular + MySQL), cadastrar e listar itens deve ser rápido e estável.  
  - *Validação (viabilidade):* executar **20 operações de cadastro/listagem** no protótipo; sucesso se ≥18 operações ocorrerem em ≤3 segundos cada.  


## 6) Fluxo principal e primeira fatia  

**Fluxo principal:**  
0) Usuário cria a conta  
1) Usuário faz login  
2) Usuário acessa a lista de itens disponíveis  
3) Usuário (doador) clica em "Cadastrar item" e preenche os dados  
4) Usuário salva o item e o sistema registra no banco (**PostgreSQL**)  
5) Item aparece automaticamente na lista de desapegos  
6) Outro usuário (receptor) pesquisa e visualiza o item  
7) Usuário (receptor) manifesta interesse no item  
8) Administrador faz login  
9) Administrador pode editar ou remover itens/usuários se necessário  

---

**Primeira fatia vertical (escopo mínimo):**  
- Criar conta e login simples  
- Cadastrar item  
- Listar itens  

**Critérios de aceite:**  
- Ao cadastrar um item válido, ele aparece na lista de desapegos.  
- Ao excluir um item, ele desaparece da lista.  
- Apenas usuários logados podem cadastrar ou interagir com itens.  


## 7) Esboços de algumas telas (wireframes) 
O protótipo completo pode ser acessado no Figma: [Acessar no Figma](https://www.figma.com/design/YQBJP6d62U6ZKPdiH6ShAr/BuddieBag?node-id=0-1&p=f&t=namonnPT9DWg2mip-0)  

![prototipo da tela de inicio](prototipo-tela-inicial.png)

## 8) Tecnologias  

### 8.1 Navegador  
- **Compatibilidade:** navegadores modernos (Chrome, Firefox, Edge).  
- **Renderização:** HTML5, CSS3, JavaScript (gerado pelo Angular).  
- **Armazenamento local:** uso eventual de localStorage/sessionStorage para autenticação.  

### 8.2 Front-end (servidor de aplicação)  
- **Framework:** Angular (TypeScript).  
- **Hospedagem:** GitHub Pages ou servidor local para testes.  

### 8.3 Back-end (API/servidor)  
- **Framework:** Spring Boot (Java).  
- **Banco de dados:** **PostgreSQL (pgAdmin 4 / psql)**  
- **Hospedagem:** Deploy acadêmico (GitHub ou servidor local).  


## 9) Plano de Dados (Dia 0) — somente itens 1–3  

### 9.1 Entidades  
- **Usuario** — pessoa que usa o sistema (doador/receptor).  
- **Item** — objeto cadastrado para doação ou troca.  

### 9.2 Campos por entidade  

#### Usuario  
| Campo           | Tipo        | Obrigatório | Exemplo            |  
|-----------------|-------------|-------------|--------------------|  
| id              | número      | sim         | 1                  |  
| nome            | texto       | sim         | "Maria Silva"      |  
| email           | texto (único)| sim        | "maria@email.com"  |  
| senha_hash      | texto       | sim         | "$2a$10$..."       |  
| papel           | número |(0=usuário, 1=admin) | sim | 0 |  
| fotoPerfil      | texto/url   | não         | maria.png          |  
| dataCriacao     | data/hora   | sim         | 2025-08-21 14:30   |  
| dataAtualizacao | data/hora   | sim         | 2025-08-21 15:10   |  

#### Item  
| Campo           | Tipo        | Obrigatório | Exemplo            |  
|-----------------|-------------|-------------|--------------------|  
| id              | número      | sim         | 10                 |  
| usuario_id      | número (fk) | sim         | 1                  |  
| nome            | texto       | sim         | "Cafeteira elétrica" |  
| descricao       | texto       | sim         | "Funciona bem, usada poucas vezes" |  
| status          | texto (enum: disponível, reservado, doado) | sim | "disponível" |  
| fotoPItem       | texto/url   | não          | cafeteiraria.png   |  
| dataCriacao     | data/hora   | sim         | 2025-08-21 14:40   |  
| dataAtualizacao | data/hora   | sim         | 2025-08-21 14:50   |  

### 9.3 Relações entre entidades  
- Um **Usuário** tem muitos **Itens** (1→N).  
- Um **Item** pertence a um **Usuário** (N→1).

## 10) Como rodar o projeto

### 10.1 Back-end (Spring Boot)

1. Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd backend
```

2. Configure o banco PostgreSQL:
- Executar Query Buddie Bag

3. Configure as variáveis de ambiente
- No sistema, as variáveis de ambiente utilizadas são:
  - ${URL_BD}: url do banco de dados;
  - ${USER_BD}: nome de usuário no banco de dados;
  - ${SENHA_BD}: senha do banco de dados.
- Essas variáveis estão presentes no arquivo "application.properties".
- A configuração dessas variáveis é feita dentro da IDE nas configurações da aplicação.

## 11) Endpoints da API

| Método | Rota                   | Body (JSON) | Resposta (HTTP + Exemplo) |
|--------|------------------------|-------------|---------------------------|
| GET    | /api/usuarios          | -           | 200 OK <br> `[{<"id":1,"nome":"Maria Silva","email":"maria@email.com","fotoPerfil":"maria.png"}]` |
| GET    | /api/usuarios/{id}     | -           | 200 OK <br> `{"id":1,"nome":"Maria Silva","email":"maria@email.com","fotoPerfil":"maria.png"}` <br> 404 Not Found |
| POST   | /api/usuarios          | `{"nome":"Ana Souza","email":"ana@email.com","senhaHash":"12345678","fotoPerfil":"ana.png"}` | 201 Created <br> `{"message":"Usuário criado com sucesso!","id":3}`<br> <br> 500 Internal Server Error (email duplicado) <br> `{"message":"Item excluído com sucesso!"}` |
| PUT    | /api/usuarios/{id}     | `{"nome":"Ana Souza","email":"ana@email.com","senhaHash":"nova123","fotoPerfil":"ana.png"}` | 200 OK <br> `{"message":"Usuário atualizado com sucesso!"}` <br> 404 Not Found <br>  |
| DELETE | /api/usuarios/{id}     | -           | 200 OK <br> `{"message":"Usuário excluído com sucesso!"}`<br> <br> 404 Not Found |
| GET    | /api/itens             | -           | 200 OK <br> `[{"id":10,"nome":"Cafeteira elétrica","descricao":"Funciona bem, usada poucas vezes","status":"disponível","fotoItem":"cafeteira.png","usuarioId":1}]` |
| POST   | /api/itens             | `{"nome":"Cafeteira elétrica","descricao":"Funciona bem, usada poucas vezes","usuarioId":1,"fotoItem":"cafeteira.png"}` | 201 Created <br> `{"message":"Item criado com sucesso!","id":10}` |
| PUT    | /api/itens/{id}        | `{"nome":"Cafeteira nova","descricao":"Usada 1 vez","status":"disponível","fotoItem":"cafeteira_nova.png"}` | 200 OK <br> `{"message":"Item atualizado com sucesso!"}` <br> 404 Not Found |
| DELETE | /api/itens/{id}        | -           | 200 OK <br> `{"message":"Item excluído com sucesso!"}` <br> 404 Not Found |


