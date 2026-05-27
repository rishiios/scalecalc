/**
 * ScaleCalc Reusable Calculator & Rendering Engine
 */

export function renderCalculator(calc, container) {
  if (!calc || !container) return;

  // Set the theme class on the main wrapper
  container.className = `workspace-wrapper ${calc.color}-theme`;

  // Draw core workspace header
  let html = `
    <div class="workspace-header">
      <button class="back-btn" id="btn-back-dashboard" title="Back to Dashboard">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>
      <div class="workspace-title-box">
        <h1>${calc.title}</h1>
        <p>${calc.description}</p>
      </div>
    </div>
  `;

  // If scientific or converter, render their custom template
  if (calc.type === 'custom_scientific') {
    html += renderScientificLayout();
    html += renderInfoPanel(calc);
    container.innerHTML = html;
    initScientificEvents();
    return;
  }

  if (calc.type === 'custom_converter') {
    html += renderConverterLayout();
    html += renderInfoPanel(calc);
    container.innerHTML = html;
    initConverterEvents();
    return;
  }

  // Standard Form Layout
  html += `
    <div class="calc-layout">
      <div class="inputs-panel">
        <form id="calc-form" onsubmit="return false;">
          ${calc.inputs.map(input => renderField(input)).join('')}
        </form>
      </div>
      <div class="outputs-panel">
        <div class="outputs-container" id="calc-outputs-box">
          <!-- Realtime results populated here -->
        </div>
        <div id="calc-visualizer-box" class="visualizer-container" style="display: none;">
          <!-- SVG Charts/Gauges rendered here -->
        </div>
      </div>
    </div>
  `;

  // Append Info Panel
  html += renderInfoPanel(calc);

  container.innerHTML = html;

  // Initialize interactive dynamic values & triggers
  const form = container.querySelector('#calc-form');
  const inputElements = form.querySelectorAll('input, select');

  inputElements.forEach(elem => {
    if (elem.type === 'range') {
      const numInput = form.querySelector(`#${elem.id}-num`);
      
      // 1. Sync from range slider drag to number input box
      elem.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (numInput) numInput.value = value;
        
        const display = container.querySelector(`#val-display-${elem.id}`);
        if (display) {
          const unit = elem.dataset.unit || '';
          display.textContent = formatValue(value, elem.dataset.inputType, unit);
        }
        triggerEvaluation(calc, form);
      });

      // 2. Sync from keyboard typing input box back to range slider
      if (numInput) {
        numInput.addEventListener('input', (e) => {
          let value = parseFloat(e.target.value);
          if (isNaN(value)) return;
          
          // Clamp value within slide boundaries
          const min = parseFloat(elem.min);
          const max = parseFloat(elem.max);
          if (value < min) value = min;
          if (value > max) value = max;
          
          elem.value = value;
          
          const display = container.querySelector(`#val-display-${elem.id}`);
          if (display) {
            const unit = elem.dataset.unit || '';
            display.textContent = formatValue(value, elem.dataset.inputType, unit);
          }
          triggerEvaluation(calc, form);
        });
      }
    } else if (elem.type === 'text' || elem.type === 'number') {
      elem.addEventListener('input', () => triggerEvaluation(calc, form));
    } else {
      elem.addEventListener('change', () => triggerEvaluation(calc, form));
    }
  });

  // Perform initial immediate run
  triggerEvaluation(calc, form);
}

