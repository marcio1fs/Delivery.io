# Google Maps API Integration Guide

## Visão Geral

Este sistema possui integração completa com a Google Maps API para fornecer funcionalidades de geolocalização essenciais para um aplicativo de delivery.

## Configuração

### 1. Obter API Key

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - Geocoding API
   - Places API
   - Distance Matrix API
   - Directions API
   - Roads API (opcional)

4. Vá em "APIs & Services" > "Credentials"
5. Clique em "Create Credentials" > "API Key"
6. Restrinja sua API key para usar apenas as APIs necessárias

### 2. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
GOOGLE_MAPS_API_KEY=sua_api_key_aqui
GOOGLE_MAPS_ENABLED=true
```

## Endpoints da API

### Geocodificação

#### POST `/api/geolocation/geocode`
Converte um endereço em coordenadas geográficas.

**Body:**
```json
{
  "address": "Av. Paulista, 1000, São Paulo, SP"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "formattedAddress": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100, Brasil",
    "location": {
      "lat": -23.561414,
      "lng": -46.655881
    },
    "locationType": "ROOFTOP",
    "placeId": "ChIJ...",
    "types": ["street_address"]
  }
}
```

#### POST `/api/geolocation/reverse-geocode`
Converte coordenadas em endereço.

**Body:**
```json
{
  "lat": -23.561414,
  "lng": -46.655881
}
```

### Busca de Lugares

#### GET `/api/geolocation/nearby`
Busca lugares próximos (restaurantes, postos, etc.).

**Query Params:**
- `lat` (obrigatório): Latitude
- `lng` (obrigatório): Longitude
- `radius` (opcional): Raio em metros (100-50000, padrão: 5000)
- `type` (opcional): Tipo de lugar (padrão: 'restaurant')

**Exemplo:**
```
GET /api/geolocation/nearby?lat=-23.561414&lng=-46.655881&radius=2000&type=restaurant
```

#### GET `/api/geolocation/place-details/:placeId`
Obtém detalhes completos de um lugar específico.

### Distância e Rotas

#### POST `/api/geolocation/distance`
Calcula distância e duração entre dois pontos.

**Body:**
```json
{
  "origin": "Av. Paulista, 1000, São Paulo",
  "destination": "Av. Faria Lima, 2000, São Paulo",
  "mode": "driving" // driving, walking, bicycling, transit
}
```

#### POST `/api/geolocation/directions`
Obtém rotas detalhadas com passo a passo.

**Body:**
```json
{
  "origin": "Av. Paulista, 1000, São Paulo",
  "destination": "Av. Faria Lima, 2000, São Paulo",
  "mode": "driving"
}
```

### Autocomplete

#### GET `/api/geolocation/autocomplete`
Sugere endereços enquanto o usuário digita.

**Query Params:**
- `input` (obrigatório): Texto digitado pelo usuário
- `lat` (opcional): Latitude para priorizar resultados próximos
- `lng` (opcional): Longitude para priorizar resultados próximos
- `radius` (opcional): Raio em metros

**Exemplo:**
```
GET /api/geolocation/autocomplete?input=Av.%20Paulista&lat=-23.561414&lng=-46.655881
```

### Validação e Estimativas

#### POST `/api/geolocation/validate-address`
Valida se um endereço existe antes de salvar.

**Body:**
```json
{
  "address": "Av. Paulista, 1000, São Paulo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "formattedAddress": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    "coordinates": {
      "lat": -23.561414,
      "lng": -46.655881
    },
    "confidence": "ROOFTOP"
  }
}
```

#### POST `/api/geolocation/delivery-estimate`
Calcula taxa e tempo estimado de entrega.

**Body:**
```json
{
  "origin": "Av. Paulista, 1000, São Paulo",
  "destination": "Rua Augusta, 500, São Paulo",
  "preparationTime": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distance": {
      "text": "2.5 km",
      "value": 2500
    },
    "duration": {
      "text": "8 mins",
      "value": 480
    },
    "deliveryFee": {
      "distance": "2.50",
      "fee": 10.0,
      "currency": "BRL"
    },
    "estimatedTime": {
      "preparationTime": 30,
      "travelTime": 4,
      "estimatedTotal": 34,
      "estimatedRange": {
        "min": 29,
        "max": 44
      }
    }
  }
}
```

## Uso no Frontend

### Exemplo com React

```jsx
import { useState } from 'react';
import axios from 'axios';

