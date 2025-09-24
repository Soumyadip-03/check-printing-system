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

export const SBI_TEMPLATE = {
  "id": "SBI_cheque_template_001",
  "name": "SBI Template",
  "overall_size": {
    "width": { "mm": 205, "px": 2421 },
    "height": { "mm": 93, "px": 1098 }
  },
  "fields": {
    "payeeName": {
      "width_px": 1394,
      "height_px": 68,
      "x_px": 250,
      "y_px": 221
    },
    "date_section": {
      "day_box_1": {"width_px": 65, "height_px": 68, "x_px": 1773, "y_px": 72},
      "day_box_2": {"width_px": 65, "height_px": 68, "x_px": 1840, "y_px": 72},
      "month_box_1": {"width_px": 65, "height_px": 68, "x_px": 1907, "y_px": 72},
      "month_box_2": {"width_px": 65, "height_px": 68, "x_px": 1974, "y_px": 72},
      "year_box_1": {"width_px": 65, "height_px": 68, "x_px": 2041, "y_px": 72},
      "year_box_2": {"width_px": 65, "height_px": 68, "x_px": 2108, "y_px": 72},
      "year_box_3": {"width_px": 65, "height_px": 68, "x_px": 2175, "y_px": 72},
      "year_box_4": {"width_px": 65, "height_px": 68, "x_px": 2242, "y_px": 72}
    },
    "amountInNumbers": {
      "width_px": 455,
      "height_px": 86,
      "x_px": 1821,
      "y_px": 415
    },
    "amountInWords": {
      "width_px": 1894,
      "height_px": 68,
      "x_px": 366,
      "y_px": 320
    },
    "amountInWords_line2": {
      "width_px": 1894,
      "height_px": 68,
      "x_px": 366,
      "y_px": 435
    }
  }
};