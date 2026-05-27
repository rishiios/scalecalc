import { MetadataRoute } from 'next';
import { calculators } from '@/lib/formulas';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://scalecalc.com'; // Default production domain

  const staticPaths = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
  ];

  const dynamicPaths = Object.keys(calculators).map((id) => ({
    url: `${baseUrl}/${id}-calculator`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPaths, ...dynamicPaths];
}
