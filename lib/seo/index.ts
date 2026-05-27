import { Metadata } from 'next';
import { calculators } from '../formulas';

export function getSeoMetadata(id: string): Metadata {
  const calc = calculators[id];
  if (!calc) {
    return {
      title: 'ScaleCalc | Premium Lifetime Suite',
      description: 'Access a collection of beautiful, ultra-fast client-side financial, health, and mathematical calculators. Zero fees, zero installation.',
    };
  }

  const title = calc.seoTitle || `${calc.title} | ScaleCalc`;
  const description = calc.seoMeta || calc.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
export const defaultMetadata: Metadata = {
  title: 'ScaleCalc | Premium Lifetime Suite',
  description: 'Access a collection of beautiful, ultra-fast client-side financial, health, and mathematical calculators. Zero fees, zero installation.',
  keywords: ['mortgage calculator', 'compound interest calculator', 'bmi calculator', 'tdee calorie calculator', 'scientific calculator', 'online unit converter', 'client side math tools', 'secure calculations', 'offline calculator', 'free finance tools'],
  authors: [{ name: 'ScaleCalc Team' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    title: 'ScaleCalc | Premium Lifetime Suite',
    description: 'Access a collection of beautiful, ultra-fast client-side financial, health, and mathematical calculators. Zero fees, zero installation.',
  },
  verification: {
    google: 'ZGZpmaNjE4UCWaUgfR2bTePuJ_dSDERpNAlKOHOtt-c',
  }
};
