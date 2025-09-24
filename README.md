# Check Printing System

A professional React application for printing bank checks with precise field positioning using uploadable JSON templates.

## Features

### 🏦 Check Form
- Professional form interface with validation
- Auto-uppercase payee names
- Date picker for check dates
- Numeric amount input with ₹ symbol
- Real-time Indian number-to-words conversion
- Template selection dropdown
- Print functionality with preview

### 📄 Template Management
- Upload JSON templates via drag-and-drop or file selection
- Template validation with error reporting
- Activate/deactivate templates
- Delete templates with confirmation
- View template metadata and status

### 📊 History Tracking
- Complete history of all printed checks
- Search functionality across all fields
- Filter by specific fields (payee, amount, date)
- Chronological display with timestamps
- Template information for each check

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Template Format

Templates should be JSON files with the following structure:

```json
{
  "id": "unique_template_id",
  "name": "Template Display Name",
  "dpi": 300,
  "fields": {
    "payeeName": {
      "x": 250,
      "y": 221,
      "width": 1394,
      "fontSize": 16
    },
    "date": {
      "x": 1773,
      "y": 77,
      "width": 533,
      "fontSize": 14
    },
    "amountNumbers": {
      "x": 1821,
      "y": 400,
      "width": 455,
      "fontSize": 16
    },
    "amountWords": {
      "x": 366,
      "y": 320,
      "width": 1894,
      "fontSize": 14
    }
  }
}
```

## SBI Check Specifications

The system is pre-configured for SBI check dimensions:
- Overall Size: 205mm × 93mm (2421px × 1098px)
- Date Section: 533px × 68px at (1773, 77)
- Payee Section: 1394px × 68px at (250, 221)
- Amount Numbers: 455px × 86px at (1821, 400)
- Amount Words: 1894px × 68px at (366, 320)

## Usage

1. **Upload Template**: Go to Templates tab and upload a JSON template file
2. **Fill Check Form**: Select template, enter payee name, date, and amount
3. **Print**: Click "Print Check" to open print dialog
4. **View History**: Check History tab for all printed checks

## Number to Words Conversion

The system converts numbers to Indian format:
- Supports Lakhs and Crores
- Handles decimal places as Paise
- Example: 123450.25 → "One Lakh Twenty Three Thousand Four Hundred Fifty Rupees and Twenty Five Paise Only"

## Print Setup

For best results:
- Use A4 paper size
- Set margins to minimum
- Ensure "Print backgrounds" is enabled
- Use actual size (100% scale)

## Technologies Used

- React 18
- Tailwind CSS
- Lucide React Icons
- Modern JavaScript (ES6+)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge