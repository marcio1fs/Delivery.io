import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
  }
};

// Configuração do multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter,
});

// Otimizar imagem
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width = 800,
      height = 800,
      quality = 80,
      format = 'webp',
    } = options;

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toFile(outputPath);

    // Remover arquivo original
    fs.unlinkSync(inputPath);

    return {
      success: true,
      path: outputPath,
      format,
    };
  } catch (error) {
    logger.error('Erro ao otimizar imagem:', error);
    throw error;
  }
};

// Controller de upload
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado',
      });
    }

    const originalPath = req.file.path;
    const optimizedPath = `${originalPath.split('.')[0]}.webp`;

    // Otimizar imagem
    await optimizeImage(originalPath, optimizedPath);

    const imageUrl = `/uploads/${path.basename(optimizedPath)}`;

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    logger.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da imagem',
      error: error.message,
    });
  }
};

// Upload múltiplo
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado',
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const originalPath = file.path;
      const optimizedPath = `${originalPath.split('.')[0]}.webp`;

      await optimizeImage(originalPath, optimizedPath);

      uploadedImages.push({
        url: `/uploads/${path.basename(optimizedPath)}`,
        originalName: file.originalname,
        size: file.size,
      });
    }

    res.status(200).json({
      success: true,
      data: uploadedImages,
    });
  } catch (error) {
    logger.error('Erro no upload múltiplo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload das imagens',
      error: error.message,
    });
  }
};

// Middleware específico para diferentes tipos de upload
export const uploadRestaurantImage = upload.single('image');
export const uploadProductImage = upload.single('image');
export const uploadAvatar = upload.single('avatar');
export const uploadGallery = upload.array('images', 10);
