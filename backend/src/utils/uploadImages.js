import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { cloudinary, hasCloudinaryConfig } from '../config/cloudinary.js';

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'marketplace-products', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });

const extensionFromFile = (file) => {
  const originalExtension = path.extname(file.originalname || '');
  if (originalExtension) return originalExtension.toLowerCase();
  if (file.mimetype === 'image/png') return '.png';
  if (file.mimetype === 'image/webp') return '.webp';
  return '.jpg';
};

const uploadBufferLocally = async (file, req) => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}${extensionFromFile(file)}`;
  await fs.writeFile(path.join(uploadDir, filename), file.buffer);
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

export const collectImageUrls = async (req, files = [], bodyImages) => {
  const urlImages = Array.isArray(bodyImages) ? bodyImages : bodyImages ? [bodyImages] : [];

  if (!files.length) {
    return urlImages.filter(Boolean);
  }

  const uploaded = hasCloudinaryConfig
    ? await Promise.all(files.map(uploadBufferToCloudinary))
    : await Promise.all(files.map((file) => uploadBufferLocally(file, req)));

  return [...urlImages, ...uploaded];
};
