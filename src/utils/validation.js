// Input validation utilities
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>\"'&]/g, (match) => {
    const entities = { 
      '<': '&lt;', 
      '>': '&gt;', 
      '"': '&quot;', 
      "'": '&#x27;', 
      '&': '&amp;' 
    };
    return entities[match];
  });
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 999999999;
};

export const validatePayeeName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 100;
};

export const validateDate = (date) => {
  if (!date) return false;
  
  // Handle DD/MM/YYYY format
  const parts = date.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2024) {
      const dateObj = new Date(year, month - 1, day);
      return !isNaN(dateObj.getTime());
    }
  }
  
  return false;
};