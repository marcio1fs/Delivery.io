# Integração com Mercado Pago

Este sistema utiliza o **Mercado Pago** como gateway de pagamento principal, oferecendo suporte completo para:

- ✅ Cartões de crédito (até 6 parcelas)
- ✅ Pix (com QR Code e copy-paste)
- ✅ Boleto bancário
- ✅ Split de pagamento (Marketplace)
- ✅ Reembolsos totais e parciais
- ✅ Webhooks para atualização automática de status

## Configuração

### 1. Criar conta no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta ou faça login
3. Vá para "Painel de Desenvolvedor"
4. Crie um novo aplicativo

### 2. Obter credenciais

No painel do seu aplicativo:

- **Access Token**: Token de acesso para API (produção e sandbox)
- **Public Key**: Chave pública para frontend

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Sandbox (testes)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Produção (quando estiver pronto)
# MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# MERCADO_PAGO_PUBLIC_KEY=APP-USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configurações do Marketplace
PLATFORM_FEE_PERCENT=10      # Taxa da plataforma (10%)
RESTAURANT_FEE_PERCENT=85    # Percentual do restaurante (85%)
DRIVER_FEE_PERCENT=5         # Percentual do entregador (5%)
```

### 4. Configurar Webhook

No painel do Mercado Pago:

1. Vá em "Notificações" > "Webhooks"
2. Adicione a URL: `https://sua-api.com/api/payments/mercadopago/notification`
3. Selecione os eventos: `payment`, `merchant_order`

## Endpoints da API

### Criar preferência de pagamento

```http
POST /api/payments/mercadopago/create-preference
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "60d5ecb5c9e77c001f5e7c8a"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "preference-id",
    "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=xxx",
    "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=xxx"
  }
}
```

### Gerar QR Code Pix

```http
POST /api/payments/mercadopago/generate-pix
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "60d5ecb5c9e77c001f5e7c8a"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "qrCode": "00020126580014BR.GOV.BCB.PIX...",
    "qrCodeBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "expirationDate": "2024-01-15T10:30:00.000Z",
    "paymentId": "1234567890"
  }
}
```

### Buscar informações de pagamento

```http
GET /api/payments/mercadopago/payment/:paymentId
Authorization: Bearer <token>
```

### Buscar pagamentos por pedido

```http
GET /api/payments/mercadopago/order/:orderId
Authorization: Bearer <token>
```

### Reembolsar pagamento

```http
POST /api/payments/mercadopago/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "1234567890",
  "amount": 50.00  // Opcional - se omitido, reembolso total
}
```

### Calcular split de pagamento

```http
GET /api/payments/mercadopago/split/:orderId
Authorization: Bearer <token>
```

## Fluxo de Pagamento

### Checkout Normal (Cartão/Boleto)

1. Cliente finaliza pedido no frontend
2. Frontend chama `POST /api/payments/mercadopago/create-preference`
3. Backend cria preferência no Mercado Pago
4. Frontend redireciona cliente para `init_point` retornado
5. Cliente paga no checkout do Mercado Pago
6. Mercado Pago notifica backend via webhook
7. Backend atualiza status do pedido automaticamente
8. Frontend recebe atualização via WebSocket

### Pagamento com Pix

1. Cliente seleciona Pix no checkout
2. Frontend chama `POST /api/payments/mercadopago/generate-pix`
3. Backend gera QR Code no Mercado Pago
4. Frontend exibe QR Code para cliente
5. Cliente paga Pix pelo app do banco
6. Mercado Pago notifica aprovação via webhook (instantâneo)
7. Backend atualiza pedido para "confirmado"
8. Frontend recebe notificação via WebSocket

## Split de Pagamento (Marketplace)

O sistema suporta divisão automática de pagamentos entre:

- **Plataforma**: Taxa de intermediação (configurável, padrão 10%)
- **Restaurante**: Maior parte do valor (configurável, padrão 85%)
- **Entregador**: Taxa de entrega parcial (configurável, padrão 5%)

Para usar split real, é necessário configurar contas Marketplace no Mercado Pago:

1. Acesse "Marketplace" no painel de desenvolvedor
2. Cadastre as contas dos restaurantes e entregadores
3. Use a API de pagamentos divididos

## Webhook Handler

O endpoint `/api/payments/mercadopago/notification` processa automaticamente:

- Aprovação de pagamentos → Pedido confirmado
- Pendência → Aguardando pagamento
- Recusa → Pagamento falhou
- Cancelamento → Pedido cancelado
- Estorno → Reembolso processado

## Testes

Use o ambiente de **sandbox** para testes:

```bash
# Use tokens de teste (começam com TEST-)
MERCADO_PAGO_ACCESS_TOKEN=TEST-...

# Cartões de teste: https://www.mercadopago.com.br/developers/pt/test
# - Aprovado: 5031 4332 1540 6339
# - Recusado: 5031 7552 8915 8052
# - Pix: Gera QR Code válido para testes
```

## Segurança

- ✅ Validação de signature do webhook (implementar em produção)
- ✅ HTTPS obrigatório para webhooks
- ✅ Tokens de acesso armazenados apenas no backend
- ✅ Validação de origem das requisições

## Troubleshooting

### Pagamento não atualiza automaticamente

1. Verifique se o webhook está configurado corretamente
2. Confirme que a URL está acessível publicamente
3. Verifique logs do backend para erros de processamento

### Erro ao criar preferência

1. Valide se o Access Token está correto
2. Verifique se o pedido existe e está em status válido
3. Confira se todos os itens têm preço e quantidade válidos

### Pix não gera QR Code

1. Verifique se a conta Mercado Pago está habilitada para Pix
2. Confirme dados do pagador (email, CPF)
3. Teste em sandbox primeiro

## Links Úteis

- [Documentação Oficial Mercado Pago](https://www.mercadopago.com.br/developers/pt)
- [Checkout Pro](https://www.mercadopago.com.br/developers/pt/guides/online-payments/checkout-pro/introduction)
- [Pix API](https://www.mercadopago.com.br/developers/pt/guides/online-payments/checkout-pro/add-payment-methods/pix)
- [Marketplace](https://www.mercadopago.com.br/developers/pt/guides/marketplace)
- [Cartões de Teste](https://www.mercadopago.com.br/developers/pt/test)