// --- Helper Functions to Format Outputs ---
function formatValue(value, type, unit = '') {
  const currencySymbol = window.activeCurrencySymbol || '$';
  if (type === 'slider' || !type) {
    if (unit === '$') {
      return currencySymbol + Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return value.toLocaleString() + unit;
  }
  return value + unit;
}

function renderField(field) {
  const displayVal = formatValue(field.default, field.type, field.unit);
  
  if (field.type === 'slider') {
    return `
      <div class="input-group">
        <div class="input-header">
          <label class="input-label" for="${field.id}">${field.label}</label>
          <span class="input-value-display" id="val-display-${field.id}">${displayVal}</span>
        </div>
        <div class="slider-container" style="display: flex; align-items: center; gap: 0.75rem;">
          <input 
            type="range" 
            id="${field.id}" 
            name="${field.id}" 
            min="${field.min}" 
            max="${field.max}" 
            step="${field.step}" 
            value="${field.default}"
            data-unit="${field.unit || ''}"
            data-input-type="${field.type}"
            style="flex: 1;"
          >
          <input 
            type="number" 
            id="${field.id}-num" 
            class="field-input" 
            style="width: 105px; padding: 0.35rem 0.5rem; text-align: right; font-weight: 700; font-family: 'Outfit', sans-serif; font-size: 0.9rem;"
            min="${field.min}" 
            max="${field.max}" 
            step="${field.step}" 
            value="${field.default}"
          >
        </div>
      </div>
    `;
  }

  if (field.type === 'select') {
    const names = field.optionNames || {};
    return `
      <div class="input-group">
        <div class="input-header">
          <label class="input-label" for="${field.id}">${field.label}</label>
        </div>
        <select class="field-select" id="${field.id}" name="${field.id}">
          ${field.options.map(opt => `
            <option value="${opt}" ${opt === field.default ? 'selected' : ''}>
              ${names[opt] || opt + (field.suffix || '')}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }

  if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
    return `
      <div class="input-group">
        <div class="input-header">
          <label class="input-label" for="${field.id}">${field.label}</label>
        </div>
        <input 
          type="${field.type}" 
          id="${field.id}" 
          name="${field.id}" 
          class="field-input" 
          value="${field.default}"
          placeholder="${field.placeholder || ''}"
        >
      </div>
    `;
  }

  return '';
}

function triggerEvaluation(calc, form) {
  const formData = new FormData(form);
  const inputs = {};
  for (let [key, val] of formData.entries()) {
    inputs[key] = val;
  }

  const { results, chartData, gaugeData } = calc.calculate(inputs);

  // Render text outputs
  const outputsBox = document.getElementById('calc-outputs-box');
  if (outputsBox) {
    const heroOutput = calc.outputs.find(o => o.isHero);
    const secondaryOutputs = calc.outputs.filter(o => !o.isHero);

    let resultsHtml = '';
    const currencySymbol = window.activeCurrencySymbol || '$';
    
    if (heroOutput && results[heroOutput.id] !== undefined) {
      const val = results[heroOutput.id];
      const formatted = heroOutput.type === 'currency' ? currencySymbol + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val;
      resultsHtml += `
        <div class="output-hero">
          <div class="output-hero-label">${heroOutput.label}</div>
          <div class="output-hero-value" id="out-${heroOutput.id}">${formatted}</div>
        </div>
      `;
    }

    if (secondaryOutputs.length > 0) {
      resultsHtml += `<div class="secondary-results">`;
      secondaryOutputs.forEach(out => {
        const val = results[out.id];
        let formatted = val;
        if (out.type === 'currency') {
          formatted = currencySymbol + Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        }
        resultsHtml += `
          <div class="result-card">
            <div class="result-card-label">${out.label}</div>
            <div class="result-card-value" id="out-${out.id}">${formatted}</div>
          </div>
        `;
      });
      resultsHtml += `</div>`;
    }

    outputsBox.innerHTML = resultsHtml;
  }

  // Render visuals
  const visualBox = document.getElementById('calc-visualizer-box');
  if (visualBox) {
    if (chartData) {
      visualBox.style.display = 'block';
      renderSVGChart(chartData, visualBox, calc.color);
    } else if (gaugeData) {
      visualBox.style.display = 'block';
      renderSVGGauge(gaugeData, visualBox);
    } else {
      visualBox.style.display = 'none';
    }
  }
}

