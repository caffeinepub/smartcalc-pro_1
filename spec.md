# SmartCalc Pro

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full-featured mobile-responsive web calculator app
- Basic calculator: +, -, ×, ÷, %, √, x², x³, xʸ, log, ln, sin, cos, tan, factorial, π, e
- Degree/Radian toggle for trigonometric functions
- Real-time expression preview showing full equation above result
- Scientific mode with expanded button layout
- Graphing mode: plot 2D functions (y = f(x)) with zoom/pan using a canvas-based plotter
- Matrix calculator: 2×2 and 3×3 operations (add, multiply, inverse, determinant)
- Unit converter: length, weight, temperature categories
- EMI & Finance calculator: loan EMI, compound interest, GST
- Programmer mode: binary, octal, hex, decimal conversions with bitwise operations
- Calculation history: auto-save with ability to recall expressions
- Multi-expression support: parse "10+20; 5*6; 100/4" and show all results
- Bracket auto-completion for (, [, {
- Copy result to clipboard
- Dark/light mode toggle
- 5 color themes
- Glassmorphism UI with smooth animations
- Tab/mode navigation: Basic, Scientific, Graph, Matrix, Converter, Finance, Programmer

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: minimal Motoko actor (no persistent data needed for pure calculator)
2. Frontend:
   - Install mathjs for expression parsing
   - Build main App with tab navigation for 7 modes
   - BasicCalculator component with numpad + operators
   - ScientificCalculator with extended functions
   - GraphingCalculator using HTML Canvas
   - MatrixCalculator for matrix operations
   - UnitConverter for length/weight/temperature
   - FinanceCalculator for EMI/compound interest/GST
   - ProgrammerCalculator for base conversions + bitwise
   - HistoryPanel for saved calculations
   - ThemePicker for 5 color schemes
   - Dark/light mode via CSS variables
   - Glassmorphism card styles with Tailwind
