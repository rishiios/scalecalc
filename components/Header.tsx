'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/lib/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [usernameInput, setUsernameInput] = useState('rushu');
  const [passwordInput, setPasswordInput] = useState('123456');

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('scalecalc_user');
    if (savedUser) setUser(savedUser);
  }, []);

  if (!mounted) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('scalecalc_user', usernameInput);
    setUser(usernameInput);
    setShowLogin(false);
  };

  const handleSignOut = () => {
    if (confirm('Do you want to sign out?')) {
      localStorage.removeItem('scalecalc_user');
      setUser(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200/40 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-all duration-200">
      <Link href="/" className="flex items-center gap-3 select-none group">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center font-sans font-extrabold text-lg text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
          ∑
        </div>
        <span className="hidden sm:inline font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          ScaleCalc
        </span>
      </Link>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Switcher Button */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-9 h-9 rounded-lg border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-base cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>

        {/* Currency Selector */}
        <div className="relative flex items-center">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="cursor-pointer font-semibold border border-slate-200/50 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 px-3 py-1.5 pr-8 text-xs md:text-sm focus:outline-none hover:bg-slate-100 dark:hover:bg-white/10 transition-colors appearance-none max-w-[95px] md:max-w-none"
            aria-label="Currency Selector"
          >
            <optgroup label="Popular" className="bg-slate-900 text-slate-100">
              <option value="₹">INR (₹)</option>
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="AED">AED (Dh)</option>
              <option value="A$">AUD (A$)</option>
              <option value="C$">CAD (C$)</option>
              <option value="S$">SGD (S$)</option>
            </optgroup>
            <optgroup label="All Currencies" className="bg-slate-900 text-slate-100">
              <option value="¥">JPY (¥)</option>
              <option value="CN¥">CNY (元)</option>
              <option value="CHF">CHF (Fr)</option>
              <option value="SAR">SAR (SR)</option>
              <option value="KWD">KWD (KD)</option>
              <option value="QAR">QAR (QR)</option>
              <option value="OMR">OMR (RO)</option>
              <option value="BHD">BHD (BD)</option>
              <option value="₺">TRY (₺)</option>
              <option value="₽">RUB (₽)</option>
              <option value="R$">BRL (R$)</option>
              <option value="R">ZAR (R)</option>
              <option value="NZ$">NZD (NZ$)</option>
              <option value="HK$">HKD (HK$)</option>
            </optgroup>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-slate-400">
            ▼
          </span>
        </div>

        {/* Login widget */}
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.button
              key="login-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-none px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold shadow-md shadow-indigo-500/20 cursor-pointer focus:outline-none"
            >
              Login
            </motion.button>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleSignOut}
              className="flex items-center gap-2 cursor-pointer select-none group"
              title="Click to Sign Out"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                {user.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-sans font-semibold text-sm text-slate-700 dark:text-slate-300">
                {user}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glassmorphic Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-sans text-slate-950 dark:text-white">Sign In</h2>
                <button
                  onClick={() => setShowLogin(false)}
                  className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400" htmlFor="login-username">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    id="login-username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 cursor-pointer focus:outline-none"
                >
                  Authenticate
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Simulated local browser login session
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
