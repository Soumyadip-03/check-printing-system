import React, { useState } from 'react';
import { Calendar, Printer, RotateCcw, AlertCircle, FileText } from 'lucide-react';
import { numberToWordsIndian } from '../utils/numberToWords';
import { sanitizeInput, validateAmount, validatePayeeName, validateDate } from '../utils/validation';
import { ERROR_MESSAGES } from '../utils/constants';

import { parseTemplate } from '../utils/templateParser';

const CheckForm = ({ templates, onPrint }) => {
  const [formData, setFormData] = useState({
    payeeName: '',
    date: '',
    amount: '',
    selectedTemplate: ''
  });
  const [errors, setErrors] = useState({});


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
            <div style="position: absolute; left: ${template.fields.payeeName.x_px * pxToMm}mm; top: ${(template.fields.payeeName.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt;">${checkData.payeeName}</div>
            <div style="position: absolute; left: ${template.fields.date_section.day_box_1.x_px * pxToMm}mm; top: ${(template.fields.date_section.day_box_1.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.day_box_1.width_px * pxToMm}mm;">${day[0]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.day_box_2.x_px * pxToMm}mm; top: ${(template.fields.date_section.day_box_2.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.day_box_2.width_px * pxToMm}mm;">${day[1]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.month_box_1.x_px * pxToMm}mm; top: ${(template.fields.date_section.month_box_1.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.month_box_1.width_px * pxToMm}mm;">${month[0]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.month_box_2.x_px * pxToMm}mm; top: ${(template.fields.date_section.month_box_2.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.month_box_2.width_px * pxToMm}mm;">${month[1]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_1.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_1.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_1.width_px * pxToMm}mm;">${year[0]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_2.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_2.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_2.width_px * pxToMm}mm;">${year[1]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_3.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_3.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_3.width_px * pxToMm}mm;">${year[2]}</div>
            <div style="position: absolute; left: ${template.fields.date_section.year_box_4.x_px * pxToMm}mm; top: ${(template.fields.date_section.year_box_4.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 12pt; text-align: center; width: ${template.fields.date_section.year_box_4.width_px * pxToMm}mm;">${year[3]}</div>
            <div style="position: absolute; left: ${template.fields.amountInNumbers.x_px * pxToMm}mm; top: ${(template.fields.amountInNumbers.y_px * pxToMm) + 1}mm; font-weight: bold; text-align: left; width: ${template.fields.amountInNumbers.width_px * pxToMm}mm; font-size: 12pt;">${parseFloat(checkData.amount).toFixed(2)}</div>
            <div style="position: absolute; left: ${template.fields.amountInWords.x_px * pxToMm}mm; top: ${(template.fields.amountInWords.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 11pt; width: ${template.fields.amountInWords.width_px * pxToMm}mm;">${line1}</div>
            ${line2 && template.fields.amountInWords_line2 ? `<div style="position: absolute; left: ${template.fields.amountInWords_line2.x_px * pxToMm}mm; top: ${(template.fields.amountInWords_line2.y_px * pxToMm) + 1}mm; font-weight: bold; font-size: 11pt; width: ${template.fields.amountInWords_line2.width_px * pxToMm}mm;">${line2}</div>` : ''}
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
    <div className="space-y-8">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Check Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Template *
            </label>
            <select
              value={formData.selectedTemplate}
              onChange={(e) => handleInputChange('selectedTemplate', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.selectedTemplate ? 'border-red-400 bg-red-50/50' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              disabled={activeTemplates.length === 0}
            >
              <option value="">{activeTemplates.length === 0 ? 'No templates available - Upload a template first' : 'Select Template'}</option>
              {activeTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {errors.selectedTemplate && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.selectedTemplate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Date *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                placeholder="DD/MM/YYYY or use calendar"
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.date ? 'border-red-400 bg-red-50/50' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
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
              <Calendar className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Payee Name *
            </label>
            <input
              type="text"
              value={formData.payeeName}
              onChange={(e) => handleInputChange('payeeName', e.target.value)}
              placeholder="Enter payee name"
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.payeeName ? 'border-red-400 bg-red-50/50' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            />
            {errors.payeeName && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.payeeName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">₹</span>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.amount ? 'border-red-400 bg-red-50/50' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.amount}
              </p>
            )}
          </div>
        </div>

        {amountInWords && (
          <div className="mt-8">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Amount in Words
            </label>
            <div className="w-full px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-2 border-blue-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 font-medium">
              {amountInWords}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrint}
            disabled={activeTemplates.length === 0}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl transition-all duration-200 shadow-lg font-semibold ${
              activeTemplates.length === 0 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <Printer className="h-5 w-5" />
            Print Check
          </button>
          <button
            onClick={clearForm}
            className="flex items-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            <RotateCcw className="h-5 w-5" />
            Clear Form
          </button>
        </div>
      </div>

    </div>
  );
};

export default CheckForm;