import React, { useState } from 'react';
import { Calendar, Printer, RotateCcw, Eye } from 'lucide-react';
import { numberToWordsIndian } from '../utils/numberToWords';
import { sanitizeInput, validateAmount, validatePayeeName, validateDate } from '../utils/validation';
import { ERROR_MESSAGES } from '../utils/constants';
import CheckPreview from './CheckPreview';
import PrintOnly from './PrintOnly';
import { parseTemplate } from '../utils/templateParser';

const CheckForm = ({ templates, onPrint }) => {
  const [formData, setFormData] = useState({
    payeeName: '',
    date: '',
    amount: '',
    selectedTemplate: ''
  });
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [printData, setPrintData] = useState(null);

  const handleInputChange = (field, value) => {
    if (field === 'payeeName') {
      value = sanitizeInput(value.toUpperCase());
    }
    if (field === 'amount') {
      value = value.replace(/[^0-9.]/g, '');
      if (value.split('.').length > 2) return;
    }
    if (field === 'date') {
      // Allow typing DD/MM/YYYY format
      value = value.replace(/[^0-9/]/g, '');
      if (value.length <= 10) {
        // Auto-format as user types
        if (value.length === 2 && !value.includes('/')) value += '/';
        if (value.length === 5 && value.split('/').length === 2) value += '/';
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validatePayeeName(formData.payeeName)) {
      newErrors.payeeName = ERROR_MESSAGES.PAYEE_NAME_REQUIRED;
    }
    
    if (!formData.date || !validateDate(formData.date)) {
      newErrors.date = ERROR_MESSAGES.DATE_REQUIRED;
    }
    
    if (!formData.amount || !validateAmount(formData.amount)) {
      newErrors.amount = ERROR_MESSAGES.AMOUNT_REQUIRED;
    }
    
    if (!formData.selectedTemplate) {
      newErrors.selectedTemplate = ERROR_MESSAGES.TEMPLATE_REQUIRED;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrint = () => {
    if (!validateForm()) return;
    
    const checkData = {
      ...formData,
      amountInWords: numberToWordsIndian(parseFloat(formData.amount)),
      printedAt: new Date().toISOString()
    };
    
    const template = parseTemplate(templates.find(t => t.id === formData.selectedTemplate));
    // Fix: Use 300 DPI conversion instead of template ratio
    const pxToMm = 25.4 / 300; // 300 DPI to mm conversion
    const verticalOffset = 2; // mm - adjust text down
    
    const formatDate = (dateStr) => {
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        return {
          day: parts[0].padStart(2, '0'),
          month: parts[1].padStart(2, '0'),
          year: parts[2]
        };
      }
      const date = new Date(dateStr);
      return {
        day: date.getDate().toString().padStart(2, '0'),
        month: (date.getMonth() + 1).toString().padStart(2, '0'),
        year: date.getFullYear().toString()
      };
    };
    
    const { day, month, year } = formatDate(checkData.date);
    
    // Split amount words - fill line 1 completely first
    const line1MaxWidth = template.fields.amountInWords.width_px * pxToMm; // mm
    const avgCharWidth = 2.5; // mm per character (approximate)
    const maxCharsLine1 = Math.floor(line1MaxWidth / avgCharWidth);
    
    const words = checkData.amountInWords.split(' ');
    let line1 = '';
    let line2 = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line1 + (line1 ? ' ' : '') + words[i];
      if (testLine.length <= maxCharsLine1) {
        line1 = testLine;
      } else {
        line2 = words.slice(i).join(' ');
        break;
      }
    }
    
    // If no line2 created but line1 is too long, force split
    if (!line2 && line1.length > maxCharsLine1) {
      const splitPoint = line1.lastIndexOf(' ', maxCharsLine1);
      if (splitPoint > 0) {
        line2 = line1.substring(splitPoint + 1);
        line1 = line1.substring(0, splitPoint);
      }
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { 
              size: ${template.overall_size.width.mm}mm ${template.overall_size.height.mm}mm; 
              margin: 0; 
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              margin: 0; 
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .cheque-container {
              width: ${template.overall_size.width.mm}mm !important;
              height: ${template.overall_size.height.mm}mm !important;
              position: relative;
              transform: none !important;
              zoom: 1 !important;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="cheque-container">
            <div style="position: absolute; left: ${template.fields.payeeName.x_px * pxToMm}mm; top: ${(template.fields.payeeName.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt;">${checkData.payeeName}</div>
            <div style="position: absolute; left: ${template.fields.date_section.day_box_1.x_px * pxToMm}mm; top: ${(template.fields.date_section.day_box_1.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.day_box_1.width_px * pxToMm}mm;">${day[0]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.day_box_2.x_px * pxToMm}mm; top: ${(template.fields.date_section.day_box_2.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.day_box_2.width_px * pxToMm}mm;">${day[1]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.month_box_1.x_px * pxToMm}mm; top: ${(template.fields.date_section.month_box_1.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.month_box_1.width_px * pxToMm}mm;">${month[0]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.month_box_2.x_px * pxToMm}mm; top: ${(template.fields.date_section.month_box_2.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.month_box_2.width_px * pxToMm}mm;">${month[1]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_1.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_1.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_1.width_px * pxToMm}mm;">${year[0]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_2.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_2.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_2.width_px * pxToMm}mm;">${year[1]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_3.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_3.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_3.width_px * pxToMm}mm;">${year[2]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_4.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_4.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_4.width_px * pxToMm}mm;">${year[3]}</div>
            <div style="position: absolute; left: ${template.fields.amountInNumbers.x_px * pxToMm}mm; top: ${(template.fields.amountInNumbers.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; text-align: left; width: ${template.fields.amountInNumbers.width_px * pxToMm}mm; font-size: 12pt;">${parseFloat(checkData.amount).toFixed(2)}</div>
            <div style="position: absolute; left: ${template.fields.amountInWords.x_px * pxToMm}mm; top: ${(template.fields.amountInWords.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 11pt; width: ${template.fields.amountInWords.width_px * pxToMm}mm;">${line1}</div>
            ${line2 && template.fields.amountInWords_line2 ? `<div style="position: absolute; left: ${template.fields.amountInWords_line2.x_px * pxToMm}mm; top: ${(template.fields.amountInWords_line2.y_px * pxToMm) + verticalOffset}mm; font-weight: bold; font-size: 11pt; width: ${template.fields.amountInWords_line2.width_px * pxToMm}mm;">${line2}</div>` : ''}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    setTimeout(() => printWindow.close(), 1000);
    
    onPrint(checkData);
    setFormData({ payeeName: '', date: '', amount: '', selectedTemplate: '' });
  };

  const clearForm = () => {
    setFormData({ payeeName: '', date: '', amount: '', selectedTemplate: '' });
    setErrors({});
  };

  const amountInWords = formData.amount ? numberToWordsIndian(parseFloat(formData.amount)) : '';
  const activeTemplates = templates.filter(t => t.active);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Check Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template *
            </label>
            <select
              value={formData.selectedTemplate}
              onChange={(e) => handleInputChange('selectedTemplate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.selectedTemplate ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Template</option>
              {activeTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {errors.selectedTemplate && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedTemplate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                placeholder="DD/MM/YYYY or use calendar"
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <input
                type="date"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                  handleInputChange('date', formatted);
                }}
                className="absolute right-2 top-2 w-6 h-6 opacity-0 cursor-pointer"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payee Name *
            </label>
            <input
              type="text"
              value={formData.payeeName}
              onChange={(e) => handleInputChange('payeeName', e.target.value)}
              placeholder="Enter payee name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.payeeName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.payeeName && (
              <p className="text-red-500 text-sm mt-1">{errors.payeeName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>
        </div>

        {amountInWords && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount in Words
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
              {amountInWords}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              if (validateForm()) {
                setShowPreview(true);
              }
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview Check
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Check
          </button>
          <button
            onClick={clearForm}
            className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Clear Form
          </button>
        </div>
      </div>
      
      <CheckPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        checkData={{
          ...formData,
          amountInWords: numberToWordsIndian(parseFloat(formData.amount || 0)),
          printedAt: new Date().toISOString()
        }}
        template={formData.selectedTemplate ? parseTemplate(templates.find(t => t.id === formData.selectedTemplate)) : null}
        onPrint={(checkData) => {
          setPrintData({
            checkData,
            template: parseTemplate(templates.find(t => t.id === formData.selectedTemplate))
          });
          
          setTimeout(() => {
            window.print();
            setPrintData(null);
          }, 100);
          
          onPrint(checkData);
          setFormData({ payeeName: '', date: '', amount: '', selectedTemplate: '' });
        }}
      />
      
      {printData && (
        <div className="print-content" style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
          <PrintOnly 
            checkData={printData.checkData} 
            template={printData.template} 
          />
        </div>
      )}
    </div>
  );
};

export default CheckForm;