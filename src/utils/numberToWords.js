const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertHundreds(num) {
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    result += teens[num - 10] + ' ';
    return result.trim();
  }
  
  if (num > 0) {
    result += ones[num] + ' ';
  }
  
  return result.trim();
}

export function numberToWordsIndian(amount) {
  if (amount === 0) return 'Zero Rupees Only';
  
  const [rupees, paise = '0'] = amount.toString().split('.');
  const rupeesNum = parseInt(rupees);
  const paiseNum = parseInt(paise.padEnd(2, '0').substring(0, 2));
  
  let result = '';
  
  if (rupeesNum >= 10000000) {
    const crores = Math.floor(rupeesNum / 10000000);
    result += convertHundreds(crores) + ' Crore ';
    const remaining = rupeesNum % 10000000;
    
    if (remaining >= 100000) {
      const lakhs = Math.floor(remaining / 100000);
      result += convertHundreds(lakhs) + ' Lakh ';
      const thousands = remaining % 100000;
      
      if (thousands >= 1000) {
        const thousandsNum = Math.floor(thousands / 1000);
        result += convertHundreds(thousandsNum) + ' Thousand ';
        const hundreds = thousands % 1000;
        if (hundreds > 0) {
          result += convertHundreds(hundreds) + ' ';
        }
      } else if (thousands > 0) {
        result += convertHundreds(thousands) + ' ';
      }
    } else if (remaining > 0) {
      result += convertHundreds(remaining) + ' ';
    }
  } else if (rupeesNum >= 100000) {
    const lakhs = Math.floor(rupeesNum / 100000);
    result += convertHundreds(lakhs) + ' Lakh ';
    const remaining = rupeesNum % 100000;
    
    if (remaining >= 1000) {
      const thousands = Math.floor(remaining / 1000);
      result += convertHundreds(thousands) + ' Thousand ';
      const hundreds = remaining % 1000;
      if (hundreds > 0) {
        result += convertHundreds(hundreds) + ' ';
      }
    } else if (remaining > 0) {
      result += convertHundreds(remaining) + ' ';
    }
  } else if (rupeesNum >= 1000) {
    const thousands = Math.floor(rupeesNum / 1000);
    result += convertHundreds(thousands) + ' Thousand ';
    const hundreds = rupeesNum % 1000;
    if (hundreds > 0) {
      result += convertHundreds(hundreds) + ' ';
    }
  } else {
    result += convertHundreds(rupeesNum) + ' ';
  }
  
  result += 'Rupees';
  
  if (paiseNum > 0) {
    result += ' and ' + convertHundreds(paiseNum) + ' Paise';
  }
  
  result += ' Only';
  
  return result.trim();
}