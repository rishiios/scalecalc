'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculators } from '@/lib/formulas';
import { CalculatorSchema } from '@/lib/schema';
import { motion, AnimatePresence } from 'framer-motion';
import StandardCalculator from '@/components/StandardCalculator';

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('scalecalc_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {
      setBookmarks([]);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-sans">Assembling workspace...</p>
      </div>
    );
  }

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let updated = [...bookmarks];
    const idx = updated.indexOf(id);
    if (idx === -1) {
      updated.push(id);
    } else {
      updated.splice(idx, 1);
    }

    setBookmarks(updated);
    try {
      localStorage.setItem('scalecalc_bookmarks', JSON.stringify(updated));
    } catch (err) {}
  };

  const list = Object.values(calculators);

  // Apply filters pipeline
  const filtered = list.filter((calc) => {
    if (activeCategory === 'bookmarks') {
      if (!bookmarks.includes(calc.id)) return false;
    } else if (activeCategory !== 'all') {
      if (calc.category !== activeCategory) return false;
    }

    if (searchQuery !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = calc.title.toLowerCase().includes(query);
      const matchDesc = calc.description.toLowerCase().includes(query);
      const matchCat = calc.category.toLowerCase().includes(query);
      return matchTitle || matchDesc || matchCat;
    }

    return true;
  });

  const colorBorderStyles: Record<string, string> = {
    indigo: 'hover:border-indigo-500/40 after:bg-gradient-to-r after:from-indigo-500 after:to-violet-600',
    emerald: 'hover:border-emerald-500/40 after:bg-gradient-to-r after:from-emerald-500 after:to-teal-600',
    pink: 'hover:border-pink-500/40 after:bg-gradient-to-r after:from-pink-500 after:to-rose-600',
    amber: 'hover:border-amber-500/40 after:bg-gradient-to-r after:from-amber-500 after:to-orange-600',
  };

  const colorIconStyles: Record<string, string> = {
    indigo: 'text-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10',
    pink: 'text-pink-500 bg-pink-500/5 dark:bg-pink-500/10',
    amber: 'text-amber-500 bg-amber-500/5 dark:bg-amber-500/10',
  };

  const colorActionStyles: Record<string, string> = {
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    pink: 'text-pink-500',
    amber: 'text-amber-500',
  };

  const renderCard = (calc: CalculatorSchema) => {
    const isBookmarked = bookmarks.includes(calc.id);
    const hasColor = calc.color || 'indigo';

    return (
      <motion.div
        key={calc.id}
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={`relative h-[220px] flex flex-col justify-between p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-2xl cursor-pointer overflow-hidden backdrop-blur-md shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 transition-all after:content-[""] after:absolute after:top-0 after:left-0 after:right-0 after:height-[3px] ${colorBorderStyles[hasColor]}`}
      >
        <Link href={`/${calc.id}-calculator`} className="absolute inset-0 z-0" />
        
        <div className="flex items-start justify-between z-10">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border border-slate-200/20 dark:border-white/5 ${colorIconStyles[hasColor]}`}>
            {calc.icon}
          </div>
          <div className="flex items-center gap-2">
            {calc.popular && (
              <span className="bg-indigo-500/15 dark:bg-indigo-500/25 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-sans font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
                Popular
              </span>
            )}
            <button
              onClick={(e) => toggleBookmark(calc.id, e)}
              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none z-20 cursor-pointer ${
                isBookmarked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Tool'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="z-10 mt-3 select-none">
          <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white leading-tight">
            {calc.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans line-clamp-2 mt-1 leading-relaxed">
            {calc.description}
          </p>
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider select-none z-10">
          <span className="text-slate-400">{calc.category}</span>
          <span className={`opacity-0 translate-x-[-5px] transition-all group-hover:opacity-100 group-hover:translate-x-0 ${colorActionStyles[hasColor]}`}>
            Launch &rarr;
          </span>
        </div>
      </motion.div>
    );
  };

  const renderSectionHeader = (title: string, colorClass: string, icon: string) => (
    <h2 className="col-span-full font-sans font-extrabold text-lg md:text-xl text-slate-900 dark:text-white mt-8 mb-2 flex items-center gap-3 border-l-4 pl-3" style={{ borderLeftColor: `var(--accent-${colorClass})` }}>
      <span>{icon}</span> {title}
    </h2>
  );

  return (
    <div className="space-y-12">
      {/* Hero Showcase */}
      <section className="text-center py-6 md:py-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 font-sans font-bold text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 select-none">
          🚀 Premium Lifetime Suite
        </div>
        <h1 className="font-sans font-black text-4xl md:text-5xl lg:text-6xl text-slate-950 dark:text-white tracking-tight leading-none">
          Powerful Calculations,<br className="hidden sm:inline" />Zero Recurring Costs.
        </h1>
        <p className="max-w-2xl mx-auto font-sans text-sm md:text-base text-slate-500 dark:text-slate-400">
          From EMI to investments, calculate everything instantly using fast, modern, reliable tools designed for the next generation
        </p>
      </section>

      {/* Main Standard Calculator Front-and-Center */}
      <div className="flex justify-center mb-12">
        <div className="w-full max-w-md transform scale-100 sm:scale-105 origin-top transition-transform">
          <StandardCalculator />
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent my-10" />
      
      <div className="text-center mb-8">
        <h2 className="font-sans font-black text-2xl md:text-3xl text-slate-900 dark:text-white">Explore Premium Suite</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Discover our specialized financial, health, and utility calculators</p>
      </div>

      {/* Dynamic Controls Grid */}
      <section className="max-w-3xl mx-auto p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/40 dark:border-white/5 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        {/* Search Wrapper */}
        <div className="relative flex items-center">
          <svg className="absolute left-4 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search calculators (e.g. mortgage, BMI, unit)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/5 rounded-xl px-12 py-3 text-sm text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
            aria-label="Search calculators"
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap gap-2 border-t border-slate-200/20 dark:border-white/5 pt-4">
          {[
            { id: 'all', name: 'All Tools' },
            { id: 'finance', name: 'Finance' },
            { id: 'health', name: 'Health' },
            { id: 'utility', name: 'Utility' },
            { id: 'bookmarks', name: '❤️ Bookmarks' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeCategory === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </section>

      {/* Catalog Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 mb-4">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">No Calculators Found</h3>
              <p className="text-xs mt-1">Try matching different search terms or categories.</p>
            </motion.div>
          ) : activeCategory === 'all' && searchQuery === '' ? (
            // Grouped Category Layout (User request standard)
            <>
              {/* 1. Starred Favorites Section */}
              {list.filter(c => bookmarks.includes(c.id)).length > 0 && (
                <>
                  {renderSectionHeader('Your Favorites', 'pink', '❤️')}
                  {list.filter(c => bookmarks.includes(c.id)).map(c => renderCard(c))}
                </>
              )}

              {/* 2. Popular Group */}
              {renderSectionHeader('Popular Calculators', 'indigo', '🔥')}
              {list.filter(c => c.popular && !bookmarks.includes(c.id)).map(c => renderCard(c))}

              {/* 3. Segmented categories for remaining calculators */}
              {list.filter(c => !c.popular && !bookmarks.includes(c.id)).length > 0 && (
                <>
                  {/* Finance Section */}
                  {list.filter(c => c.category === 'finance' && !c.popular && !bookmarks.includes(c.id)).length > 0 && (
                    <>
                      {renderSectionHeader('Finance & Tax Tools', 'indigo', '📈')}
                      {list.filter(c => c.category === 'finance' && !c.popular && !bookmarks.includes(c.id)).map(c => renderCard(c))}
                    </>
                  )}

                  {/* Health Section */}
                  {list.filter(c => c.category === 'health' && !c.popular && !bookmarks.includes(c.id)).length > 0 && (
                    <>
                      {renderSectionHeader('Health & Fitness Tools', 'pink', '🏃')}
                      {list.filter(c => c.category === 'health' && !c.popular && !bookmarks.includes(c.id)).map(c => renderCard(c))}
                    </>
                  )}

                  {/* Math Utilities Section */}
                  {list.filter(c => c.category === 'utility' && !['subnet', 'password', 'converter'].includes(c.id) && !['age', 'date_calc', 'time_calc', 'hours_calc', 'gpa_calc', 'grade_calc', 'concrete'].includes(c.id) && !c.popular && !bookmarks.includes(c.id)).length > 0 && (
                    <>
                      {renderSectionHeader('Utility & Math Tools', 'indigo', '🧮')}
                      {list.filter(c => c.category === 'utility' && !['subnet', 'password', 'converter'].includes(c.id) && !['age', 'date_calc', 'time_calc', 'hours_calc', 'gpa_calc', 'grade_calc', 'concrete'].includes(c.id) && !c.popular && !bookmarks.includes(c.id)).map(c => renderCard(c))}
                    </>
                  )}

                  {/* Everyday Utilities Section */}
                  {list.filter(c => ['age', 'date_calc', 'time_calc', 'hours_calc', 'gpa_calc', 'grade_calc', 'concrete'].includes(c.id) && !c.popular && !bookmarks.includes(c.id)).length > 0 && (
                    <>
                      {renderSectionHeader('Everyday & School Tools', 'amber', '🎓')}
                      {list.filter(c => ['age', 'date_calc', 'time_calc', 'hours_calc', 'gpa_calc', 'grade_calc', 'concrete'].includes(c.id) && !c.popular && !bookmarks.includes(c.id)).map(c => renderCard(c))}
                    </>
                  )}

                  {/* Developer Tools Section */}
                  {list.filter(c => ['subnet', 'password', 'converter'].includes(c.id) && !c.popular && !bookmarks.includes(c.id)).length > 0 && (
                    <>
                      {renderSectionHeader('Developer & IT Tools', 'emerald', '🌐')}
                      {list.filter(c => ['subnet', 'password', 'converter'].includes(c.id) && !c.popular && !bookmarks.includes(c.id)).map(c => renderCard(c))}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            // Flat sorted list when search is active or specific tab is clicked
            <>
              {renderSectionHeader(
                activeCategory === 'bookmarks'
                  ? 'Your Bookmarked Tools'
                  : searchQuery !== ''
                  ? 'Search Results'
                  : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Suite`,
                'indigo',
                activeCategory === 'bookmarks' ? '❤️' : '⚡'
              )}
              {[...filtered]
                .sort((a, b) => {
                  const aFav = bookmarks.includes(a.id) ? 1 : 0;
                  const bFav = bookmarks.includes(b.id) ? 1 : 0;
                  if (aFav !== bFav) return bFav - aFav;
                  const aPop = a.popular ? 1 : 0;
                  const bPop = b.popular ? 1 : 0;
                  return bPop - aPop;
                })
                .map((calc) => renderCard(calc))}
            </>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
