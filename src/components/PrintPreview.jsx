import React from 'react';

const PrintPreview = ({ checkData, template }) => {
  if (!checkData || !template) return null;

  // Preview-specific calculations (scaled down for display)
  const pxToMm = 25.4 / 300; // 300 DPI conversion
  const verticalOffset = 2; // mm
  const previewScale = 0.6; // Scale down for preview display

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
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return { day, month, year };
  };

  if (!template?.fields?.payeeName || !template?.fields?.amountInNumbers || !template?.fields?.amountInWords) {
    return <div>Invalid template format</div>;
  }

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

  return (
    <div className="print-area">
      <div 
        className="check-boundary" 
        style={{
          width: `${template.overall_size.width.mm * previewScale}mm`,
          height: `${template.overall_size.height.mm * previewScale}mm`,
          position: 'relative',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* Payee Name */}
        <div style={{
          position: 'absolute',
          left: `${(template.fields.payeeName.x_px * pxToMm) * previewScale}mm`,
          top: `${(template.fields.payeeName.y_px * pxToMm + verticalOffset) * previewScale}mm`,
          fontSize: `${Math.max(8, 12 * previewScale)}pt`,
          fontWeight: 'bold'
        }}>
          {checkData.payeeName}
        </div>

        {/* Date - Individual Boxes */}
        {template.fields.date_section && (
          <>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.day_box_1.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.day_box_1.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.day_box_1.width_px * pxToMm) * previewScale}mm`
            }}>{day[0]}</div>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.day_box_2.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.day_box_2.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.day_box_2.width_px * pxToMm) * previewScale}mm`
            }}>{day[1]}</div>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.month_box_1.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.month_box_1.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.month_box_1.width_px * pxToMm) * previewScale}mm`
            }}>{month[0]}</div>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.month_box_2.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.month_box_2.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.month_box_2.width_px * pxToMm) * previewScale}mm`
            }}>{month[1]}</div>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.year_box_1.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.year_box_1.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.year_box_1.width_px * pxToMm) * previewScale}mm`
            }}>{year[0]}</div>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.year_box_2.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.year_box_2.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.year_box_2.width_px * pxToMm) * previewScale}mm`
            }}>{year[1]}</div>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.year_box_3.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.year_box_3.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.year_box_3.width_px * pxToMm) * previewScale}mm`
            }}>{year[2]}</div>
            <div style={{
              position: 'absolute',
              left: `${(template.fields.date_section.year_box_4.x_px * pxToMm) * previewScale}mm`,
              top: `${(template.fields.date_section.year_box_4.y_px * pxToMm + verticalOffset) * previewScale}mm`,
              fontSize: `${12 * previewScale}pt`,
              fontWeight: 'bold',
              textAlign: 'center',
              width: `${(template.fields.date_section.year_box_4.width_px * pxToMm) * previewScale}mm`
            }}>{year[3]}</div>
          </>
        )}

        {/* Amount in Numbers */}
        <div style={{
          position: 'absolute',
          left: `${(template.fields.amountInNumbers.x_px * pxToMm) * previewScale}mm`,
          top: `${(template.fields.amountInNumbers.y_px * pxToMm + verticalOffset) * previewScale}mm`,
          fontSize: `${Math.max(8, 12 * previewScale)}pt`,
          fontWeight: 'bold',
          textAlign: 'left',
          width: `${(template.fields.amountInNumbers.width_px * pxToMm) * previewScale}mm`
        }}>
          {parseFloat(checkData.amount).toFixed(2)}
        </div>

        {/* Amount in Words - Line 1 */}
        <div style={{
          position: 'absolute',
          left: `${(template.fields.amountInWords.x_px * pxToMm) * previewScale}mm`,
          top: `${(template.fields.amountInWords.y_px * pxToMm + verticalOffset) * previewScale}mm`,
          fontSize: `${Math.max(7, 11 * previewScale)}pt`,
          fontWeight: 'bold',
          width: `${(template.fields.amountInWords.width_px * pxToMm) * previewScale}mm`
        }}>
          {line1}
        </div>

        {/* Amount in Words - Line 2 */}
        {line2 && template.fields.amountInWords_line2 && (
          <div style={{
            position: 'absolute',
            left: `${(template.fields.amountInWords_line2.x_px * pxToMm) * previewScale}mm`,
            top: `${(template.fields.amountInWords_line2.y_px * pxToMm + verticalOffset) * previewScale}mm`,
            fontSize: `${Math.max(7, 11 * previewScale)}pt`,
            fontWeight: 'bold',
            width: `${(template.fields.amountInWords_line2.width_px * pxToMm) * previewScale}mm`
          }}>
            {line2}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintPreview;