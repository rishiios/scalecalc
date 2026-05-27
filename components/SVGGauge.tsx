'use client';

import React from 'react';

interface SVGGaugeProps {
  value: number;
  min: number;
  max: number;
}

export default function SVGGauge({ value, min, max }: SVGGaugeProps) {
  const val = Math.max(min, Math.min(max, value));
  const percent = (val - min) / (max - min || 1);
  const angle = -90 + percent * 180; // maps semi-circle range from -90deg to +90deg

  const width = 200;
  const height = 110;
  const radius = 70;
  const cx = 100;
  const cy = 85;

  const circum = Math.PI * radius; // full semi-circle length
  const dashoffset = circum - percent * circum;

  // Determine standard health indicator colors
  let indicatorColor = 'stroke-emerald-500';
  let indicatorText = 'text-emerald-500';
  
  if (value < 18.5) {
    indicatorColor = 'stroke-amber-400';
    indicatorText = 'text-amber-400';
  } else if (value < 25) {
    indicatorColor = 'stroke-emerald-500';
    indicatorText = 'text-emerald-500';
  } else if (value < 30) {
    indicatorColor = 'stroke-orange-400';
    indicatorText = 'text-orange-400';
  } else {
    indicatorColor = 'stroke-red-500';
    indicatorText = 'text-red-500';
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[200px] h-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Gray gauge background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          className="stroke-slate-200 dark:stroke-white/5"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Dynamic color health range arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          className={indicatorColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circum}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s' }}
        />

        {/* Gauge needle indicator */}
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - radius + 10}
          className="stroke-slate-900 dark:stroke-white"
          strokeWidth="3.5"
          strokeLinecap="round"
          transform={`rotate(${angle} ${cx} ${cy})`}
          style={{ transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Center pivot point */}
        <circle cx={cx} cy={cy} r="6" className="fill-slate-950 dark:fill-white" />
      </svg>
      <div className={`font-sans font-black text-xl tracking-tight mt-1 ${indicatorText}`}>
        {value.toFixed(1)}
      </div>
      <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-slate-400 text-center">
        Body Mass Index (BMI)
      </div>
    </div>
  );
}