// --- Dynamic SVG Graph Drawing Logic ---
function renderSVGChart(chartData, container, colorTheme) {
  const points = chartData.points || [];
  if (points.length === 0) return;

  const width = 450;
  const height = 240;
  const paddingLeft = 55;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Compute boundaries
  const xValues = points.map(p => parseFloat(p.x));
  const yValues = points.map(p => parseFloat(p.y));

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = 0;
  const maxY = Math.max(...yValues) * 1.05; // 5% pad

  const getX = (x) => paddingLeft + ((x - minX) / (maxX - minX)) * chartW;
  const getY = (y) => height - paddingBottom - ((y - minY) / (maxY - minY)) * chartH;

  // Build path strings
  let linePath = '';
  let areaPath = '';

  points.forEach((p, idx) => {
    const px = getX(parseFloat(p.x));
    const py = getY(parseFloat(p.y));

    if (idx === 0) {
      linePath = `M ${px} ${py}`;
      areaPath = `M ${px} ${height - paddingBottom} L ${px} ${py}`;
    } else {
      linePath += ` L ${px} ${py}`;
      areaPath += ` L ${px} ${py}`;
    }

    if (idx === points.length - 1) {
      areaPath += ` L ${px} ${height - paddingBottom} Z`;
    }
  });

  // Calculate ticks
  const xTicksCount = 5;
  const yTicksCount = 4;
  let xTicksHtml = '';
  let yTicksHtml = '';
  let gridHtml = '';

  // X Axis Ticks
  for (let i = 0; i < xTicksCount; i++) {
    const fraction = i / (xTicksCount - 1);
    const val = minX + fraction * (maxX - minX);
    const px = getX(val);
    xTicksHtml += `<text x="${px}" y="${height - 15}" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-weight="500">${val.toFixed(0)}</text>`;
  }

  // Y Axis Ticks & Grid Lines
  for (let i = 0; i < yTicksCount; i++) {
    const fraction = i / (yTicksCount - 1);
    const val = minY + fraction * (maxY - minY);
    const py = getY(val);
    
    // Format big numbers
    let label = val;
    if (val >= 1000000) label = (val / 1000000).toFixed(1) + 'M';
    else if (val >= 1000) label = (val / 1000).toFixed(0) + 'K';
    else label = val.toFixed(0);

    const currencySymbol = window.activeCurrencySymbol || '$';
    yTicksHtml += `<text x="${paddingLeft - 12}" y="${py + 3}" text-anchor="end" fill="var(--text-muted)" font-size="10" font-weight="500">${currencySymbol}${label}</text>`;
    gridHtml += `<line x1="${paddingLeft}" y1="${py}" x2="${width - paddingRight}" y2="${py}" class="chart-grid" />`;
  }

  // SVG Base Markup
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="visualizer-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chart-glow-${colorTheme}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent-${colorTheme})" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="var(--accent-${colorTheme})" stop-opacity="0"/>
        </linearGradient>
      </defs>
      
      <!-- Grid -->
      ${gridHtml}

      <!-- Graph Areas -->
      <path d="${areaPath}" fill="url(#chart-glow-${colorTheme})" class="chart-area" />
      <path d="${linePath}" class="chart-line" />

      <!-- Axes -->
      <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis" />
      <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" class="chart-axis" />

      <!-- Labels & Ticks -->
      ${xTicksHtml}
      ${yTicksHtml}
      
      <!-- Axis Legend Labels -->
      <text x="${width / 2 + 15}" y="${height - 2}" text-anchor="middle" fill="var(--text-muted)" font-size="9" letter-spacing="1" font-weight="600" text-transform="uppercase">${chartData.xLabel}</text>
    </svg>
  `;
}

// --- Dynamic SVG Gauge Drawing Logic ---
function renderSVGGauge(gaugeData, container) {
  const val = Math.max(gaugeData.min, Math.min(gaugeData.max, gaugeData.value));
  const min = gaugeData.min;
  const max = gaugeData.max;

  // Convert to degrees (180deg total range, semi-circle)
  const percent = (val - min) / (max - min);
  const angle = -90 + percent * 180; // range from -90deg to +90deg

  // SVG dimensions
  const width = 200;
  const height = 110;
  const radius = 70;
  const cx = 100;
  const cy = 85;

  // Standard Gauges math
  const circum = Math.PI * radius; // full semi-circle length
  const dashoffset = circum - percent * circum;

  // Determine indicator color
  let indicatorColor = 'var(--accent-emerald)';
  if (val < 18.5) indicatorColor = '#60a5fa'; // Blue
  else if (val >= 25 && val < 30) indicatorColor = '#f59e0b'; // Amber
  else if (val >= 30) indicatorColor = '#ef4444'; // Red

  container.innerHTML = `
    <div style="text-align: center; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.5px;">BMI Meter</div>
    <svg viewBox="0 0 ${width} ${height}" style="max-width: 260px; margin: 0 auto; display: block;" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Arc -->
      <path d="M 30 85 A 70 70 0 0 1 170 85" class="gauge-track" />
      
      <!-- Progress Fill -->
      <path d="M 30 85 A 70 70 0 0 1 170 85" 
            class="gauge-progress" 
            stroke="${indicatorColor}"
            stroke-dasharray="${circum}" 
            stroke-dashoffset="${dashoffset}" />
            
      <!-- Pointer Needle -->
      <polygon points="100,22 97,85 103,85" class="gauge-pin" style="transform: rotate(${angle}deg);" />
      <circle cx="100" cy="85" r="5" fill="var(--text-primary)" />
      
      <!-- Gauge Bounds Labels -->
      <text x="25" y="102" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-weight="600">${min}</text>
      <text x="175" y="102" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-weight="600">${max}</text>
      <text x="100" y="80" text-anchor="middle" fill="var(--text-primary)" font-family="'Outfit'" font-size="16" font-weight="800">${val.toFixed(1)}</text>
    </svg>
  `;
}

// --- 1. Custom Scientific Calculator Logic ---
let sciExpression = '';
let sciResult = '0';

function renderScientificLayout() {
  return `
    <div class="sci-calc-shell">
      <div class="sci-display-box">
        <div class="sci-expression" id="sci-expr"></div>
        <div class="sci-result" id="sci-res">0</div>
      </div>
      <div class="sci-grid">
        <button class="sci-btn clear" data-val="C">C</button>
        <button class="sci-btn clear" data-val="CE">⌫</button>
        <button class="sci-btn operator" data-val="(">(</button>
        <button class="sci-btn operator" data-val=")">)</button>
        <button class="sci-btn operator" data-val="mod">mod</button>

        <button class="sci-btn operator" data-val="sin">sin</button>
        <button class="sci-btn operator" data-val="cos">cos</button>
        <button class="sci-btn operator" data-val="tan">tan</button>
        <button class="sci-btn operator" data-val="^">^</button>
        <button class="sci-btn operator" data-val="sqrt">√</button>

        <button class="sci-btn operator" data-val="log">log</button>
        <button class="sci-btn operator" data-val="ln">ln</button>
        <button class="sci-btn operator" data-val="pi">π</button>
        <button class="sci-btn operator" data-val="e">e</button>
        <button class="sci-btn operator" data-val="/">÷</button>

        <button class="sci-btn" data-val="7">7</button>
        <button class="sci-btn" data-val="8">8</button>
        <button class="sci-btn" data-val="9">9</button>
        <button class="sci-btn operator" data-val="*">×</button>
        <button class="sci-btn operator" data-val="1/x">1/x</button>

        <button class="sci-btn" data-val="4">4</button>
        <button class="sci-btn" data-val="5">5</button>
        <button class="sci-btn" data-val="6">6</button>
        <button class="sci-btn operator" data-val="-">-</button>
        <button class="sci-btn operator" data-val="fact">n!</button>

        <button class="sci-btn" data-val="1">1</button>
        <button class="sci-btn" data-val="2">2</button>
        <button class="sci-btn" data-val="3">3</button>
        <button class="sci-btn operator" data-val="+">+</button>
        <button class="sci-btn operator" data-val="+/-">±</button>

        <button class="sci-btn" data-val="0" style="grid-column: span 2;">0</button>
        <button class="sci-btn" data-val=".">.</button>
        <button class="sci-btn equals" data-val="=">=</button>
      </div>
    </div>
  `;
}

function initScientificEvents() {
  sciExpression = '';
  sciResult = '0';

  const buttons = document.querySelectorAll('.sci-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      handleScientificKey(val);
    });
  });

  // Handle keyboard events nicely
  document.addEventListener('keydown', handleSciKeyboard);
}

function handleSciKeyboard(e) {
  const activeCalc = document.querySelector('.sci-calc-shell');
  if (!activeCalc) {
    document.removeEventListener('keydown', handleSciKeyboard);
    return;
  }

  const keyMap = {
    'Enter': '=',
    'Escape': 'C',
    'Backspace': 'CE',
    '/': '/',
    '*': '*',
    '-': '-',
    '+': '+',
    '.': '.',
    '(': '(',
    ')': ')',
    '^': '^'
  };

  const key = keyMap[e.key] || (/[0-9]/.test(e.key) ? e.key : null);
  if (key) {
    e.preventDefault();
    handleScientificKey(key);
  }
}

function handleScientificKey(key) {
  const exprDisplay = document.getElementById('sci-expr');
  const resDisplay = document.getElementById('sci-res');

  if (key === 'C') {
    sciExpression = '';
    sciResult = '0';
  } else if (key === 'CE') {
    if (sciExpression.length > 0) {
      sciExpression = sciExpression.trim();
      // If it ends with a function word, backspace it entirely
      const matches = sciExpression.match(/(sin\(|cos\(|tan\(|log\(|ln\(|sqrt\()$/);
      if (matches) {
        sciExpression = sciExpression.slice(0, -matches[0].length);
      } else {
        sciExpression = sciExpression.slice(0, -1);
      }
    }
  } else if (key === '=') {
    try {
      sciResult = evaluateScientificExpression(sciExpression);
      sciExpression = sciResult.toString();
    } catch (err) {
      sciResult = 'Error';
    }
  } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(key)) {
    sciExpression += `${key}(`;
  } else if (key === 'pi') {
    sciExpression += 'π';
  } else if (key === 'e') {
    sciExpression += 'e';
  } else if (key === '1/x') {
    sciExpression += '1/(';
  } else if (key === 'fact') {
    sciExpression += '!';
  } else if (key === '+/-') {
    if (sciExpression.startsWith('-')) {
      sciExpression = sciExpression.slice(1);
    } else {
      sciExpression = '-' + sciExpression;
    }
  } else {
    sciExpression += key;
  }

  if (exprDisplay) exprDisplay.textContent = sciExpression;
  if (resDisplay) resDisplay.textContent = sciResult;
}

function evaluateScientificExpression(expr) {
  if (!expr || expr.trim() === '') return 0;

  // Replace friendly symbols with executable JavaScript
  let formatted = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/mod/g, '%');

  // Handle power calculations e.g., 2^3 => Math.pow(2,3)
  // Simple regex parser for powers
  while (formatted.includes('^')) {
    formatted = formatted.replace(/([0-9.]+|Math\.PI|Math\.E)\^([0-9.]+|Math\.PI|Math\.E)/g, 'Math.pow($1,$2)');
  }

  // Handle factorials (x!) using a quick loop
  if (formatted.includes('!')) {
    formatted = formatted.replace(/([0-9]+)!/g, (_, num) => {
      let n = parseInt(num);
      let f = 1;
      for (let i = 2; i <= n; i++) f *= i;
      return f;
    });
  }

  // Validate math string to protect client security
  if (/[^0-9.+\-*/%() ,Math.sin,Math.cos,Math.tan,Math.log10,Math.log,Math.sqrt,Math.pow,Math.PI,Math.E]/.test(formatted)) {
    throw new Error('Invalid Formula Input');
  }

  // Execute native JavaScript calculation block
  const res = new Function(`return (${formatted})`)();
  if (isNaN(res) || !isFinite(res)) {
    throw new Error('Math Limit Error');
  }
  return Number(res.toFixed(10)); // limit precision length
}

// --- 2. Custom Measurement Unit Converter Logic ---
const unitData = {
  length: {
    label: 'Length',
    base: 'm',
    units: {
      m: { name: 'Meter', val: 1 },
      km: { name: 'Kilometer', val: 1000 },
      cm: { name: 'Centimeter', val: 0.01 },
      mm: { name: 'Millimeter', val: 0.001 },
      mi: { name: 'Mile', val: 1609.344 },
      yd: { name: 'Yard', val: 0.9144 },
      ft: { name: 'Foot', val: 0.3048 },
      in: { name: 'Inch', val: 0.0254 }
    }
  },
  mass: {
    label: 'Mass / Weight',
    base: 'kg',
    units: {
      kg: { name: 'Kilogram', val: 1 },
      g: { name: 'Gram', val: 0.001 },
      lb: { name: 'Pound', val: 0.45359237 },
      oz: { name: 'Ounce', val: 0.028349523 },
      st: { name: 'Stone', val: 6.35029318 }
    }
  },
  volume: {
    label: 'Volume',
    base: 'L',
    units: {
      L: { name: 'Liter', val: 1 },
      mL: { name: 'Milliliter', val: 0.001 },
      gal: { name: 'Gallon (US)', val: 3.78541 },
      qt: { name: 'Quart (US)', val: 0.946353 },
      pt: { name: 'Pint (US)', val: 0.473176 },
      cup: { name: 'Cup (US)', val: 0.24 }
    }
  },
  temp: {
    label: 'Temperature',
    base: 'C',
    custom: true, // Requires customized formula conversions instead of scale multipliers
    units: {
      C: { name: 'Celsius' },
      F: { name: 'Fahrenheit' },
      K: { name: 'Kelvin' }
    }
  }
};

let activeUnitCategory = 'length';

function renderConverterLayout() {
  const cat = unitData[activeUnitCategory];
  const unitKeys = Object.keys(cat.units);

  return `
    <div class="converter-container">
      <!-- Top Categories Switchbar -->
      <div class="unit-types-bar">
        ${Object.entries(unitData).map(([key, val]) => `
          <button class="unit-type-btn ${key === activeUnitCategory ? 'active' : ''}" data-cat="${key}">
            ${val.label}
          </button>
        `).join('')}
      </div>

      <!-- Conversion Interactive Row -->
      <div class="calc-layout">
        <div class="inputs-panel">
          <div class="conversion-matrix">
            <div class="input-group">
              <label class="input-label" for="convert-from-val">Convert From</label>
              <div class="matrix-row">
                <input type="number" id="convert-from-val" class="field-input" value="1" step="any">
                <select id="convert-from-unit" class="field-select">
                  ${unitKeys.map(k => `<option value="${k}">${cat.units[k].name} (${k})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label" for="convert-to-unit">Convert To</label>
              <div class="matrix-row">
                <input type="text" id="convert-to-val" class="field-input" readonly style="background: rgba(255,255,255,0.02);">
                <select id="convert-to-unit" class="field-select">
                  ${unitKeys.map((k, idx) => `<option value="${k}" ${idx === 1 ? 'selected' : ''}>${cat.units[k].name} (${k})</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="outputs-panel">
          <div style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 0.5rem;">Conversion Matrix</div>
          <div class="outputs-container" id="unit-comparison-matrix" style="max-height: 250px; overflow-y: auto;">
            <!-- Complete quick reference comparison list built dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;
}

function initConverterEvents() {
  const container = document.querySelector('.converter-container');
  if (!container) return;

  // Category switch
  const tabs = container.querySelectorAll('.unit-type-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeUnitCategory = tab.dataset.cat;
      const workspace = document.getElementById('calculator-viewport');
      // Re-render
      renderCalculator({
        title: 'Universal Unit Converter',
        description: 'Convert length, weight, volume, and temperature metric scales.',
        color: 'emerald',
        type: 'custom_converter'
      }, workspace);
    });
  });

  const fromVal = document.getElementById('convert-from-val');
  const fromUnit = document.getElementById('convert-from-unit');
  const toVal = document.getElementById('convert-to-val');
  const toUnit = document.getElementById('convert-to-unit');

  const runConversion = () => {
    const val = parseFloat(fromVal.value);
    if (isNaN(val)) {
      toVal.value = '';
      return;
    }

    const cat = unitData[activeUnitCategory];
    const uFrom = fromUnit.value;
    const uTo = toUnit.value;

    const converted = performUnitMath(val, uFrom, uTo, cat);
    toVal.value = converted % 1 === 0 ? converted : parseFloat(converted.toFixed(6));

    // Render comparison list
    renderUnitComparisonMatrix(val, uFrom, cat);
  };

  fromVal.addEventListener('input', runConversion);
  fromUnit.addEventListener('change', runConversion);
  toUnit.addEventListener('change', runConversion);

  runConversion();
}

