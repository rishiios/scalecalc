'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/lib/context/CurrencyContext';
import SVGChart from '@/components/SVGChart';
import SVGGauge from '@/components/SVGGauge';
import { CalculatorSchema } from '@/lib/schema';
import { calculators } from '@/lib/formulas';
import CalculatorInsights from './CalculatorInsights';
import CalculatorLinks from './CalculatorLinks';

interface CalculatorLayoutProps {
  calcId: string;
}

export default function CalculatorLayout({ calcId }: CalculatorLayoutProps) {
  const calc = calculators[calcId];
  const { currency } = useCurrency();

  // ==========================================
  // --- 1. STATE & CALCULATOR CORE PARSER ---
  // ==========================================
  
  // Initialize state with default schema inputs
  const initialInputs = useMemo(() => {
    const defaults: Record<string, any> = {};
    if (calc.inputs) {
      calc.inputs.forEach((input) => {
        defaults[input.id] = input.default;
      });
    }
    return defaults;
  }, [calc.inputs]);

  const [inputs, setInputs] = useState<Record<string, any>>(initialInputs);

  // Sync default inputs if the calculator changes
  useEffect(() => {
    setInputs(initialInputs);
  }, [initialInputs]);

  // Execute math routine dynamically
  const outputResults = useMemo(() => {
    if (!calc.calculate || Object.keys(inputs).length === 0) return null;
    try {
      return calc.calculate(inputs);
    } catch (e) {
      console.error("Calculation routine error:", e);
      return null;
    }
  }, [calc, inputs]);

  // State handles for input fields
  const handleInputChange = (id: string, val: any) => {
    setInputs((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  // Safe formatting helper
  const formatResultValue = (valStr: string, type: 'currency' | 'number' | 'text') => {
    if (!valStr) return '0';
    if (type === 'currency') {
      const numeric = parseFloat(valStr);
      if (isNaN(numeric)) return valStr;
      
      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numeric);
      
      return `${currency} ${formatted}`;
    }
    if (type === 'number') {
      const numeric = parseFloat(valStr);
      if (isNaN(numeric)) return valStr;
      return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2
      }).format(numeric);
    }
    // Stripe HTML tags from classification outputs safely
    return valStr.replace(/<\/?[^>]+(>|$)/g, "");
  };

  // ==========================================
  // --- 2. MODALITY A: SCIENTIFIC KEYPAD ---
  // ==========================================
  const [sciExpression, setSciExpression] = useState<string>('');
  const [sciResult, setSciResult] = useState<string>('0');
  const [sciHistory, setSciHistory] = useState<string>('');
  const [sciIsRadian, setSciIsRadian] = useState<boolean>(true);
  const [sciMemory, setSciMemory] = useState<number>(0);

  const handleSciKey = (key: string) => {
    if (key === 'C') {
      setSciExpression('');
      setSciResult('0');
      setSciHistory('');
    } else if (key === '⌫') {
      setSciExpression((prev) => prev.slice(0, -1));
    } else if (key === '=') {
      executeScientificEvaluation();
    } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(key)) {
      setSciExpression((prev) => prev + key + '(');
    } else if (key === 'π') {
      setSciExpression((prev) => prev + 'π');
    } else if (key === 'e') {
      setSciExpression((prev) => prev + 'e');
    } else if (key === 'MC') {
      setSciMemory(0);
    } else if (key === 'MR') {
      setSciExpression((prev) => prev + sciMemory.toString());
    } else if (key === 'M+') {
      try {
        const val = parseFloat(sciResult);
        if (!isNaN(val)) setSciMemory((prev) => prev + val);
      } catch (e) {}
    } else if (key === 'M-') {
      try {
        const val = parseFloat(sciResult);
        if (!isNaN(val)) setSciMemory((prev) => prev - val);
      } catch (e) {}
    } else {
      setSciExpression((prev) => prev + key);
    }
  };

  const executeScientificEvaluation = () => {
    if (!sciExpression) return;
    try {
      let parsedExpr = sciExpression
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      // Add radian/degree scaling to trigonometric evaluations
      const angleMultiplier = sciIsRadian ? 1 : Math.PI / 180;
      
      parsedExpr = parsedExpr.replace(/sin\(([^)]+)\)/g, (_, match) => `Math.sin((${match}) * ${angleMultiplier})`);
      parsedExpr = parsedExpr.replace(/cos\(([^)]+)\)/g, (_, match) => `Math.cos((${match}) * ${angleMultiplier})`);
      parsedExpr = parsedExpr.replace(/tan\(([^)]+)\)/g, (_, match) => `Math.tan((${match}) * ${angleMultiplier})`);
      parsedExpr = parsedExpr.replace(/log\(([^)]+)\)/g, (_, match) => `Math.log10(${match})`);
      parsedExpr = parsedExpr.replace(/ln\(([^)]+)\)/g, (_, match) => `Math.log(${match})`);
      parsedExpr = parsedExpr.replace(/sqrt\(([^)]+)\)/g, (_, match) => `Math.sqrt(${match})`);

      // Safely calculate using function executor
      const evaluator = new Function(`return (${parsedExpr})`);
      const ans = evaluator();
      
      if (ans === undefined || isNaN(ans)) {
        setSciResult('Error');
      } else {
        const formattedAns = Number(ans).toLocaleString(undefined, { maximumFractionDigits: 8 });
        setSciResult(formattedAns);
        setSciHistory(sciExpression + ' =');
        setSciExpression(formattedAns);
      }
    } catch (err) {
      setSciResult('Error');
    }
  };

  // ==========================================
  // --- 3. MODALITY B: UNIT CONVERTER MATRIX ---
  // ==========================================
  const [convCategory, setConvCategory] = useState<'length' | 'weight' | 'area' | 'volume' | 'temp'>('length');
  const [convValue, setConvValue] = useState<number>(1);
  const [convFromUnit, setConvFromUnit] = useState<string>('m');

  const unitNames: Record<string, string> = {
    // Length
    m: 'Meters (m)',
    km: 'Kilometers (km)',
    cm: 'Centimeters (cm)',
    mm: 'Millimeters (mm)',
    mi: 'Miles (mi)',
    yd: 'Yards (yd)',
    ft: 'Feet (ft)',
    in: 'Inches (in)',
    // Weight
    kg: 'Kilograms (kg)',
    g: 'Grams (g)',
    mg: 'Milligrams (mg)',
    lb: 'Pounds (lb)',
    oz: 'Ounces (oz)',
    // Area
    sqm: 'Square Meters (m²)',
    sqkm: 'Square Kilometers (km²)',
    sqmi: 'Square Miles (mi²)',
    ac: 'Acres (ac)',
    ha: 'Hectares (ha)',
    // Volume
    l: 'Liters (L)',
    ml: 'Milliliters (mL)',
    gal: 'Gallons (gal)',
    qt: 'Quarts (qt)',
    cup: 'Cups',
    // Temperature
    c: 'Celsius (°C)',
    f: 'Fahrenheit (°F)',
    k: 'Kelvin (K)',
  };

  const converterScales = {
    length: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.34,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254,
    },
    weight: {
      kg: 1000,
      g: 1,
      mg: 0.001,
      lb: 453.592,
      oz: 28.3495,
    },
    area: {
      sqm: 1,
      sqkm: 1000000,
      sqmi: 2590000,
      ac: 4046.86,
      ha: 10000,
    },
    volume: {
      l: 1,
      ml: 0.001,
      gal: 3.78541,
      qt: 0.946353,
      cup: 0.236588,
    },
  };

  // Convert unit logic
  const calculateConversions = () => {
    if (convCategory === 'temp') {
      const c = convValue;
      let celsiusVal = c;
      
      // First scale input to Celsius base
      if (convFromUnit === 'f') celsiusVal = (c - 32) * 5 / 9;
      else if (convFromUnit === 'k') celsiusVal = c - 273.15;

      const outputs: Record<string, number> = {
        c: celsiusVal,
        f: (celsiusVal * 9) / 5 + 32,
        k: celsiusVal + 273.15,
      };

      return Object.keys(outputs).map((unit) => ({
        unit,
        name: unitNames[unit],
        val: outputs[unit],
      }));
    }

    const scales = converterScales[convCategory];
    const valueInBase = convValue * scales[convFromUnit as keyof typeof scales];

    return Object.keys(scales).map((unit) => {
      const unitScale = scales[unit as keyof typeof scales];
      const targetVal = valueInBase / unitScale;
      return {
        unit,
        name: unitNames[unit],
        val: targetVal,
      };
    });
  };

  const conversions = calculateConversions();

  // Reset selected conversion units when category changes
  useEffect(() => {
    const defaults = {
      length: 'm',
      weight: 'kg',
      area: 'sqm',
      volume: 'l',
      temp: 'c',
    };
    setConvFromUnit(defaults[convCategory]);
  }, [convCategory]);

  return (
    <div className="space-y-10">
      {/* Header Info Panel */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/20 dark:border-white/5 pb-8">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-500 transition-colors mb-2 select-none">
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/20 dark:border-white/5 select-none">{calc.icon}</span>
            <h1 className="font-sans font-black text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight leading-none">{calc.title}</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans max-w-2xl">{calc.description}</p>
        </div>
      </section>

      {/* MODALITY A: CUSTOM SCIENTIFIC KEYPAD */}
      {calc.type === 'custom_scientific' && (
        <section className="max-w-2xl mx-auto p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl">
          {/* Display screen */}
          <div className="bg-slate-950/90 border border-white/5 p-6 rounded-2xl font-mono text-right space-y-2 select-none mb-6 relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[9px] uppercase tracking-widest text-indigo-400 font-sans font-bold">
              ScaleCalc Scientific Matrix
            </div>
            <div className="text-slate-500 text-xs min-h-[16px] truncate">{sciHistory}</div>
            <div className="text-slate-400 text-sm min-h-[20px] truncate">{sciExpression || '0'}</div>
            <div className="text-emerald-400 text-3xl font-bold font-mono tracking-tight pt-1 truncate">{sciResult}</div>
            
            {/* Indicators */}
            <div className="flex items-center justify-between text-[9px] font-sans font-bold text-slate-500 pt-3 border-t border-white/5">
              <span className={sciMemory !== 0 ? 'text-indigo-400' : ''}>M: {sciMemory.toLocaleString()}</span>
              <span>Mode: {sciIsRadian ? 'RAD' : 'DEG'}</span>
            </div>
          </div>

          {/* Mode selector tab */}
          <div className="flex justify-between items-center gap-3 mb-6 select-none">
            <button
              onClick={() => setSciIsRadian(!sciIsRadian)}
              className="px-4 py-2 border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              Toggle {sciIsRadian ? 'Degrees' : 'Radians'}
            </button>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              {sciIsRadian ? 'Radian Active (Default)' : 'Degree Mode Active'}
            </div>
          </div>

          {/* Keypad Grid layout */}
          <div className="grid grid-cols-5 gap-3">
            {[
              'MC', 'MR', 'M+', 'M-', 'C',
              'sin', 'cos', 'tan', '(', ')',
              'log', 'ln', 'sqrt', '^', '⌫',
              '7', '8', '9', '%', '/',
              '4', '5', '6', 'π', '*',
              '1', '2', '3', 'e', '-',
              '0', '.', '=', '+', ''
            ].map((key, i) => {
              if (key === '') return <div key={i} />;
              
              let btnClass = 'bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border-slate-200/30 dark:border-white/5';
              
              if (['C', '⌫'].includes(key)) {
                btnClass = 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white';
              } else if (key === '=') {
                btnClass = 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/25 hover:opacity-90 col-span-1';
              } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', '^', '(', ')', '%'].includes(key)) {
                btnClass = 'bg-indigo-500/5 dark:bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-500 border-indigo-500/10 font-bold';
              } else if (['MC', 'MR', 'M+', 'M-'].includes(key)) {
                btnClass = 'bg-slate-200/50 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-transparent text-[11px] font-extrabold';
              } else if (['/', '*', '-', '+'].includes(key)) {
                btnClass = 'bg-amber-500/15 dark:bg-amber-500/25 border-amber-500/20 text-amber-500 font-bold hover:bg-amber-500 hover:text-white';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSciKey(key)}
                  className={`h-12 rounded-xl flex items-center justify-center font-sans font-bold text-sm border transition-all cursor-pointer focus:outline-none ${btnClass}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* MODALITY B: CUSTOM UNIT CONVERTER MATRIX */}
      {calc.type === 'custom_converter' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls column */}
          <div className="lg:col-span-1 p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="font-sans font-black text-base text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3">
              Select Category
            </h3>
            
            {/* Category tabs */}
            <div className="flex flex-col gap-2 select-none">
              {[
                { id: 'length', name: '📏 Length' },
                { id: 'weight', name: '⚖️ Weight' },
                { id: 'area', name: '📐 Area' },
                { id: 'volume', name: '🧪 Volume' },
                { id: 'temp', name: '🌡️ Temperature' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setConvCategory(cat.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                    convCategory === cat.id
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <hr className="border-slate-200/20 dark:border-white/5" />

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Input Value</label>
                <input
                  type="number"
                  value={convValue}
                  onChange={(e) => setConvValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">From Unit</label>
                <select
                  value={convFromUnit}
                  onChange={(e) => setConvFromUnit(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
                >
                  {Object.keys(convCategory === 'temp' ? {c:1, f:1, k:1} : converterScales[convCategory]).map((unit) => (
                    <option key={unit} value={unit}>
                      {unitNames[unit]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results grid column */}
          <div className="lg:col-span-2 p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="font-sans font-black text-base text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3">
              Conversion Results
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {conversions.map((conv) => (
                <div
                  key={conv.unit}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-[90px] ${
                    conv.unit === convFromUnit
                      ? 'bg-indigo-500/5 border-indigo-500/30'
                      : 'bg-slate-100/30 dark:bg-white/5 border-slate-200/20 dark:border-white/5'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{conv.name}</span>
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white truncate">
                    {conv.val.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MODALITY C: STANDARD CALCULATOR WORKSPACE */}
      {calc.type !== 'custom_scientific' && calc.type !== 'custom_converter' && (
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          {/* 1. INPUT FORM COLUMN */}
          <div className="xl:col-span-5 p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-6 select-none overflow-y-auto">
            <h3 className="font-sans font-black text-base text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3">
              Adjust Parameters
            </h3>

            <div className="space-y-6">
              {calc.inputs && calc.inputs.map((input) => {
                const currentVal = inputs[input.id] !== undefined ? inputs[input.id] : input.default;

                return (
                  <div key={input.id} className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold font-sans">
                      <span className="text-slate-600 dark:text-slate-400">{input.label}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                        {input.type === 'slider' && input.unit === '₹' ? currency : ''}
                        {input.type === 'select' && input.optionNames ? input.optionNames[currentVal] || currentVal : currentVal}
                        {input.type === 'slider' && input.unit !== '₹' ? (input.unit || '') : ''}
                      </span>
                    </div>

                    {/* RENDER RANGE SLIDER */}
                    {input.type === 'slider' && (
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={input.min || 0}
                          max={input.max || 100}
                          step={input.step || 1}
                          value={currentVal}
                          onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors mt-2 mb-2"
                          aria-label={input.label}
                        />
                        <div className="flex justify-between text-[9px] font-sans text-slate-400 dark:text-slate-500 font-semibold select-none">
                          <span>{input.unit === '₹' ? currency : ''}{input.min?.toLocaleString()}{input.unit !== '₹' ? input.unit : ''}</span>
                          <span>{input.unit === '₹' ? currency : ''}{input.max?.toLocaleString()}{input.unit !== '₹' ? input.unit : ''}</span>
                        </div>
                      </div>
                    )}

                    {/* RENDER DROPDOWN SELECT */}
                    {input.type === 'select' && (
                      <select
                        value={currentVal}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/5 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 transition-all font-sans min-h-[48px]"
                      >
                        {input.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {input.optionNames ? input.optionNames[opt] || opt : opt}{input.suffix || ''}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* RENDER DATE PICKER */}
                    {input.type === 'date' && (
                      <input
                        type="date"
                        value={currentVal}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/5 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 transition-all font-sans min-h-[48px]"
                        aria-label={input.label}
                      />
                    )}

                    {/* RENDER NUMBER INPUT */}
                    {input.type === 'number' && (
                      <input
                        type="number"
                        value={currentVal}
                        onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || 0)}
                        placeholder={input.placeholder}
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/5 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 transition-all font-sans min-h-[48px]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. RESULTS AND CHART COLUMN */}
          <div className="xl:col-span-7 flex flex-col gap-6 md:gap-8 pb-20 lg:pb-0">
            {/* Outputs display container */}
            <div className="p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
              <h3 className="font-sans font-black text-base text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3">
                Calculated Metrics
              </h3>

              {outputResults ? (
                <div className="space-y-6">
                  {/* HERO RESULT DISPLAY CARD */}
                  {calc.outputs?.filter(o => o.isHero).map((out) => {
                    const val = outputResults.results[out.id];
                    return (
                      <div
                        key={out.id}
                        className="p-6 bg-gradient-to-br from-indigo-500/10 to-violet-600/10 dark:from-indigo-500/20 dark:to-violet-600/20 border border-indigo-500/30 rounded-2xl flex flex-col justify-between h-[120px] select-none relative overflow-hidden"
                      >
                        <div className="absolute top-[-50px] right-[-50px] w-36 h-36 rounded-full bg-indigo-500/20 filter blur-2xl z-0" />
                        <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest z-10">{out.label}</span>
                        <span className="font-sans font-black text-3xl md:text-4xl text-slate-950 dark:text-white tracking-tight leading-none pt-2 z-10 truncate">
                          {formatResultValue(val, out.type)}
                        </span>
                      </div>
                    );
                  })}

                  {/* SUBORDINATE RESULT MATRIX */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {calc.outputs?.filter(o => !o.isHero).map((out) => {
                      const val = outputResults.results[out.id];
                      return (
                        <div key={out.id} className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200/25 dark:border-white/5 rounded-xl flex flex-col justify-between h-[80px]">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{out.label}</span>
                          <span className="font-sans font-extrabold text-lg text-slate-900 dark:text-white truncate">
                            {formatResultValue(val, out.type)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-sm font-sans select-none">
                  <span>Awaiting inputs...</span>
                </div>
              )}
            </div>

            {/* CHART DISPLAY CONTAINER */}
            {outputResults && (outputResults.chartData || outputResults.gaugeData) && (
              <div className="p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-6 overflow-hidden">
                <h3 className="font-sans font-black text-base text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3">
                  Visual Analysis
                </h3>

                {outputResults.chartData && (
                  <div className="w-full flex items-center justify-center p-2">
                    <SVGChart
                      points={outputResults.chartData.points}
                      xLabel={outputResults.chartData.xLabel}
                      yLabel={outputResults.chartData.yLabel}
                      color={calc.color || 'indigo'}
                    />
                  </div>
                )}

                {outputResults.gaugeData && (
                  <div className="w-full flex items-center justify-center py-4">
                    <SVGGauge
                      value={outputResults.gaugeData.value}
                      min={outputResults.gaugeData.min}
                      max={outputResults.gaugeData.max}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. DYNAMIC FORMULA & EDUCATIONAL SEO BLOCK */}
      <CalculatorInsights calc={calc} />

      {/* 4. INTERNAL LINKING BLOCK */}
      <CalculatorLinks currentId={calcId} />
    </div>
  );
}
