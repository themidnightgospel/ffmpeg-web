import type { Faq } from '@/lib/kb/content';

/* Typed JSON-LD builders. Templates never hand-write JSON-LD strings — they call
   these and render the result via <script type="application/ld+json">. */

type Json = Record<string, unknown>;

export function webApplicationLd(siteUrl: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ffmpeg.web',
    url: siteUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (runs in the browser)',
    browserRequirements: 'Requires a modern browser with WebAssembly.',
    description:
      'Free, 100% client-side media tools powered by ffmpeg.wasm. Convert, compress, and edit audio and video without uploading anything.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function howToLd(title: string, steps: string[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
  };
}

export function faqPageLd(faqs: Faq[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export interface Crumb {
  label: string;
  url: string;
}

export function breadcrumbLd(crumbs: Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.url,
    })),
  };
}