function performUnitMath(val, from, to, cat) {
  if (from === to) return val;

  // Temperature Conversions
  if (cat.custom) {
    let celsius = 0;
    if (from === 'C') celsius = val;
    else if (from === 'F') celsius = (val - 32) * 5/9;
    else if (from === 'K') celsius = val - 273.15;

    if (to === 'C') return celsius;
    else if (to === 'F') return (celsius * 9/5) + 32;
    else if (to === 'K') return celsius + 273.15;
  }

  // Standard multiplier matrices
  const baseValue = val * cat.units[from].val;
  return baseValue / cat.units[to].val;
}

function renderUnitComparisonMatrix(val, from, cat) {
  const list = document.getElementById('unit-comparison-matrix');
  if (!list) return;

  let html = '';
  Object.keys(cat.units).forEach(k => {
    const outputVal = performUnitMath(val, from, k, cat);
    const formatted = outputVal % 1 === 0 ? outputVal : parseFloat(outputVal.toFixed(5));
    html += `
      <div class="result-card" style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem;">
        <span style="color: var(--text-secondary); font-size: 0.9rem;">${cat.units[k].name}</span>
        <span style="font-family: 'Outfit'; font-weight: 700; font-size: 1rem;">${formatted} <span style="color: var(--text-muted); font-size: 0.75rem; font-weight: 500;">${k}</span></span>
      </div>
    `;
  });
  list.innerHTML = html;
}

function renderInfoPanel(calc) {
  const info = calc.info || {
    formula: 'Secure client-side algorithm',
    explanation: `The ${calc.title} runs entirely on your local device. It takes your input parameters and processes them using local math formulas with zero network latency.`,
    insights: [
      `Your calculations are 100% private. No data is sent to external servers or AI APIs.`,
      `Change your base currency in the header to instantly format results to your local currency.`,
      `Save this page as a bookmark using the heart icon (❤️) on the dashboard to access it instantly.`
    ]
  };

  return `
    <div class="info-panel-wrapper">
      <div class="info-panel-header">
        <span>🧠</span> Formula & Learn More
      </div>
      <div class="info-grid">
        <div class="info-block">
          <h3>How it works</h3>
          <p>${info.explanation}</p>
          <h3>Insights & Pro-Tips</h3>
          <ul>
            ${info.insights.map(ins => `<li>${ins}</li>`).join('')}
          </ul>
        </div>
        <div class="info-block" style="display: flex; flex-direction: column; justify-content: center;">
          <h3 style="text-align: center; margin-bottom: 0.75rem;">Mathematical Formula</h3>
          <div class="formula-box">${info.formula}</div>
        </div>
      </div>
    </div>
  `;
}
