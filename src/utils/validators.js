// Input validation utilities

/**
 * Check if file is a PDF
 */
function isPDF(fileInfo) {
  if (!fileInfo) return false;
  
  const validMimeTypes = ['application/pdf'];
  const validExtensions = ['.pdf'];
  
  const mimeTypeValid = validMimeTypes.includes(fileInfo.mimetype);
  const extensionValid = validExtensions.some(ext => 
    fileInfo.name.toLowerCase().endsWith(ext)
  );
  
  return mimeTypeValid || extensionValid;
}

/**
 * Check if file size is within limits (10MB max)
 */
function isValidFileSize(fileInfo, maxSizeMB = 10) {
  if (!fileInfo || !fileInfo.size) return false;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileInfo.size <= maxSizeBytes;
}

/**
 * Validate file for processing
 */
function validateFile(fileInfo) {
  const errors = [];
  
  if (!fileInfo) {
    errors.push('No file information provided');
    return { valid: false, errors };
  }
  
  if (!isPDF(fileInfo)) {
    errors.push('File must be a PDF');
  }
  
  if (!isValidFileSize(fileInfo)) {
    errors.push('File size must be less than 10MB');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  isPDF,
  isValidFileSize,
  validateFile
};
