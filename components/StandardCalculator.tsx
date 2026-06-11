'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// ============================================
// CALCULATOR ENGINE (inline for self-containment)
// ============================================

interface CalcState {
  display: string;
  expression: string;
  previousResult: string | null;
  operator: string | null;
  waitingForOperand: boolean;
  memory: number;
  history: string;
}

const initialCalcState: CalcState = {
  display: '0',
  expression: '',
  previousResult: null,
  operator: null,
  waitingForOperand: false,
  memory: 0,
  history: '',
};

function compute(a: number, op: string, b: number): number | 'Error' {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? 'Error' : a / b;
    default: return b;
  }
}

function processKey(state: CalcState, key: string): CalcState {
  const s = { ...state };

  // --- Clear ---
  if (key === 'C') {
    return { ...initialCalcState, memory: s.memory };
  }

  // --- Backspace ---
  if (key === '⌫') {
    if (s.waitingForOperand) return s;
    if (s.display === 'Error') return { ...initialCalcState, memory: s.memory };
    const newDisp = s.display.length > 1 ? s.display.slice(0, -1) : '0';
    return { ...s, display: newDisp };
  }

  // --- Plus/Minus ---
  if (key === '±') {
    if (s.display === '0' || s.display === 'Error') return s;
    const newDisp = s.display.startsWith('-') ? s.display.slice(1) : '-' + s.display;
    return { ...s, display: newDisp };
  }

  // --- Percentage ---
  if (key === '%') {
    if (s.display === 'Error') return s;
    const val = parseFloat(s.display) / 100;
    return { ...s, display: String(val), waitingForOperand: true };
  }

  // --- Memory ---
  if (key === 'MC') return { ...s, memory: 0 };
  if (key === 'MR') return { ...s, display: String(s.memory), waitingForOperand: true };
  if (key === 'M+') return { ...s, memory: s.memory + parseFloat(s.display) };
  if (key === 'M-') return { ...s, memory: s.memory - parseFloat(s.display) };

  // --- Digits ---
  if (/^[0-9]$/.test(key)) {
    if (s.display === 'Error') {
      return { ...initialCalcState, memory: s.memory, display: key };
    }
    if (s.waitingForOperand || s.display === '0') {
      // If we just pressed '=' and now type a digit, start fresh
      if (s.previousResult !== null && s.operator === null) {
        return {
          ...initialCalcState,
          memory: s.memory,
          display: key,
        };
      }
      return { ...s, display: key, waitingForOperand: false };
    }
    if (s.display.replace(/[^0-9]/g, '').length >= 16) return s;
    return { ...s, display: s.display + key };
  }

  // --- Decimal ---
  if (key === '.') {
    if (s.display === 'Error') return s;
    if (s.waitingForOperand) {
      return { ...s, display: '0.', waitingForOperand: false };
    }
    if (s.display.includes('.')) return s;
    return { ...s, display: s.display + '.' };
  }

  // --- Operators ---
  if (['+', '-', '×', '÷'].includes(key)) {
    if (s.display === 'Error') return s;

    const current = parseFloat(s.display);

    if (s.operator && !s.waitingForOperand) {
      // Chain: compute intermediate result
      const prev = s.previousResult !== null ? parseFloat(s.previousResult) : 0;
      const result = compute(prev, s.operator, current);
      if (result === 'Error') {
        return { ...initialCalcState, memory: s.memory, display: 'Error', history: '' };
      }
      const resultStr = String(result);
      return {
        ...s,
        display: resultStr,
        previousResult: resultStr,
        operator: key,
        waitingForOperand: true,
        history: `${resultStr} ${key}`,
      };
    }

    return {
      ...s,
      previousResult: String(current),
      operator: key,
      waitingForOperand: true,
      history: `${current} ${key}`,
    };
  }

  // --- Equals ---
  if (key === '=') {
    if (s.display === 'Error' || s.operator === null || s.previousResult === null) return s;

    const prev = parseFloat(s.previousResult);
    const current = parseFloat(s.display);
    const result = compute(prev, s.operator, current);

    if (result === 'Error') {
      return {
        ...initialCalcState,
        memory: s.memory,
        display: 'Error',
        history: `${prev} ${s.operator} ${current} =`,
      };
    }

    const resultStr = String(parseFloat(result.toFixed(10)));
    return {
      ...s,
      display: resultStr,
      previousResult: resultStr,
      operator: null,
      waitingForOperand: true,
      history: `${prev} ${s.operator} ${current} =`,
    };
  }

  return s;
}

