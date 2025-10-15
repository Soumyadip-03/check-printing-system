// Application constants
export const APP_CONFIG = {
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  SUPPORTED_FILE_TYPES: ['.json'],
  MAX_PAYEE_NAME_LENGTH: 100,
  MAX_AMOUNT: 999999999,
  MIN_AMOUNT: 0.01
};

// Cheque rendering configuration
export const RENDER_CONFIG = {
  DPI: 300,
  FONT_FAMILY: 'Arial, sans-serif',
  FONT_WEIGHTS: {
    NORMAL: 'normal',
    BOLD: 'bold'
  },
  TEXT_ALIGN: {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
  }
};

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Please upload a valid JSON file',
  FILE_TOO_LARGE: 'File size too large. Maximum 1MB allowed.',
  INVALID_JSON: 'Invalid JSON file format',
  INVALID_TEMPLATE: 'Invalid template structure',
  PAYEE_NAME_REQUIRED: 'Valid payee name is required (1-100 characters)',
  DATE_REQUIRED: 'Valid future date is required',
  AMOUNT_REQUIRED: 'Valid amount is required (0.01 - 999,999,999)',
  TEMPLATE_REQUIRED: 'Template selection is required'
};

export const TEMPLATE_FIELDS = {
  REQUIRED: ['id', 'name', 'fields'],
  FIELD_TYPES: ['payeeName', 'dateSection', 'amountInNumbers', 'amountInWords'],
  DATE_SECTION_REQUIRED: ['container', 'dateBox', 'boxGap']
};

