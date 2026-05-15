import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      logger.warn('Validation errors:', errors.array());

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    next();
  } catch (error) {
    logger.error('Validation middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
