# Deliver.io - Sistema de Delivery

Sistema completo de delivery estilo iFood/Rappi com painel para restaurantes, administradores e entregadores.

## 🚀 Features

### Backend (Node.js/Express)
- ✅ API RESTful completa
- ✅ Autenticação JWT com refresh token
- ✅ Banco de dados MongoDB
- ✅ Cache com Redis
- ✅ WebSockets para atualizações em tempo real
- ✅ Upload de imagens com otimização
- ✅ Sistema de avaliações
- ✅ Notificações em tempo real
- ✅ Cupons de desconto
- ✅ Gestão de pagamentos
- ✅ Emails transacionais
- ✅ Analytics e métricas
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ Logs centralizados

### Frontend (React + TypeScript)
- ✅ Interface moderna e responsiva
- ✅ Tailwind CSS
- ✅ Componentes reutilizáveis
- ✅ Painel do cliente
- ✅ Painel do restaurante
- ✅ Painel do entregador
- ✅ Painel administrativo

### DevOps & Qualidade
- ✅ Docker e Docker Compose
- ✅ CI/CD com GitHub Actions
- ✅ Testes unitários (Jest)
- ✅ Testes E2E
- ✅ ESLint e Prettier
- ✅ Documentação da API

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB 6+
- Redis 7+
- npm ou yarn

## 🛠️ Instalação

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas configurações
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```

### Docker (Recomendado)

```bash
docker-compose up -d
```

## 📁 Estrutura do Projeto

```
/workspace
├── backend/
│   ├── src/
│   │   ├── config/       # Configurações DB, Redis
│   │   ├── controllers/  # Lógica das rotas
│   │   ├── middleware/   # Auth, rate limiter, etc
│   │   ├── models/       # Models MongoDB
│   │   ├── routes/       # Definição de rotas
│   │   ├── services/     # Serviços (email, socket)
│   │   ├── utils/        # Utilitários
│   │   └── validators/   # Validações
│   ├── tests/
│   │   ├── unit/         # Testes unitários
│   │   └── e2e/          # Testes E2E
│   └── docs/             # Documentação
├── src/                  # Código frontend
├── components/           # Componentes React
└── docker-compose.yml    # Orquestração Docker
```

## 🔑 Variáveis de Ambiente

Veja `.env.example` no backend para todas as variáveis necessárias:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/deliverio
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

## 📡 Endpoints da API

Principais endpoints:

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/restaurants` - Listar restaurantes
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Meus pedidos
- `POST /api/reviews` - Avaliar restaurante
- `GET /api/notifications` - Notificações

Veja [backend/docs/API.md](/backend/docs/API.md) para documentação completa.

## 🧪 Testes

```bash
# Backend tests
cd backend
npm test              # Testes unitários
npm run test:e2e      # Testes E2E
npm test -- --coverage # Coverage
```

## 🐳 Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 📊 Status do Projeto

**Pronto para Produção:** ~85%

### ✅ Implementado
- Backend completo com todas features core
- Autenticação e autorização
- CRUD de restaurantes, produtos, pedidos
- Sistema de avaliações
- Notificações em tempo real
- Upload de imagens
- Emails transacionais
- Cupons de desconto
- Analytics básico
- Testes unitários e E2E
- CI/CD pipeline
- Dockerização

### 🔄 Em andamento
- Integração completa de pagamentos (Stripe/PayPal)
- Geolocalização em tempo real
- PWA (Progressive Web App)
- Aplicativo mobile (React Native)

### 📝 Pendente
- Dashboard administrativo avançado
- Relatórios detalhados
- Sistema de fidelidade
- Chat entre cliente/entregador
- Múltiplos endereços de entrega
- Agendamento de pedidos

## 🔒 Segurança

- Helmet.js para headers de segurança
- Rate limiting
- Validação de inputs
- Sanitização de dados
- CORS configurado
- Senhas hasheadas com bcrypt
- JWT tokens com expiração

## 📈 Performance

- Cache Redis para consultas frequentes
- Compressão gzip
- Otimização de imagens
- Indexação MongoDB
- Lazy loading
- Code splitting

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License

## 👥 Equipe

Desenvolvido como projeto de sistema de delivery completo.

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no GitHub.