function formatDisplay(value: string): string {
  if (value === 'Error') return 'Error';
  if (value === '' || value === '-') return value;

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  // If the user is still typing a decimal (e.g. "3." or "3.0")
  if (value.endsWith('.') || (value.includes('.') && value.endsWith('0') && !value.includes('e'))) {
    const parts = value.split('.');
    const intPart = parseInt(parts[0], 10);
    const formatted = new Intl.NumberFormat('en-IN').format(Math.abs(intPart));
    return (intPart < 0 ? '-' : '') + formatted + '.' + (parts[1] || '');
  }

  if (Math.abs(num) >= 1e15) {
    return num.toExponential(6);
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 10,
  }).format(num);
}

function mapKeyboardKey(key: string): string | null {
  if (/^[0-9]$/.test(key)) return key;
  const map: Record<string, string> = {
    'Enter': '=', 'Backspace': '⌫', 'Escape': 'C', 'Delete': 'C',
    '.': '.', '+': '+', '-': '-', '*': '×', '/': '÷', '%': '%',
  };
  return map[key] ?? null;
}

// ============================================
// COMPONENT
// ============================================

export default function StandardCalculator() {
  const [state, setState] = useState<CalcState>(initialCalcState);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleKey = useCallback((key: string) => {
    setState((prev) => processKey(prev, key));
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 120);
  }, []);

  // Keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mapped = mapKeyboardKey(e.key);
      if (mapped) {
        e.preventDefault();
        handleKey(mapped);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  // Button layout definition
  const buttons: { key: string; label?: string; span?: number; variant: 'num' | 'op' | 'func' | 'equal' | 'memory' }[] = [
    // Row 1: Memory
    { key: 'MC', variant: 'memory' },
    { key: 'MR', variant: 'memory' },
    { key: 'M+', variant: 'memory' },
    { key: 'M-', variant: 'memory' },
    // Row 2: Top function
    { key: 'C', variant: 'func' },
    { key: '±', variant: 'func' },
    { key: '%', variant: 'func' },
    { key: '÷', variant: 'op' },
    // Row 3-6: Number pad
    { key: '7', variant: 'num' },
    { key: '8', variant: 'num' },
    { key: '9', variant: 'num' },
    { key: '×', variant: 'op' },

    { key: '4', variant: 'num' },
    { key: '5', variant: 'num' },
    { key: '6', variant: 'num' },
    { key: '-', variant: 'op' },

    { key: '1', variant: 'num' },
    { key: '2', variant: 'num' },
    { key: '3', variant: 'num' },
    { key: '+', variant: 'op' },

    { key: '⌫', variant: 'func' },
    { key: '0', variant: 'num' },
    { key: '.', variant: 'num' },
    { key: '=', variant: 'equal' },
  ];

  const getButtonClass = (variant: string, key: string) => {
    const isPressed = pressedKey === key;
    const base = 'relative flex items-center justify-center font-sans font-bold text-base md:text-lg rounded-2xl border transition-all duration-150 cursor-pointer focus:outline-none select-none active:scale-[0.92] min-h-[56px] md:min-h-[64px]';

    switch (variant) {
      case 'num':
        return `${base} ${isPressed ? 'bg-slate-300 dark:bg-white/20 scale-[0.92]' : 'bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'} text-slate-900 dark:text-white border-slate-200/30 dark:border-white/5`;
      case 'op':
        return `${base} ${isPressed ? 'bg-amber-600 scale-[0.92]' : 'bg-amber-500/15 dark:bg-amber-500/25 hover:bg-amber-500 hover:text-white'} text-amber-500 border-amber-500/20 font-extrabold text-xl`;
      case 'func':
        return `${base} ${isPressed ? 'bg-slate-400 dark:bg-white/20 scale-[0.92]' : 'bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15'} text-slate-700 dark:text-slate-300 border-slate-200/30 dark:border-white/5`;
      case 'equal':
        return `${base} ${isPressed ? 'opacity-80 scale-[0.92]' : 'hover:opacity-90'} bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/25 font-extrabold text-xl`;
      case 'memory':
        return `${base} ${isPressed ? 'bg-slate-300 dark:bg-white/15 scale-[0.92]' : 'bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'} text-slate-500 dark:text-slate-400 border-transparent text-xs font-extrabold`;
      default:
        return base;
    }
  };

  const displayValue = formatDisplay(state.display);
  const displaySize = displayValue.length > 14 ? 'text-xl md:text-2xl' : displayValue.length > 10 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl';

  return (
    <div className="space-y-8">

      {/* Calculator body */}
      <section className="max-w-md mx-auto">
        <div className="p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl">

          {/* Display screen */}
          <div className="bg-slate-950/90 border border-white/5 p-5 md:p-6 rounded-2xl font-mono text-right space-y-1 select-none mb-5 relative overflow-hidden">
            {/* Branding */}
            <div className="absolute top-2 left-4 text-[9px] uppercase tracking-widest text-indigo-400 font-sans font-bold">
              ScaleCalc Standard
            </div>

            {/* History / expression line */}
            <div className="text-slate-500 text-xs min-h-[16px] truncate pt-3">
              {state.history}
            </div>

            {/* Main display */}
            <motion.div
              key={state.display}
              initial={{ opacity: 0.7, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className={`text-white font-bold font-mono tracking-tight truncate ${displaySize}`}
            >
              {displayValue}
            </motion.div>

            {/* Memory indicator */}
            <div className="flex items-center justify-between text-[9px] font-sans font-bold text-slate-500 pt-2 border-t border-white/5">
              <span className={state.memory !== 0 ? 'text-indigo-400' : ''}>
                M: {state.memory !== 0 ? state.memory.toLocaleString() : '—'}
              </span>
              <span className="text-slate-600">
                ⌨ Keyboard Active
              </span>
            </div>
          </div>

          {/* Keypad grid */}
          <div className="grid grid-cols-4 gap-2.5 md:gap-3">
            {buttons.map((btn) => (
              <motion.button
                key={btn.key}
                onClick={() => handleKey(btn.key)}
                whileTap={{ scale: 0.9 }}
                className={getButtonClass(btn.variant, btn.key)}
                aria-label={btn.label || btn.key}
              >
                {btn.label || btn.key}
              </motion.button>
            ))}
          </div>

          {/* Keyboard hint */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans select-none">
              Use number keys, operators (+, -, *, /), Enter to calculate, Escape to clear
            </p>
          </div>
        </div>
      </section>

      {/* Info section below the calculator */}
      <section className="max-w-md mx-auto p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
        <h3 className="font-sans font-black text-base text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3">
          Features & Shortcuts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: '⌨️', title: 'Full Keyboard Support', desc: 'Use your keyboard for lightning-fast calculations' },
            { icon: '💾', title: 'Memory Functions', desc: 'MC, MR, M+, M- for storing intermediate results' },
            { icon: '📊', title: 'Smart Formatting', desc: 'Numbers auto-format with Indian numeral commas' },
            { icon: '🛡️', title: 'Error Safe', desc: 'Handles division by zero and overflow gracefully' },
          ].map((feat, idx) => (
            <div key={idx} className="p-4 bg-slate-100/30 dark:bg-white/5 border border-slate-200/20 dark:border-white/5 rounded-xl">
              <div className="text-lg mb-2">{feat.icon}</div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-sans font-black select-none">
            Keyboard Shortcuts
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ['0-9', 'Number input'],
              ['+  -  *  /', 'Operators'],
              ['Enter', 'Calculate (=)'],
              ['Backspace', 'Delete last digit'],
              ['Escape', 'Clear all (C)'],
              ['.', 'Decimal point'],
              ['%', 'Percentage'],
              ['Delete', 'Clear all (C)'],
            ].map(([shortcut, desc], idx) => (
              <div key={idx} className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-200/50 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded font-mono text-[10px] border border-slate-300/30 dark:border-white/10">
                  {shortcut}
                </kbd>
                <span className="text-slate-500 dark:text-slate-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
