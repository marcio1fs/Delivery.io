
## 💳 Pagamentos - Mercado Pago

O sistema utiliza **Mercado Pago** como gateway de pagamento principal:

- ✅ **Pix**: QR Code e copy-paste com aprovação instantânea
- ✅ **Cartões**: Crédito em até 6 parcelas
- ✅ **Boleto**: Boleto bancário tradicional
- ✅ **Split de Pagamento**: Divisão automática entre plataforma, restaurante e entregador
- ✅ **Webhooks**: Atualização automática de status dos pedidos
- ✅ **Reembolsos**: Totais e parciais

### Configuração Rápida

1. Crie conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Obtenha suas credenciais (Access Token e Public Key)
3. Configure no `.env`:

```bash
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PLATFORM_FEE_PERCENT=10
RESTAURANT_FEE_PERCENT=85
DRIVER_FEE_PERCENT=5
```

4. Configure webhook: `https://sua-api.com/api/payments/mercadopago/notification`

📖 Veja a documentação completa em [docs/MERCADO_PAGO.md](docs/MERCADO_PAGO.md)

