# Deliver.io - Sistema de Gestão de Entregas

Sistema profissional e robusto para gestão de entregas, similar ao iFood/Rappi, com painéis para estabelecimentos, administradores e entregadores.

## 🚀 Funcionalidades Implementadas

### Frontend
- ✅ Estrutura de componentes React com TypeScript
- ✅ Gerenciamento de estado com Zustand
- ✅ Validação de formulários com Zod
- ✅ Componentes UI reutilizáveis (Button, Input, Card, Modal, Badge, Alert)
- ✅ Hooks customizados (useLocalStorage, useDebounce, useMediaQuery, etc.)
- ✅ Serviços de API com Axios e interceptors
- ✅ Utils para formatação e helpers

### Backend (Estrutura Pronta)
- 📋 Serviços de API organizados por módulo
- 📋 Tipos TypeScript para todas as entidades
- 📋 Validações de dados com Zod
- 📋 Tratamento de erros e interceptors

## 📁 Estrutura do Projeto

```
/workspace
├── src/
│   ├── components/ui/       # Componentes UI reutilizáveis
│   ├── hooks/               # Hooks customizados
│   ├── lib/                 # Configurações e validações
│   ├── services/            # Serviços de API
│   ├── store/               # Stores Zustand
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Funções utilitárias
├── components/              # Componentes existentes
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Zustand** - Gerenciamento de estado
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Zod** - Validação
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos

## 📦 Instalação

```bash
npm install
npm run dev
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação com:
- Token no localStorage
- Interceptor Axios automático
- Refresh token
- Rotas protegidas

## 📊 Módulos

1. **Pedidos** - CRUD, filtros, atribuição
2. **Entregadores** - Status, favoritos, geolocalização
3. **Estabelecimentos** - Perfil, integrações
4. **Financeiro** - Saldo, extrato, relatórios
5. **Admin** - Dashboard, métricas, gestão

## 🔒 Segurança

- Sanitização de inputs
- Proteção XSS
- Validação de formulários
- Tokens HTTPS only

## 🚀 Próximo: Backend

Para produção, implementar backend com:
- Node.js + NestJS/Express
- PostgreSQL/MongoDB
- JWT authentication
- WebSockets para tempo real
- Redis para cache

## 📄 License

MIT
