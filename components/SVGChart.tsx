'use client';

import React from 'react';
import { useCurrency } from '@/lib/context/CurrencyContext';

interface Point {
  x: any;
  y: number;
}

interface SVGChartProps {
  points: Point[];
  xLabel: string;
  yLabel: string;
  color: string;
}

export default function SVGChart({ points, xLabel, yLabel, color }: SVGChartProps) {
  const { currency } = useCurrency();
  if (!points || points.length === 0) return null;

  const width = 450;
  const height = 240;
  const paddingLeft = 55;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const xValues = points.map(p => parseFloat(p.x));
  const yValues = points.map(p => p.y || 0);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = 0;
  const maxY = Math.max(...yValues) * 1.05 || 100; // 5% padding

  const getX = (x: number) => paddingLeft + ((x - minX) / (maxX - minX || 1)) * chartW;
  const getY = (y: number) => height - paddingBottom - ((y - minY) / (maxY - minY || 1)) * chartH;

  // Build path strings
  let linePath = '';
  let areaPath = '';

  points.forEach((p, idx) => {
    const px = getX(parseFloat(p.x));
    const py = getY(p.y);

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

  const xTicksCount = 5;
  const yTicksCount = 4;
  const xTicks = [];
  const yTicks = [];

  // X Axis Ticks
  for (let i = 0; i < xTicksCount; i++) {
    const fraction = i / (xTicksCount - 1);
    const val = minX + fraction * (maxX - minX);
    xTicks.push({ val, px: getX(val) });
  }

  // Y Axis Ticks
  for (let i = 0; i < yTicksCount; i++) {
    const fraction = i / (yTicksCount - 1);
    const val = minY + fraction * (maxY - minY);
    const py = getY(val);

    let label = '';
    if (val >= 1000000) label = (val / 1000000).toFixed(1) + 'M';
    else if (val >= 1000) label = (val / 1000).toFixed(0) + 'K';
    else label = val.toFixed(0);

    yTicks.push({ val, label: `${currency}${label}`, py });
  }

  // Fallbacks for standard CSS variables
  const colorMap: Record<string, string> = {
    indigo: 'rgb(99, 102, 241)',
    emerald: 'rgb(16, 185, 129)',
    pink: 'rgb(236, 72, 153)',
    amber: 'rgb(245, 158, 11)',
  };

  const accentColor = colorMap[color] || 'rgb(99, 102, 241)';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-sans select-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`chart-glow-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {yTicks.map((tick, i) => (
        <line
          key={i}
          x1={paddingLeft}
          y1={tick.py}
          x2={width - paddingRight}
          y2={tick.py}
          className="stroke-slate-200/50 dark:stroke-white/5"
          strokeWidth="1"
        />
      ))}

      {/* Graph Area */}
      <path d={areaPath} fill={`url(#chart-glow-${color})`} />
      <path d={linePath} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Axes */}
      <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1" />
      <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1" />

      {/* X Ticks */}
      {xTicks.map((tick, i) => (
        <text key={i} x={tick.px} y={height - 15} textAnchor="middle" className="fill-slate-400 dark:fill-slate-500 font-semibold" fontSize="9">
          {tick.val.toFixed(0)}
        </text>
      ))}

      {/* Y Ticks */}
      {yTicks.map((tick, i) => (
        <text key={i} x={paddingLeft - 12} y={tick.py + 3} textAnchor="end" className="fill-slate-400 dark:fill-slate-500 font-semibold" fontSize="9">
          {tick.label}
        </text>
      ))}

      {/* Axis Legend Label */}
      <text x={width / 2 + 15} y={height - 2} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-bold uppercase tracking-wider" fontSize="8">
        {xLabel}
      </text>
    </svg>
  );
}
