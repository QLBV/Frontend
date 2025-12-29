/**
 * Utility functions for handling Vietnamese text in PDF generation
 * and other contexts where Unicode support is limited
 */

// Vietnamese character mapping for ASCII conversion
const VIETNAMESE_MAP: { [key: string]: string } = {
  // Lowercase vowels
  'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
  'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
  'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
  'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
  'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
  'đ': 'd',
  
  // Uppercase vowels
  'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
  'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
  'Đ': 'D'
}

/**
 * Convert Vietnamese text to ASCII for PDF compatibility
 * @param text - The Vietnamese text to convert
 * @returns ASCII version of the text
 */
export const convertVietnameseToAscii = (text: string): string => {
  if (!text) return text
  
  return text.replace(
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g,
    (match) => VIETNAMESE_MAP[match] || match
  )
}

/**
 * Remove Vietnamese diacritics while preserving the original characters
 * Useful for search functionality
 * @param text - The Vietnamese text to normalize
 * @returns Text without diacritics
 */
export const removeVietnameseDiacritics = (text: string): string => {
  if (!text) return text
  
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/**
 * Check if text contains Vietnamese characters
 * @param text - Text to check
 * @returns true if contains Vietnamese characters
 */
export const hasVietnameseCharacters = (text: string): boolean => {
  if (!text) return false
  
  const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/
  return vietnameseRegex.test(text)
}

/**
 * Sanitize text for safe HTML rendering
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export const sanitizeText = (text: string): string => {
  if (!text) return text
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Format Vietnamese phone number
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatVietnamesePhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return phoneNumber
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Format based on length
  if (digits.length === 10) {
    // Format: 0xxx xxx xxx
    return digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
  } else if (digits.length === 11) {
    // Format: 0xxx xxxx xxx
    return digits.replace(/(\d{4})(\d{4})(\d{3})/, '$1 $2 $3')
  }
  
  return phoneNumber
}

/**
 * Validate Vietnamese CCCD (Citizen ID)
 * @param cccd - CCCD number to validate
 * @returns true if valid CCCD format
 */
export const isValidVietnameseCCCD = (cccd: string): boolean => {
  if (!cccd) return false
  
  // Remove spaces and check if it's 12 digits
  const digits = cccd.replace(/\s/g, '')
  return /^\d{12}$/.test(digits)
}

/**
 * Format Vietnamese CCCD for display
 * @param cccd - CCCD number to format
 * @returns Formatted CCCD
 */
export const formatVietnameseCCCD = (cccd: string): string => {
  if (!cccd) return cccd
  
  const digits = cccd.replace(/\D/g, '')
  if (digits.length === 12) {
    // Format: xxx xxx xxx xxx
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')
  }
  
  return cccd
}

/**
 * Convert Vietnamese address to standardized format
 * @param address - Address to standardize
 * @returns Standardized address
 */
export const standardizeVietnameseAddress = (address: string): string => {
  if (!address) return address
  
  return address
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/,\s*,/g, ',') // Remove duplicate commas
    .replace(/^\s*,|,\s*$/g, '') // Remove leading/trailing commas
    .trim()
}