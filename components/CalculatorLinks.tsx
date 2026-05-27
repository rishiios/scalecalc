'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { calculators } from '@/lib/formulas';

export default function CalculatorLinks({ currentId }: { currentId: string }) {
  const relatedCalculators = useMemo(() => {
    const allIds = Object.keys(calculators).filter(id => id !== currentId);
    
    // Sort or filter related calculators. For now, we'll pick 3 random ones 
    // or from the same category if possible.
    const currentCategory = calculators[currentId]?.category;
    let related = allIds.filter(id => calculators[id].category === currentCategory);
    
    // If not enough in the same category, add from others
    if (related.length < 3) {
      const others = allIds.filter(id => calculators[id].category !== currentCategory);
      related = [...related, ...others];
    }

    // Shuffle and pick top 3
    const shuffled = related.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(id => calculators[id]);
  }, [currentId]);

  if (relatedCalculators.length === 0) return null;

  return (
    <section className="mt-8 space-y-4">
      <h3 className="font-sans font-black text-lg text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3">
        Explore Related Calculators
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {relatedCalculators.map(calc => (
          <Link
            key={calc.id}
            href={`/${calc.id}-calculator`}
            className="group p-5 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-2"
          >
            <span className="text-2xl bg-slate-100 dark:bg-white/5 p-2 rounded-xl group-hover:scale-110 transition-transform">
              {calc.icon}
            </span>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {calc.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {calc.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
