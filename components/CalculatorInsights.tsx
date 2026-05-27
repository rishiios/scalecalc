'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorSchema } from '@/lib/schema';

export default function CalculatorInsights({ calc }: { calc: CalculatorSchema }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!calc.info) return null;

  return (
    <section className="p-4 md:p-8 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-8 mt-8">
      {/* 1. Header */}
      <div className="space-y-3">
        <h3 className="font-sans font-black text-lg md:text-xl text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3 select-none">
          Insights & Operational Mechanism
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans max-w-3xl leading-relaxed">
          Understand the mathematical logic, standard formulas, and operational guidelines behind this calculator to trace metrics seamlessly.
        </p>
      </div>

      {/* 2. Formula & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 p-5 bg-slate-950/90 border border-white/5 rounded-2xl font-mono text-center flex flex-col justify-center min-h-[140px] select-none">
          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-sans font-bold pb-4">Standard Formula</span>
          <span className="text-emerald-400 font-extrabold text-sm md:text-base font-mono tracking-tight leading-relaxed select-all">
            {calc.info.formula}
          </span>
        </div>

        <div className="md:col-span-2 p-5 bg-slate-100/30 dark:bg-white/5 border border-slate-200/25 dark:border-white/5 rounded-2xl flex flex-col justify-center min-h-[140px] leading-relaxed">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-sans font-bold pb-2 select-none">Explanation</span>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-sans">
            {calc.info.explanation}
          </p>
        </div>
      </div>

      {/* 3. Usage / How to Use (if any) */}
      {calc.info.usage && (
        <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl leading-relaxed">
          <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-sans font-bold pb-2 block select-none">How to Use</span>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-sans">
            {calc.info.usage}
          </p>
        </div>
      )}

      {/* 4. Deep Industry Insights Pro-Tips Grid */}
      <div className="space-y-4">
        <span className="text-[10px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-sans font-black select-none block">
          Pro-Tips & Industry Insights
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {calc.info.insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-100/10 dark:bg-white/5 border border-slate-200/10 dark:border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between leading-relaxed"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs mb-3 font-sans select-none">
                0{idx + 1}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-sans">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Examples (if any) */}
      {calc.info.examples && calc.info.examples.length > 0 && (
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-sans font-black select-none block">
            Practical Examples
          </span>
          <div className="space-y-3">
            {calc.info.examples.map((example, idx) => (
              <div key={idx} className="p-4 bg-slate-100/30 dark:bg-white/5 border border-slate-200/20 dark:border-white/5 rounded-xl">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-sans">
                  <strong>Example {idx + 1}:</strong> {example}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FAQ Accordion (if any) */}
      {calc.info.faq && calc.info.faq.length > 0 && (
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-sans font-black select-none block">
            Frequently Asked Questions
          </span>
          <div className="space-y-2">
            {calc.info.faq.map((item, idx) => (
              <div key={idx} className="border border-slate-200/40 dark:border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-center transition-colors focus:outline-none"
                >
                  <span className="font-semibold text-sm text-slate-900 dark:text-white pr-4">{item.q}</span>
                  <span className="text-indigo-500 text-xl font-mono leading-none">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 bg-white/50 dark:bg-slate-900/50"
                    >
                      <p className="text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/20 dark:border-white/5">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
