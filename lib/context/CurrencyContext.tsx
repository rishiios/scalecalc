'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  currency: string;
  currencyName: string;
  setCurrency: (symbol: string) => void;
}

const currencyDetails: Record<string, string> = {
  '₹': 'INR (₹) - Rupee',
  '$': 'USD ($) - Dollar',
  '€': 'EUR (€) - Euro',
  '£': 'GBP (£) - Pound',
  'AED': 'AED (Dh) - Dirham',
  'A$': 'AUD (A$) - Dollar',
  'C$': 'CAD (C$) - Dollar',
  'S$': 'SGD (S$) - Dollar',
  '¥': 'JPY (¥) - Yen',
  'CN¥': 'CNY (元) - Yuan',
  'CHF': 'CHF (Fr) - Franc',
  'SAR': 'SAR (SR) - Riyal',
  'KWD': 'KWD (KD) - Dinar',
  'QAR': 'QAR (QR) - Riyal',
  'OMR': 'OMR (RO) - Rial',
  'BHD': 'BHD (BD) - Dinar',
  '₺': 'TRY (₺) - Lira',
  '₽': 'RUB (₽) - Ruble',
  'R$': 'BRL (R$) - Real',
  'R': 'ZAR (R) - Rand',
  'NZ$': 'NZD (NZ$) - Dollar',
  'HK$': 'HKD (HK$) - Dollar',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('₹');

  useEffect(() => {
    const saved = localStorage.getItem('scalecalc_currency');
    if (saved) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (symbol: string) => {
    setCurrencyState(symbol);
    localStorage.setItem('scalecalc_currency', symbol);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencyName: currencyDetails[currency] || currency,
      setCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
