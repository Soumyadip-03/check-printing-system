import React from 'react';
import { X, Printer } from 'lucide-react';
import PrintPreview from './PrintPreview';

const CheckPreview = ({ isOpen, onClose, checkData, template, onPrint }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const pxToMm = 25.4 / 300; // 300 DPI conversion
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
            body { 
              margin: 0; 
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <div style="position: relative; width: ${template.overall_size.width.mm}mm; height: ${template.overall_size.height.mm}mm;">
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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Check Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4 text-center">
            <p className="text-gray-600 mb-2">Preview of your check with template: <span className="font-medium">{template?.name}</span></p>
            <p className="text-sm text-gray-500">Verify all details before printing</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <PrintPreview checkData={checkData} template={template} />
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckPreview;