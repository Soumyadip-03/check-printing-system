import { RENDER_CONFIG } from './constants';

export class ChequeRenderer {
  constructor(template) {
    this.template = template;
    // Fix: Use 300 DPI conversion (25.4mm per inch / 300 DPI)
    this.pxToMm = 25.4 / 300;
    this.verticalOffset = 2; // mm - adjust text down
  }

  // Convert pixel coordinates to millimeters for accurate rendering
  pxToMm(px) {
    return px * this.pxToMm;
  }

  // Calculate font size based on field height and content
  calculateFontSize(field, content = '') {
    const heightMm = (field.height_px || 68) * this.pxToMm;
    const baseFontSize = Math.max(8, Math.min(16, heightMm * 0.6));
    
    // Adjust for content length
    if (content.length > 30) return baseFontSize * 0.9;
    if (content.length > 50) return baseFontSize * 0.8;
    
    return baseFontSize;
  }

  // Get field positioning in mm
  getFieldPosition(field) {
    return {
      left: field.x_px * this.pxToMm,
      top: (field.y_px * this.pxToMm) + this.verticalOffset,
      width: field.width_px * this.pxToMm,
      height: (field.height_px || 68) * this.pxToMm
    };
  }

  // Render payee name field
  renderPayeeName(payeeName) {
    const field = this.template.fields.payeeName;
    const position = this.getFieldPosition(field);
    const fontSize = this.calculateFontSize(field, payeeName);

    return {
      position: 'absolute',
      left: `${position.left}mm`,
      top: `${position.top}mm`,
      width: `${position.width}mm`,
      height: `${position.height}mm`,
      fontSize: `${fontSize}pt`,
      fontFamily: RENDER_CONFIG.FONT_FAMILY,
      fontWeight: RENDER_CONFIG.FONT_WEIGHTS.BOLD,
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
      textTransform: 'uppercase'
    };
  }

  // Render individual date boxes
  renderDateBox(boxName, digit) {
    const box = this.template.fields.date_section[boxName];
    const position = this.getFieldPosition(box);

    return {
      position: 'absolute',
      left: `${position.left}mm`,
      top: `${position.top}mm`,
      width: `${position.width}mm`,
      height: `${position.height}mm`,
      fontSize: '14pt',
      fontFamily: RENDER_CONFIG.FONT_FAMILY,
      fontWeight: RENDER_CONFIG.FONT_WEIGHTS.BOLD,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: RENDER_CONFIG.TEXT_ALIGN.CENTER
    };
  }

  // Render amount in numbers
  renderAmountNumbers(amount) {
    const field = this.template.fields.amountInNumbers;
    const position = this.getFieldPosition(field);
    const fontSize = this.calculateFontSize(field, amount);

    return {
      position: 'absolute',
      left: `${position.left}mm`,
      top: `${position.top}mm`,
      width: `${position.width}mm`,
      height: `${position.height}mm`,
      fontSize: `${fontSize}pt`,
      fontFamily: RENDER_CONFIG.FONT_FAMILY,
      fontWeight: RENDER_CONFIG.FONT_WEIGHTS.BOLD,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      textAlign: RENDER_CONFIG.TEXT_ALIGN.LEFT
    };
  }

  // Render amount in words (line 1)
  renderAmountWords(amountWords) {
    const field = this.template.fields.amountInWords;
    const position = this.getFieldPosition(field);
    const fontSize = this.calculateFontSize(field, amountWords);

    return {
      position: 'absolute',
      left: `${position.left}mm`,
      top: `${position.top}mm`,
      width: `${position.width}mm`,
      height: `${position.height}mm`,
      fontSize: `${fontSize}pt`,
      fontFamily: RENDER_CONFIG.FONT_FAMILY,
      fontWeight: RENDER_CONFIG.FONT_WEIGHTS.BOLD,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    };
  }

  // Render amount in words (line 2)
  renderAmountWordsLine2(amountWords) {
    if (!this.template.fields.amountInWords_line2) return null;
    
    const field = this.template.fields.amountInWords_line2;
    const position = this.getFieldPosition(field);
    const fontSize = this.calculateFontSize(field, amountWords);

    return {
      position: 'absolute',
      left: `${position.left}mm`,
      top: `${position.top}mm`,
      width: `${position.width}mm`,
      height: `${position.height}mm`,
      fontSize: `${fontSize}pt`,
      fontFamily: RENDER_CONFIG.FONT_FAMILY,
      fontWeight: RENDER_CONFIG.FONT_WEIGHTS.BOLD,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden'
    };
  }

  // Split amount words into two lines based on field width
  splitAmountWords(amountWords) {
    const maxCharsLine1 = 65; // Approximate characters for first line
    const words = amountWords.split(' ');
    let line1 = '';
    let line2 = '';
    
    for (let i = 0; i < words.length; i++) {
      if ((line1 + words[i] + ' ').length <= maxCharsLine1) {
        line1 += words[i] + ' ';
      } else {
        line2 = words.slice(i).join(' ');
        break;
      }
    }
    
    return {
      line1: line1.trim(),
      line2: line2.trim()
    };
  }

  // Get cheque container dimensions
  getChequeContainer() {
    return {
      width: `${this.template.overall_size.width.mm}mm`,
      height: `${this.template.overall_size.height.mm}mm`,
      position: 'relative',
      border: '1px solid #ccc',
      backgroundColor: '#fff',
      fontFamily: RENDER_CONFIG.FONT_FAMILY
    };
  }
}