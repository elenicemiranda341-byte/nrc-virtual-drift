# NRC — Negative Rotation Crew Virtual Drift

Plataforma oficial completa e sincronizada em tempo real para o campeonato de **FR Legends** organizado por **NRC / ryancar2**.

---

## Visão Geral da Arquitetura

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 (design responsivo mobile e desktop, identidade preta `#090A0C`, verde neon `#39FF14` e cinza asfalto).
- **Backend & Tempo Real (`server.ts`)**: Node.js + Express + WebSockets (`ws` em `/api/ws`) servindo na porta `3000`.
- **Banco de Dados Online Persistente**: PostgreSQL gerenciado (Cloud SQL / compatível com Supabase PostgreSQL) via **Drizzle ORM** (`src/db/schema.ts`).
- **Segurança Administrativa no Servidor**: O Painel do Desenvolvedor valida a senha administrativa (`NRC000` por padrão, configurável via variável `ADMIN_PASSWORD`) **exclusivamente no servidor** com `crypto.timingSafeEqual`, proteção contra força bruta por IP e emissão de token de sessão assinado com `HMAC-SHA256`.

---

## Estrutura de Pastas

```text
├── server.ts                      # Servidor Express + WebSocket (/api/ws) + API REST
├── firebase-applet-config.json    # Configuração de autenticação Google / Firebase Auth
├── src/
│   ├── db/
│   │   ├── schema.ts              # Tabelas PostgreSQL (users, championship_settings, registrations)
│   │   ├── index.ts               # Pool de conexão PostgreSQL (pg + Drizzle ORM)
│   │   ├── drizzle.config.ts      # Configuração de migração Drizzle Kit
│   │   ├── championship.ts        # Transações atômicas, bloqueio de duplicatas e vagas
│   │   └── users.ts               # Sincronização de perfis autenticados
│   ├── middleware/
│   │   └── auth.ts                # Validação HMAC do Painel Dev e Firebase Admin Auth
│   ├── hooks/
│   │   └── useChampionship.ts     # Sincronização WebSocket em tempo real e reconexão automática
│   ├── components/
│   │   ├── Header.tsx             # Navegação principal responsiva
│   │   ├── HeroSection.tsx        # Status em tempo real, vagas, inscritos e atalhos rápidos
│   │   ├── CategoriesSection.tsx  # Cards exclusivos PRO (FDC Stadium X W1) e STREET (Emerlaw Circuit)
│   │   ├── RegistrationSection.tsx# Formulário validado com bloqueio automático de vagas/encerramento
│   │   ├── PilotsSection.tsx      # Grid oficial de pilotos com pesquisa e filtro em tempo real
│   │   ├── RegulationsSection.tsx # Regulamento NRC completo + simulador de julgamento 100 pts
│   │   ├── DeveloperModal.tsx     # Painel administrativo protegido no servidor (NRC000)
│   │   └── Footer.tsx             # Rodapé institucional + acesso discreto ao Painel Dev
│   └── App.tsx
```

---

## Como Configurar o Banco de Dados

### 1. Ambiente Integrado (Cloud SQL — Já Configurado)
Neste projeto, o banco PostgreSQL em nuvem já foi provisionado e as tabelas (`championship_settings`, `registrations` e `users`) já estão criadas e ativas. As variáveis `SQL_HOST`, `SQL_DB_NAME`, `SQL_USER` e `SQL_PASSWORD` são injetadas automaticamente em tempo de execução.

### 2. Ambiente Externo (ex.: Supabase PostgreSQL, Railway, Render)
Caso deseje hospedar em infraestrutura própria conectada ao PostgreSQL do Supabase ou outro provedor:
1. Copie `.env.example` para `.env` e preencha:
   - `SQL_HOST`: host do seu banco PostgreSQL (ex.: `db.seuprojeto.supabase.co`)
   - `SQL_DB_NAME`: nome do banco (`postgres`)
   - `SQL_USER` / `SQL_ADMIN_USER`: usuário do banco
   - `SQL_PASSWORD` / `SQL_ADMIN_PASSWORD`: senha do banco
   - `ADMIN_PASSWORD`: senha do Painel de Desenvolvedor (padrão: `NRC000`)
   - `ADMIN_TOKEN_SECRET`: string aleatória longa (mínimo 32 caracteres) para assinar tokens administrativos
2. Aplique o schema no banco executando:
   ```bash
   npx drizzle-kit push --config=./src/db/drizzle.config.ts
   ```

---

## Como Executar e Publicar

### Desenvolvimento Local
```bash
npm install
npm run dev
```
O servidor iniciará em `http://localhost:3000` com API REST e sincronização WebSocket ativas.

### Publicação em Produção
1. **No Google AI Studio / Cloud Run**:
   - Clique diretamente em **Deploy / Publish** no canto superior da interface.
   - O sistema executará `npm run build` e iniciará o servidor full-stack com `npm start` (`node server.ts`), mantendo o banco Cloud SQL conectado e sincronizando todos os celulares e computadores em tempo real.
2. **Em servidores Node.js externos**:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

---

## Acesso ao Painel de Desenvolvedor

- Clique no botão discreto **Painel Dev** localizado no canto inferior direito do rodapé (ou use o atalho `Alt + Shift + D` no computador).
- Digite a senha administrativa padrão: **`NRC000`**.
- Funcionalidades disponíveis:
  - Abrir ou encerrar inscrições instantaneamente.
  - Ajustar limites de vagas da categoria **PRO**, **STREET** e teto geral.
  - Pesquisar, filtrar, exportar em CSV e excluir inscrições (com confirmação obrigatória).