const AddressSearch = () => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 3) {
      const response = await axios.get('/api/geolocation/autocomplete', {
        params: { input: value }
      });
      setSuggestions(response.data.data.predictions);
    }
  };

  const selectAddress = async (placeId) => {
    const response = await axios.get(`/api/geolocation/place-details/${placeId}`);
    console.log('Endereço selecionado:', response.data.data);
  };

  return (
    <div>
      <input
        type="text"
        value={address}
        onChange={handleAddressChange}
        placeholder="Digite seu endereço"
      />
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.placeId}
          onClick={() => selectAddress(suggestion.placeId)}
        >
          {suggestion.description}
        </div>
      ))}
    </div>
  );
};
```

### Calcular Taxa de Entrega

```jsx
const calculateDeliveryFee = async (restaurantAddress, customerAddress) => {
  const response = await axios.post('/api/geolocation/delivery-estimate', {
    origin: restaurantAddress,
    destination: customerAddress,
    preparationTime: 30
  });

  return response.data.data;
  // {
  //   deliveryFee: { fee: 10.0, currency: 'BRL' },
  //   estimatedTime: { estimatedTotal: 34 }
  // }
};
```

## Melhores Práticas

### 1. Cache de Resultados
Implemente cache para reduzir chamadas à API:

```javascript
// No backend, use Redis para cachear resultados
const cached = await redis.get(`geocode:${address}`);
if (cached) {
  return JSON.parse(cached);
}

const result = await googleMapsService.geocodeAddress(address);
await redis.setex(`geocode:${address}`, 3600, JSON.stringify(result));
return result;
```

### 2. Rate Limiting
A API gratuita tem limites. Monitore seu uso:
- Geocoding: 50.000 requisições/dia
- Places: 150.000 requisições/dia
- Distance Matrix: 100.000 elementos/dia

### 3. Validação de Endereços
Sempre valide endereços antes de salvar no banco:

```javascript
const validation = await googleMapsService.validateAddress(address);
if (!validation.valid) {
  throw new Error('Endereço inválido');
}
// Salvar apenas o formattedAddress retornado
```

### 4. Otimização de Custos
- Use autocomplete para reduzir erros de digitação
- Cacheie resultados sempre que possível
- Use a API de Distance Matrix em batch para múltiplas rotas
- Implemente fallback para cálculos simples (fórmula de Haversine)

## Tratamento de Erros

Os principais erros retornados pela API:

| Status | Significado | Ação Recomendada |
|--------|-------------|------------------|
| `ZERO_RESULTS` | Nenhum resultado encontrado | Pedir ao usuário para verificar o endereço |
| `INVALID_REQUEST` | Parâmetros inválidos | Verificar parâmetros da requisição |
| `OVER_QUERY_LIMIT` | Limite excedido | Implementar retry com backoff |
| `REQUEST_DENIED` | API key inválida | Verificar configuração |
| `UNKNOWN_ERROR` | Erro do servidor | Retry exponencial |

## Segurança

1. **Nunca exponha sua API Key no frontend**
   - Todas as chamadas devem passar pelo backend
   - Use proxies se necessário

2. **Restrinja sua API Key**
   - Limite por HTTP referrer (para frontend)
   - Limite por IP (para backend)
   - Limite às APIs específicas usadas

3. **Monitore o uso**
   - Configure alertas no Google Cloud Console
   - Revise logs regularmente

## Testes

Execute os testes unitários:

```bash
cd backend
npm test -- googleMaps.test.js
```

## Links Úteis

- [Documentação Oficial](https://developers.google.com/maps/documentation/javascript/overview)
- [Pricing Calculator](https://mapsplatformtransition.withgoogle.com/calculator)
- [API Dashboard](https://console.cloud.google.com/apis/dashboard)
- [Quotas e Limites](https://developers.google.com/maps/documentation/usage-and-billing/usage-limits)
