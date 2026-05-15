const { describe, it, expect, beforeEach, jest } = require('@jest/globals');
const googleMapsService = require('../services/googleMapsService');

// Mock the Google Maps Client
jest.mock('@googlemaps/google-maps-services-js', () => {
  const mockClient = {
    geocode: jest.fn(),
    reverseGeocode: jest.fn(),
    placesNearby: jest.fn(),
    placeDetails: jest.fn(),
    distancematrix: jest.fn(),
    directions: jest.fn(),
    placeAutocomplete: jest.fn(),
  };

  return {
    Client: jest.fn().mockImplementation(() => mockClient),
  };
});

describe('Google Maps Service', () => {
  let mockClient;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set a fake API key for testing
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
    
    // Get the mock client instance
    const { Client } = require('@googlemaps/google-maps-services-js');
    mockClient = new Client();
  });

  describe('geocodeAddress', () => {
    it('deve retornar coordenadas válidas para um endereço', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          results: [
            {
              formatted_address: 'Av. Paulista, 1000 - São Paulo, SP',
              geometry: {
                location: { lat: -23.561414, lng: -46.655881 },
                location_type: 'ROOFTOP',
                viewport: {
                  northeast: { lat: -23.56, lng: -46.655 },
                  southwest: { lat: -23.562, lng: -46.656 },
                },
              },
              place_id: 'ChIJ1234567890',
              types: ['street_address'],
            },
          ],
        },
      };

      mockClient.geocode.mockResolvedValue(mockResponse);

      const result = await googleMapsService.geocodeAddress('Av. Paulista, 1000, São Paulo');

      expect(result).toHaveProperty('formattedAddress');
      expect(result).toHaveProperty('location');
      expect(result.location.lat).toBe(-23.561414);
      expect(result.location.lng).toBe(-46.655881);
      expect(mockClient.geocode).toHaveBeenCalledWith({
        params: {
          address: 'Av. Paulista, 1000, São Paulo',
          key: 'test-api-key',
          language: 'pt-BR',
          region: 'br',
        },
      });
    });

    it('deve lançar erro quando endereço não for encontrado', async () => {
      mockClient.geocode.mockResolvedValue({
        data: { status: 'ZERO_RESULTS' },
      });

      await expect(
        googleMapsService.geocodeAddress('Endereço Inexistente')
      ).rejects.toThrow('Endereço não encontrado');
    });

    it('deve lançar erro quando API Key não estiver configurada', async () => {
      delete process.env.GOOGLE_MAPS_API_KEY;
      
      await expect(
        googleMapsService.geocodeAddress('Av. Paulista, 1000')
      ).rejects.toThrow('API Key não configurada');
      
      // Restore API key
      process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';
    });
  });

  describe('reverseGeocode', () => {
    it('deve retornar endereço para coordenadas válidas', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          results: [
            {
              formatted_address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
              geometry: {
                location: { lat: -23.561414, lng: -46.655881 },
              },
              place_id: 'ChIJ1234567890',
              types: ['street_address'],
              address_components: [
                {
                  long_name: '1000',
                  short_name: '1000',
                  types: ['street_number'],
                },
                {
                  long_name: 'Avenida Paulista',
                  short_name: 'Av. Paulista',
                  types: ['route'],
                },
              ],
            },
          ],
        },
      };

      mockClient.reverseGeocode.mockResolvedValue(mockResponse);

      const result = await googleMapsService.reverseGeocode(-23.561414, -46.655881);

      expect(result).toHaveProperty('formattedAddress');
      expect(result.formattedAddress).toContain('Av. Paulista');
      expect(result).toHaveProperty('addressComponents');
      expect(result.addressComponents.length).toBeGreaterThan(0);
    });
  });

  describe('calculateDistance', () => {
    it('deve calcular distância entre dois pontos', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          rows: [
            {
              elements: [
                {
                  status: 'OK',
                  distance: {
                    text: '5.2 km',
                    value: 5200,
                  },
                  duration: {
                    text: '15 mins',
                    value: 900,
                  },
                },
              ],
            },
          ],
        },
      };

      mockClient.distancematrix.mockResolvedValue(mockResponse);

      const result = await googleMapsService.calculateDistance(
        'Av. Paulista, 1000',
        'Av. Faria Lima, 2000'
      );

      expect(result.distance.value).toBe(5200);
      expect(result.duration.value).toBe(900);
    });
  });

  describe('calculateDeliveryFee', () => {
    it('deve calcular taxa de entrega baseada na distância', () => {
      const result = googleMapsService.calculateDeliveryFee(5000); // 5km

      expect(result.distance).toBe('5.00');
      expect(result.fee).toBe(15.0); // 5.0 (base) + 5.0 (5km * R$2/km)
      expect(result.currency).toBe('BRL');
    });

    it('deve usar valores personalizados de taxa', () => {
      const result = googleMapsService.calculateDeliveryFee(3000, 7.0, 3.0);

      expect(result.fee).toBe(16.0); // 7.0 (base) + 9.0 (3km * R$3/km)
    });
  });

  describe('estimateDeliveryTime', () => {
    it('deve estimar tempo de entrega baseado na distância', () => {
      const result = googleMapsService.estimateDeliveryTime(6000, 30); // 6km, 30min preparo

      expect(result.preparationTime).toBe(30);
      expect(result.travelTime).toBe(9); // 6km / 40km/h * 60 = 9 min
      expect(result.estimatedTotal).toBe(39);
      expect(result.estimatedRange.min).toBe(34);
      expect(result.estimatedRange.max).toBe(54);
    });

    it('deve usar tempo de preparo padrão de 30 minutos', () => {
      const result = googleMapsService.estimateDeliveryTime(4000);

      expect(result.preparationTime).toBe(30);
    });
  });

  describe('validateAddress', () => {
    it('deve validar endereço válido', async () => {
      mockClient.geocode.mockResolvedValue({
        data: {
          status: 'OK',
          results: [
            {
              formatted_address: 'Av. Paulista, 1000',
              geometry: {
                location: { lat: -23.561414, lng: -46.655881 },
                location_type: 'ROOFTOP',
              },
            },
          ],
        },
      });

      const result = await googleMapsService.validateAddress('Av. Paulista, 1000');

      expect(result.valid).toBe(true);
      expect(result.confidence).toBe('ROOFTOP');
    });

    it('deve retornar inválido para endereço inexistente', async () => {
      mockClient.geocode.mockResolvedValue({
        data: { status: 'ZERO_RESULTS' },
      });

      const result = await googleMapsService.validateAddress('Endereço Inexistente');

      expect(result.valid).toBe(false);
      expect(result).toHaveProperty('error');
    });
  });

  describe('autocompleteAddress', () => {
    it('deve retornar sugestões de endereços', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          predictions: [
            {
              description: 'Av. Paulista, 1000 - São Paulo, SP, Brasil',
              place_id: 'ChIJ123',
              types: ['street_address'],
              matched_substrings: [{ length: 10, offset: 0 }],
              structured_formatting: {
                main_text: 'Av. Paulista, 1000',
                secondary_text: 'São Paulo, SP, Brasil',
              },
            },
          ],
        },
      };

      mockClient.placeAutocomplete.mockResolvedValue(mockResponse);

      const result = await googleMapsService.autocompleteAddress('Av. Paulista');

      expect(result.predictions).toHaveLength(1);
      expect(result.predictions[0].description).toContain('Av. Paulista');
    });
  });
});
