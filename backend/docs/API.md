# API Documentation - Deliver.io

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.deliver.io/api
```

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header das requisições:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 🔐 Autenticação

#### POST `/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phone": "+5511999999999",
  "role": "customer"
}
```

#### POST `/auth/login`
Login de usuário

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### POST `/auth/forgot-password`
Solicitar recuperação de senha

#### POST `/auth/reset-password/:token`
Redefinir senha

---

### 🏪 Restaurantes

#### GET `/restaurants`
Listar restaurantes com paginação e filtros

#### GET `/restaurants/:id`
Obter detalhes de um restaurante

#### POST `/restaurants`
Criar novo restaurante (requer role: restaurant)

#### PUT `/restaurants/:id`
Atualizar restaurante

#### DELETE `/restaurants/:id`
Deletar restaurante

---

### 🍔 Produtos

#### GET `/products`
Listar produtos

#### GET `/products/:id`
Obter produto

#### POST `/products`
Criar produto

#### PUT `/products/:id`
Atualizar produto

#### DELETE `/products/:id`
Deletar produto

---

### 📦 Pedidos

#### GET `/orders`
Listar pedidos do usuário

#### GET `/orders/:id`
Obter detalhes do pedido

#### POST `/orders`
Criar novo pedido

#### PUT `/orders/:id/status`
Atualizar status do pedido

#### PUT `/orders/:id/cancel`
Cancelar pedido

---

### ⬆️ Uploads

#### POST `/uploads/image`
Upload de imagem única

#### POST `/uploads/images`
Upload múltiplo

---

### ⭐ Avaliações

#### POST `/reviews`
Criar avaliação

#### GET `/reviews/restaurant/:restaurantId`
Listar avaliações

#### GET `/reviews/my-reviews`
Minhas avaliações

#### PUT `/reviews/:id`
Atualizar avaliação

#### DELETE `/reviews/:id`
Deletar avaliação

---

### 🔔 Notificações

#### GET `/notifications`
Listar notificações

#### GET `/notifications/unread/count`
Contagem de não lidas

#### PUT `/notifications/:id/read`
Marcar como lida

---

## Status Codes

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Proibido |
| 404 | Não encontrado |
| 500 | Erro interno |

---

## WebSocket Events

Conecte-se via Socket.IO

### Client Events:
```javascript
socket.emit('join', { userId });
socket.emit('join_order', { orderId });
```

### Server Events:
```javascript
socket.on('order_update', (data) => {});
socket.on('notification', (data) => {});
```
