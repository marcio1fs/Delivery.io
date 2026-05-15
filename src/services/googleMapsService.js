require('dotenv').config();
const { Client } = require('@googlemaps/google-maps-services-js');
const axios = require('axios');

class GoogleMapsService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    
    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_MAPS_API_KEY não configurada. Serviços de geolocalização limitados.');
    }
  }

  /**
   * Geocodificação: Endereço -> Coordenadas
   */
  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }

      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
          language: 'pt-BR',
          region: 'br',
        },
      });

      if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Endereço não encontrado');
      }

      if (response.data.status !== 'OK') {
        throw new Error(`Erro na geocodificação: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        formattedAddress: result.formatted_address,
        location: result.geometry.location,
        locationType: result.geometry.location_type,
        viewport: result.geometry.viewport,
        placeId: result.place_id,
        types: result.types,
      };
    } catch (error) {
      console.error('Erro no geocodeAddress:', error.message);
      throw error;
    }
  }

  /**
   * Geocodificação Reversa: Coordenadas -> Endereço
   */
  async reverseGeocode(lat, lng) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }

      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat, lng },
          key: this.apiKey,
          language: 'pt-BR',
        },
      });

      if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Nenhum endereço encontrado para estas coordenadas');
      }

      if (response.data.status !== 'OK') {
        throw new Error(`Erro na geocodificação reversa: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        formattedAddress: result.formatted_address,
        location: result.geometry.location,
        placeId: result.place_id,
        types: result.types,
        addressComponents: result.address_components.map(comp => ({
          longName: comp.long_name,
          shortName: comp.short_name,
          types: comp.types,
        })),
      };
    } catch (error) {
      console.error('Erro no reverseGeocode:', error.message);
      throw error;
    }
  }

  /**
   * Buscar lugares próximos (restaurantes, etc.)
   */
  async searchNearbyPlaces(location, radius = 5000, type = 'restaurant') {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }

      const response = await this.client.placesNearby({
        params: {
          location,
          radius,
          type,
          key: this.apiKey,
          language: 'pt-BR',
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Erro na busca de lugares: ${response.data.status}`);
      }

      return {
        places: response.data.results.map(place => ({
          name: place.name,
          placeId: place.place_id,
          location: place.geometry.location,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          types: place.types,
          vicinity: place.vicinity,
          businessStatus: place.business_status,
          openingHours: place.opening_hours?.open_now,
          priceLevel: place.price_level,
          photos: place.photos?.slice(0, 3).map(photo => ({
            photoReference: photo.photo_reference,
            height: photo.height,
            width: photo.width,
          })),
        })),
        nextPageToken: response.data.next_page_token,
      };
    } catch (error) {
      console.error('Erro no searchNearbyPlaces:', error.message);
      throw error;
    }
  }

  /**
   * Detalhes de um lugar específico
   */
  async getPlaceDetails(placeId) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }

      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          language: 'pt-BR',
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'reviews',
            'opening_hours',
            'price_level',
            'types',
            'website',
            'international_phone_number',
            'photos',
            'editorial_summary',
          ],
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Erro ao buscar detalhes: ${response.data.status}`);
      }

      const result = response.data.result;
      return {
        name: result.name,
        formattedAddress: result.formatted_address,
        location: result.geometry.location,
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        reviews: result.reviews?.slice(0, 5).map(review => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: new Date(review.time * 1000),
          profilePhotoUrl: review.profile_photo_url,
        })),
        openingHours: result.opening_hours?.weekday_text,
        openNow: result.opening_hours?.open_now,
        priceLevel: result.price_level,
        types: result.types,
        website: result.website,
        phone: result.international_phone_number,
        photos: result.photos?.slice(0, 10).map(photo => ({
          photoReference: photo.photo_reference,
          height: photo.height,
          width: photo.width,
        })),
        editorialSummary: result.editorial_summary?.overview,
      };
    } catch (error) {
      console.error('Erro no getPlaceDetails:', error.message);
      throw error;
    }
  }

  /**
   * Calcular distância e duração entre dois pontos
   */
  async calculateDistance(origin, destination, mode = 'driving') {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }

      const response = await this.client.distancematrix({
        params: {
          origins: [origin],
          destinations: [destination],
          mode,
          key: this.apiKey,
          language: 'pt-BR',
          units: 'metric',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Erro no cálculo de distância: ${response.data.status}`);
      }

      const row = response.data.rows[0];
      const element = row.elements[0];

      if (element.status !== 'OK') {
        throw new Error(`Não foi possível calcular a rota: ${element.status}`);
      }

      return {
        distance: {
          text: element.distance.text,
          value: element.distance.value, // em metros
        },
        duration: {
          text: element.duration.text,
          value: element.duration.value, // em segundos
        },
        status: element.status,
      };
    } catch (error) {
      console.error('Erro no calculateDistance:', error.message);
      throw error;
    }
  }

  /**
   * Obter rotas detalhadas com steps
   */
  async getDirections(origin, destination, mode = 'driving') {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }

      const response = await this.client.directions({
        params: {
          origin,
          destination,
          mode,
          key: this.apiKey,
          language: 'pt-BR',
          units: 'metric',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Erro ao obter direções: ${response.data.status}`);
      }

      if (response.data.routes.length === 0) {
        throw new Error('Nenhuma rota encontrada');
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        summary: route.summary,
        distance: {
          text: leg.distance.text,
          value: leg.distance.value,
        },
        duration: {
          text: leg.duration.text,
          value: leg.duration.value,
        },
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        startLocation: leg.start_location,
        endLocation: leg.end_location,
        steps: leg.steps.map(step => ({
          htmlInstructions: step.html_instructions,
          distance: {
            text: step.distance.text,
            value: step.distance.value,
          },
          duration: {
            text: step.duration.text,
            value: step.duration.value,
          },
          startLocation: step.start_location,
          endLocation: step.end_location,
          travelMode: step.travel_mode,
          maneuver: step.maneuver,
        })),
        overviewPolyline: route.overview_polyline.points,
        bounds: route.bounds,
        warnings: route.warnings,
        waypointOrder: route.waypoint_order,
      };
    } catch (error) {
      console.error('Erro no getDirections:', error.message);
      throw error;
    }
  }

  /**
   * Autocompletar endereços (para busca em tempo real)
   */
  async autocompleteAddress(input, location = null, radius = 5000) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }

      const params = {
        input,
        key: this.apiKey,
        language: 'pt-BR',
        types: ['address', 'geocode', 'establishment'],
      };

      if (location) {
        params.location = location;
        params.radius = radius;
      }

      const response = await this.client.placeAutocomplete({ params });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Erro no autocomplete: ${response.data.status}`);
      }

      return {
        predictions: response.data.predictions.map(pred => ({
          description: pred.description,
          placeId: pred.place_id,
          types: pred.types,
          matchedSubstrings: pred.matched_substrings,
          structuredFormatting: pred.structured_formatting,
        })),
      };
    } catch (error) {
      console.error('Erro no autocompleteAddress:', error.message);
      throw error;
    }
  }

  /**
   * Validar se um endereço existe (usado antes de salvar no banco)
   */
  async validateAddress(address) {
    try {
      const result = await this.geocodeAddress(address);
      return {
        valid: true,
        formattedAddress: result.formattedAddress,
        coordinates: result.location,
        confidence: result.locationType, // ROOFTOP, RANGE_INTERPOLATED, GEOMETRIC_CENTER, APPROXIMATE
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Calcular taxa de entrega baseada na distância
   */
  calculateDeliveryFee(distanceInMeters, baseFee = 5.0, feePerKm = 2.0) {
    const distanceInKm = distanceInMeters / 1000;
    const fee = baseFee + (distanceInKm * feePerKm);
    return {
      distance: distanceInKm.toFixed(2),
      fee: parseFloat(fee.toFixed(2)),
      currency: 'BRL',
    };
  }

  /**
   * Estimar tempo de entrega baseado na distância e trânsito
   */
  estimateDeliveryTime(distanceInMeters, preparationTime = 30) {
    // Assume velocidade média de 40 km/h em área urbana
    const avgSpeedKmh = 40;
    const distanceInKm = distanceInMeters / 1000;
    const travelTimeMinutes = (distanceInKm / avgSpeedKmh) * 60;
    const totalTime = preparationTime + Math.round(travelTimeMinutes);

    return {
      preparationTime,
      travelTime: Math.round(travelTimeMinutes),
      estimatedTotal: totalTime,
      estimatedRange: {
        min: totalTime - 5,
        max: totalTime + 15,
      },
    };
  }
}

module.exports = new GoogleMapsService();
