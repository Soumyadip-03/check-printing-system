import React from 'react';
import { ChequeRenderer } from '../utils/chequeRenderer';

const PrintOnly = ({ checkData, template }) => {
  if (!checkData || !template) return null;

  const renderer = new ChequeRenderer(template);

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

  const { day, month, year } = formatDate(checkData.date);
  const { line1, line2 } = renderer.splitAmountWords(checkData.amountInWords);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'transparent'
    }}>
      <div style={renderer.getChequeContainer()}>
        {/* Payee Name */}
        <div style={renderer.renderPayeeName(checkData.payeeName)}>
          {checkData.payeeName}
        </div>

        {/* Date Boxes */}
        <div style={renderer.renderDateBox('day_box_1', day[0])}>{day[0]}</div>
        <div style={renderer.renderDateBox('day_box_2', day[1])}>{day[1]}</div>
        <div style={renderer.renderDateBox('month_box_1', month[0])}>{month[0]}</div>
        <div style={renderer.renderDateBox('month_box_2', month[1])}>{month[1]}</div>
        <div style={renderer.renderDateBox('year_box_1', year[0])}>{year[0]}</div>
        <div style={renderer.renderDateBox('year_box_2', year[1])}>{year[1]}</div>
        <div style={renderer.renderDateBox('year_box_3', year[2])}>{year[2]}</div>
        <div style={renderer.renderDateBox('year_box_4', year[3])}>{year[3]}</div>

        {/* Amount in Numbers */}
        <div style={renderer.renderAmountNumbers(checkData.amount)}>
          {parseFloat(checkData.amount).toFixed(2)}
        </div>

        {/* Amount in Words */}
        <div style={renderer.renderAmountWords(line1)}>
          {line1}
        </div>

        {line2 && (
          <div style={renderer.renderAmountWordsLine2(line2)}>
            {line2}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintOnly;