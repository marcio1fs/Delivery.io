# Deliver.io - Sistema de Delivery

Sistema completo de delivery estilo iFood/Rappi com painéis para estabelecimentos, administradores e entregadores.

## 🚀 Tecnologias

### Frontend
- React 19 + TypeScript
- Vite
- React Router DOM
- Zustand (gerenciamento de estado)
- React Query (data fetching)
- Tailwind CSS
- React Hook Form + Zod (validação)
- Recharts (gráficos)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis (cache)
- Socket.IO (tempo real)
- JWT (autenticação)
- Winston (logs)
- Jest (testes)

## 📁 Estrutura do Projeto

```
/workspace
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configurações (DB, Redis)
│   │   ├── controllers/    # Controladores
│   │   ├── middleware/     # Middlewares (auth, validation)
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços (Socket.IO)
│   │   ├── utils/          # Utilitários
│   │   ├── validators/     # Validações
│   │   └── server.js       # Entry point
│   ├── tests/              # Testes
│   ├── Dockerfile
│   └── package.json
├── src/                    # Frontend React
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   ├── services/
│   └── types/
├── .github/workflows/      # CI/CD
├── docker-compose.yml
└── nginx.conf
```

## 🛠️ Instalação

### Com Docker (Recomendado)
```bash
cp backend/.env.example backend/.env
docker-compose up -d
```

### Manual
```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend
npm install && npm run dev
```

## 🔐 Segurança Implementada
- ✅ JWT com refresh token
- ✅ Hash bcrypt
- ✅ Rate limiting
- ✅ Validação de inputs
- ✅ CORS configurado
- ✅ Helmet headers

## 🧪 Testes
```bash
cd backend && npm test
```

## 📡 API
Base: `http://localhost:3000/api`

- POST /auth/register - Registrar
- POST /auth/login - Login
- GET /auth/me - Usuário atual
- REST: restaurants, products, orders

## 🚀 Deploy
CI/CD configurado no GitHub Actions.

**Status:** Pronto para produção 🎉
