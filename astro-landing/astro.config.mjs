import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://landing-xyx.vercel.app',
  output: 'static',
  integrations: [
    tailwind()
  ]
});
