/**
 * Server-side image utility functions
 */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const MIN_IMAGES = 2;
const MAX_IMAGES = 4;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates if a file is an image based on MIME type
 */
export function isValidImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Validates file size
 */
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * Validates the number of images
 */
export function isValidImageCount(count: number): boolean {
  return count >= MIN_IMAGES && count <= MAX_IMAGES;
}

/**
 * Validates an uploaded file
 */
export function validateImageFile(file: { type: string; size: number; name: string }): ImageValidationResult {
  if (!isValidImageType(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only image files are allowed. Received: ${file.type}`,
    };
  }

  if (!isValidFileSize(file.size)) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size too large. Maximum size is ${maxSizeMB}MB. File: ${file.name}`,
    };
  }

  return { valid: true };
}

/**
 * Validates multiple image files
 */
export function validateImageFiles(files: { type: string; size: number; name: string }[]): ImageValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      error: 'At least one image is required',
    };
  }

  if (!isValidImageCount(files.length)) {
    return {
      valid: false,
      error: `Please upload between ${MIN_IMAGES} and ${MAX_IMAGES} images. You uploaded ${files.length} image(s).`,
    };
  }

  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
}

/**
 * Converts a File/Blob to base64 data URI
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = file.type || 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Converts multiple Files to base64 data URIs
 */
export async function filesToBase64(files: File[]): Promise<string[]> {
  const base64Promises = files.map(file => fileToBase64(file));
  return Promise.all(base64Promises);
}

/**
 * Validates base64 image string
 */
export function isValidBase64Image(base64String: string): boolean {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }

  // Check if it's a data URI format
  const dataUriPattern = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/;
  if (!dataUriPattern.test(base64String)) {
    return false;
  }

  return true;
}

export { MAX_FILE_SIZE, MIN_IMAGES, MAX_IMAGES };

