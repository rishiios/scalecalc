'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (type: string) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <footer className="mt-20 px-4 md:px-6 py-10 border-t border-slate-200/40 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-all duration-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-sans text-center md:text-left select-none">
          &copy; 2026 ScaleCalc Platform. All rights reserved. Operating entirely offline.
        </span>
        <div className="flex items-center gap-6">
          <button
            onClick={() => openModal('about')}
            className="bg-transparent border-none text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-white text-xs md:text-sm font-semibold cursor-pointer transition-colors focus:outline-none"
          >
            About Us
          </button>
          <button
            onClick={() => openModal('privacy')}
            className="bg-transparent border-none text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-white text-xs md:text-sm font-semibold cursor-pointer transition-colors focus:outline-none"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => openModal('terms')}
            className="bg-transparent border-none text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-white text-xs md:text-sm font-semibold cursor-pointer transition-colors focus:outline-none"
          >
            Terms of Use
          </button>
        </div>
      </div>

      {/* Dynamic Legal Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/50 dark:border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-200/50 dark:border-white/5 pb-3">
                <h2 className="text-xl font-bold font-sans text-slate-950 dark:text-white">
                  {activeModal === 'about' && 'About ScaleCalc'}
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Use'}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 font-sans text-sm text-slate-750 dark:text-slate-300 leading-relaxed max-h-[380px] overflow-y-auto pr-2">
                {activeModal === 'about' && (
                  <>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base">ScaleCalc Mission</h3>
                    <p>ScaleCalc is a premium collection of offline-first tools designed to deliver robust financial, mathematical, and health evaluations without any ongoing subscription costs or third-party server overheads.</p>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base mt-4">Serverless Architecture</h3>
                    <p>By executing calculations natively inside your browser, the platform achieves instant sub-100ms response times. We use standard math models to calculate everything locally, guaranteeing zero data collection.</p>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base mt-4">Premium Aesthetics</h3>
                    <p>We believe utility tools deserve elegant designs. ScaleCalc uses modern glassmorphism backdrops, fluid custom sliders, and vector line drawings to deliver a state-of-the-art interactive workspace.</p>
                  </>
                )}

                {activeModal === 'privacy' && (
                  <>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base">100% Client-Side Processing</h3>
                    <p>Your privacy is absolute. All mathematical inputs, slider actions, and tax details are processed entirely in your computer's browser memory.</p>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base mt-4">Zero Tracking, Zero Cookies</h3>
                    <p>We do not operate servers that log transactions, and we do not track your location or store persistent tracking cookies. Your bookmarks and favorites are stored purely on your own device using browser <code>localStorage</code>.</p>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base mt-4">Third-Party API Integrity</h3>
                    <p>We do not connect to Gemini, OpenAI, or external AI APIs for calculator operations, protecting your sensitive inputs from advertising networks.</p>
                  </>
                )}

                {activeModal === 'terms' && (
                  <>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base">Acceptance of Terms</h3>
                    <p>By using the ScaleCalc platform, you agree to access its tools as provided on an "as-is" basis for simple estimation and mathematical projection purposes.</p>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base mt-4">No Professional Advice</h3>
                    <p>Calculations provided (such as income tax brackets, BMR statistics, and mortgage interests) are indicators only and should not represent formal financial, legal, or medical advice.</p>
                    <h3 className="font-semibold text-slate-950 dark:text-white text-base mt-4">Lifetime Sustainable License</h3>
                    <p>ScaleCalc is free to distribute and modify. The local formula engine is constructed to operate indefinitely without any licensing restrictions or recurring execution fees.</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
