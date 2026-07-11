import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

function addImageAttributes() {
  return (tree) => {
    const visit = (node) => {
      if (node?.type === 'element' && node.tagName === 'img') {
        node.properties ??= {};
        node.properties.loading ??= 'lazy';
        node.properties.referrerpolicy ??= 'no-referrer';
      }
      if (Array.isArray(node?.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

function preserveMissingMarkdownImages() {
  return {
    name: 'preserve-missing-markdown-images',
    enforce: 'pre',
    resolveId(id, importer) {
      if (!importer || id.startsWith('\0') || id.includes('?') || !imageExtensions.has(extname(id).toLowerCase())) return null;
      if (id.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(id)) return null;
      if (existsSync(resolve(dirname(importer), id))) return null;
      return resolve(process.cwd(), 'src/assets/missing-image.svg');
    },
  };
}

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    rehypePlugins: [addImageAttributes],
  },
  vite: {
    plugins: [preserveMissingMarkdownImages()],
  },
});
