import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/botfeedback',
          '/_api/',
          '/_partials/',
          '/_functions/',
          '/wix-code-dev-tools/',
          '/_serverless/',
          '/wix-*',
          '/app/',
          '/post/',
          '/service-page/',
          '/product-page/',
          '/events/',
          '/portfolio/',
          '/members/',
        ],
      },
    ],
    sitemap: 'https://tgyardcare.com/sitemap.xml',
  };
}
