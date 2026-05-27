import React from 'react';
import { notFound } from 'next/navigation';
import { calculators } from '@/lib/formulas';
import { getSeoMetadata } from '@/lib/seo';
import CalculatorLayout from '@/components/CalculatorLayout';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(calculators).map((id) => ({
    slug: `${id}-calculator`,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  if (slug.endsWith('-calculator')) {
    const id = slug.slice(0, -11);
    return getSeoMetadata(id);
  }
  
  return {
    title: 'ScaleCalc | Premium Suite',
    description: 'Calculate everything instantly using fast, modern, reliable tools designed for the next generation.',
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;

  if (!slug.endsWith('-calculator')) {
    notFound();
  }

  const id = slug.slice(0, -11);
  const calc = calculators[id];

  if (!calc) {
    notFound();
  }

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": calc.title,
    "description": calc.description,
    "applicationCategory": calc.category === 'finance' ? 'BusinessApplication' : 'HealthAndStructureApplication',
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5, Javascript, CSS3",
    "softwareVersion": "1.0",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "INR"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <CalculatorLayout calcId={id} />
    </>
  );
}
