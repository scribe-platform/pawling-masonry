import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `base` is computed by the deploy workflow from `public/CNAME` and passed in
// as PUBLIC_BASE_PATH, rather than baked in here: a bare github.io project page
// needs `/<repo>`, a custom domain needs `/`. Getting it backwards 404s every
// asset on the page, so `scribe site verify` checks the emitted URLs.
export default defineConfig({
  output: 'static',
  // The live address. The canonical URL, the share-card image URL and every
  // sitemap entry are absolute URLs built from this, and none of them can be
  // derived from the environment — so it is written here rather than computed.
  site: 'https://pawlingmasonry.com',
  base: process.env.PUBLIC_BASE_PATH || '/',
  integrations: [sitemap()],
});
