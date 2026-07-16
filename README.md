# ERP Fábrica de Meias Ambar

ERP interno (single-tenant) desenvolvido com React, Node.js, SQLite, e Prisma.

## Stack
- Frontend: React + TypeScript + TailwindCSS + Vite + Zustand + Recharts + Lucide
- Backend: Node.js + Express + TypeScript + Zod
- Banco de Dados: SQLite
- ORM: Prisma
- Autenticação: JWT + bcryptjs

## Como executar o projeto localmente

### Pré-requisitos
- Node.js (v18+)
- npm

### 1. Instalação
Clone o projeto e instale as dependências:
```bash
npm install
```

### 2. Configuração do Banco de Dados
Gere o schema do Prisma e empurre para o SQLite local:
```bash
npm run db:push
```

### 3. Popule o Banco de Dados (Seed)
Irá criar os usuários básicos do sistema com as roles correspondentes:
```bash
npm run seed
```

**Usuários gerados:**
- admin@ambar.com (Senha: 123456) - ADMIN
- gerente@ambar.com (Senha: 123456) - MANAGER
- producao@ambar.com (Senha: 123456) - PRODUCTION
- estoque@ambar.com (Senha: 123456) - STOCK
- vendas@ambar.com (Senha: 123456) - SALES
- compras@ambar.com (Senha: 123456) - PURCHASING

### 4. Executando em Desenvolvimento
Inicie o servidor de desenvolvimento full-stack (Backend + Frontend via Vite Middleware):
```bash
npm run dev
```
Acesse em: http://localhost:3000

### 5. Build para Produção
```bash
npm run build
npm start
```
