const express = require('express');
const router = express.Router();
const googleMapsService = require('../services/googleMapsService');
const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/geolocation/geocode
 * @desc    Converter endereço em coordenadas
 * @access  Private (usuários autenticados)
 */
router.post(
  '/geocode',
  auth,
  [body('address').notEmpty().withMessage('Endereço é obrigatório')],
  validate,
  async (req, res) => {
    try {
      const { address } = req.body;
      const result = await googleMapsService.geocodeAddress(address);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Erro no geocode:', error);
      res.status(error.message.includes('não configurada') ? 503 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/geolocation/reverse-geocode
 * @desc    Converter coordenadas em endereço
 * @access  Private
 */
router.post(
  '/reverse-geocode',
  auth,
  [
    body('lat').isNumeric().withMessage('Latitude deve ser numérica'),
    body('lng').isNumeric().withMessage('Longitude deve ser numérica'),
  ],
  validate,
  async (req, res) => {
    try {
      const { lat, lng } = req.body;
      const result = await googleMapsService.reverseGeocode(lat, lng);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Erro no reverse geocode:', error);
      res.status(error.message.includes('não configurada') ? 503 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/geolocation/nearby
 * @desc    Buscar lugares próximos
 * @access  Public
 */
router.get(
  '/nearby',
  [
    query('lat').isNumeric().withMessage('Latitude deve ser numérica'),
    query('lng').isNumeric().withMessage('Longitude deve ser numérica'),
    query('radius').optional().isInt({ min: 100, max: 50000 }).withMessage('Raio entre 100 e 50000 metros'),
    query('type').optional().isString().withMessage('Tipo deve ser string'),
  ],
  validate,
  async (req, res) => {
    try {
      const { lat, lng, radius = 5000, type = 'restaurant' } = req.query;
      const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
      
      const result = await googleMapsService.searchNearbyPlaces(location, parseInt(radius), type);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Erro na busca nearby:', error);
      res.status(error.message.includes('não configurada') ? 503 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/geolocation/place-details/:placeId
 * @desc    Obter detalhes de um lugar
 * @access  Public
 */
router.get('/place-details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const result = await googleMapsService.getPlaceDetails(placeId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Erro nos detalhes do lugar:', error);
    res.status(error.message.includes('não configurada') ? 503 : 400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/geolocation/distance
 * @desc    Calcular distância entre dois pontos
 * @access  Public
 */
router.post(
  '/distance',
  [
    body('origin').notEmpty().withMessage('Origem é obrigatória'),
    body('destination').notEmpty().withMessage('Destino é obrigatório'),
    body('mode').optional().isIn(['driving', 'walking', 'bicycling', 'transit']).withMessage('Modo inválido'),
  ],
  validate,
  async (req, res) => {
    try {
      const { origin, destination, mode = 'driving' } = req.body;
      const result = await googleMapsService.calculateDistance(origin, destination, mode);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Erro no cálculo de distância:', error);
      res.status(error.message.includes('não configurada') ? 503 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/geolocation/directions
 * @desc    Obter rotas detalhadas
 * @access  Public
 */
router.post(
  '/directions',
  [
    body('origin').notEmpty().withMessage('Origem é obrigatória'),
    body('destination').notEmpty().withMessage('Destino é obrigatório'),
    body('mode').optional().isIn(['driving', 'walking', 'bicycling', 'transit']).withMessage('Modo inválido'),
  ],
  validate,
  async (req, res) => {
    try {
      const { origin, destination, mode = 'driving' } = req.body;
      const result = await googleMapsService.getDirections(origin, destination, mode);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Erro nas direções:', error);
      res.status(error.message.includes('não configurada') ? 503 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/geolocation/autocomplete
 * @desc    Autocompletar endereços
 * @access  Public
 */
router.get(
  '/autocomplete',
  [
    query('input').notEmpty().withMessage('Input é obrigatório'),
    query('lat').optional().isNumeric().withMessage('Latitude deve ser numérica'),
    query('lng').optional().isNumeric().withMessage('Longitude deve ser numérica'),
    query('radius').optional().isInt({ min: 100, max: 50000 }).withMessage('Raio entre 100 e 50000 metros'),
  ],
  validate,
  async (req, res) => {
    try {
      const { input, lat, lng, radius } = req.query;
      const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
      
      const result = await googleMapsService.autocompleteAddress(input, location, radius ? parseInt(radius) : 5000);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Erro no autocomplete:', error);
      res.status(error.message.includes('não configurada') ? 503 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/geolocation/validate-address
 * @desc    Validar se um endereço existe
 * @access  Private
 */
router.post(
  '/validate-address',
  auth,
  [body('address').notEmpty().withMessage('Endereço é obrigatório')],
  validate,
  async (req, res) => {
    try {
      const { address } = req.body;
      const result = await googleMapsService.validateAddress(address);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Erro na validação de endereço:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/geolocation/delivery-estimate
 * @desc    Calcular taxa e tempo estimado de entrega
 * @access  Public
 */
router.post(
  '/delivery-estimate',
  [
    body('origin').notEmpty().withMessage('Origem é obrigatória'),
    body('destination').notEmpty().withMessage('Destino é obrigatório'),
    body('preparationTime').optional().isInt({ min: 0 }).withMessage('Tempo de preparo inválido'),
  ],
  validate,
  async (req, res) => {
    try {
      const { origin, destination, preparationTime = 30 } = req.body;
      
      // Calcular distância
      const distanceResult = await googleMapsService.calculateDistance(origin, destination);
      const distanceInMeters = distanceResult.distance.value;
      
      // Calcular taxa de entrega
      const deliveryFee = googleMapsService.calculateDeliveryFee(distanceInMeters);
      
      // Estimar tempo
      const deliveryTime = googleMapsService.estimateDeliveryTime(distanceInMeters, preparationTime);

      res.json({
        success: true,
        data: {
          distance: distanceResult.distance,
          duration: distanceResult.duration,
          deliveryFee,
          estimatedTime: deliveryTime,
        },
      });
    } catch (error) {
      console.error('Erro na estimativa de entrega:', error);
      res.status(error.message.includes('não configurada') ? 503 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
