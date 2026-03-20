# Scientific Calculator Web App

A sleek, modern scientific calculator web application with a design inspired by iOS/macOS calculators. The UI is presented in Japanese.

## Features

- **Standard Mode**: Basic arithmetic operations (+, -, x, /, %, =, C, CE, backspace)
- **Scientific Mode**: Advanced functions (sin, cos, tan, log, ln, sqrt, x^2, x^3, pi, e, parentheses)
- **Dual Display**: Shows current input and previous operation
- **Keyboard Support**: Full keyboard input for efficient use
- **History Panel**: Stores and displays the last 10 calculations
- **Theme Toggle**: Switch between dark and light themes
- **Copy Result**: One-click copy of the current result to clipboard
- **Responsive Design**: Mobile-friendly grid layout that adapts to any screen size

## Usage

Open `index.html` in any modern web browser. No build step or server required.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0-9` | Number input |
| `+`, `-`, `*`, `/` | Operators |
| `.` | Decimal point |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete last character |
| `Escape` | Clear all (AC) |
| `Delete` | Clear entry (CE) |
| `(`, `)` | Parentheses (scientific mode) |
| `p` | Pi |
| `e` | Euler's number |
| `h` | Toggle history panel |
| `t` | Toggle theme |
| `s` | Toggle standard/scientific mode |

## File Structure

```
calculator-app/
  index.html   - Main HTML structure
  style.css    - All styles and theming
  app.js       - Calculator logic and event handling
  README.md    - This file
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).
