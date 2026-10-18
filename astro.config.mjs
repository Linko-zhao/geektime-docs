import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import remarkTextr from 'remark-textr';
import { existsSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const geekbangImageUrl = /^https?:\/\/static001(?:-test)?\.geekbang\.org\/resource\/image\//i;

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

const commentsTitlePattern = /^精选留言（\d+）$/;

function h(tagName, properties, children) {
  return { type: 'element', tagName, properties, children };
}

function elementText(node) {
  if (node?.type === 'text') return node.value;
  if (Array.isArray(node?.children)) return node.children.map(elementText).join('');
  return '';
}

// Comment markup in the source markdown is raw HTML:
// <li><span>name</span> 👍（likes） 💬（replies）<p>body</p>YYYY-MM-DD</li>
function parseComment(li) {
  const nameNode = li.children.find((child) => child.type === 'element' && child.tagName === 'span');
  const body = li.children.filter((child) => child.type === 'element' && child.tagName === 'p');
  const text = li.children.filter((child) => child.type === 'text').map((child) => child.value).join(' ');
  return {
    name: elementText(nameNode).trim(),
    body,
    likes: Number(text.match(/👍（(\d+)）/)?.[1] ?? 0),
    replies: Number(text.match(/💬（(\d+)）/)?.[1] ?? 0),
    date: text.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
  };
}

function buildCommentCard(comment) {
  return h('li', { className: ['comment-card'] }, [
    h('header', { className: ['comment-meta'] }, [
      h('span', { className: ['comment-author'] }, [{ type: 'text', value: comment.name }]),
      ...(comment.date
        ? [h('time', { className: ['comment-date'], dateTime: comment.date }, [{ type: 'text', value: comment.date }])]
        : []),
    ]),
    h('div', { className: ['comment-body'] }, comment.body),
    h('footer', { className: ['comment-stats'] }, [
      h('span', { className: ['comment-stat'] }, [{ type: 'text', value: `👍 ${comment.likes}` }]),
      h('span', { className: ['comment-stat'] }, [{ type: 'text', value: `💬 ${comment.replies}` }]),
    ]),
  ]);
}

function buildCommentsSection(title, ul) {
  const comments = ul.children
    .filter((child) => child.type === 'element' && child.tagName === 'li')
    .map(parseComment)
    .sort((a, b) => b.likes - a.likes);
  if (comments.length === 0) return null;
  return h('section', { className: ['comments'] }, [
    h('h2', { className: ['comments-title'] }, [{ type: 'text', value: elementText(title).trim() }]),
    h('ul', { className: ['comment-list'] }, comments.map(buildCommentCard)),
    h('div', { className: ['comment-controls'] }, [
      h('button', { type: 'button', 'data-comment-prev': '' }, [{ type: 'text', value: '← 上一条' }]),
      h('span', { className: ['comment-counter'] }, [{ type: 'text', value: `1 / ${comments.length}` }]),
      h('button', { type: 'button', 'data-comment-next': '' }, [{ type: 'text', value: '下一条 →' }]),
    ]),
  ]);
}

function htmlToCommentsSection(html) {
  const children = fromHtml(html, { fragment: true }).children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const isTitle = child.type === 'element' && child.tagName === 'div' && commentsTitlePattern.test(elementText(child).trim());
    let j = i + 1;
    while (children[j]?.type === 'text' && !children[j].value.trim()) j++;
    const ul = children[j];
    if (isTitle && ul?.type === 'element' && ul.tagName === 'ul') {
      const section = buildCommentsSection(child, ul);
      if (section) return toHtml(section);
    }
  }
  return null;
}

// Flatten an mdast node back to its source HTML. `html` nodes are verbatim;
// text nodes already had entities decoded by the markdown parser, so re-escape
// them or code like `i<imgData` breaks the reparse. Markdown formatting parsed
// inside a comment body (e.g. **bold**) degrades to plain text.
function mdastSource(node) {
  if (node.type === 'html') return node.value;
  if (typeof node.value === 'string') return node.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return (node.children ?? []).map(mdastSource).join('');
}

// Runs at the remark level: mdast keeps the original HTML in `html` nodes, and
// comment lists broken by blank lines surface as following html/paragraph
// siblings whose source we can merge until the list closes. (At the rehype
// level that HTML is already split into raw nodes and escaped text.)
function remarkFeaturedComments() {
  return (tree) => {
    const out = [];
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];
      if (child.type === 'html' && child.value.includes('精选留言')) {
        let html = child.value;
        let j = i + 1;
        // Comment bodies can contain literal `<ul>` examples, so a plain
        // substring check stops early; only a trailing `</ul>` closes the list.
        while (!html.trimEnd().endsWith('</ul>') && tree.children[j]) {
          html += mdastSource(tree.children[j]);
          j++;
        }
        const section = htmlToCommentsSection(html);
        if (section) {
          out.push({ type: 'html', value: section });
          i = j - 1;
          continue;
        }
      }
      out.push(child);
    }
    tree.children = out;
  };
}

function chineseTypography(value) {
  const cjk = '[\\u3400-\\u9fff\\uf900-\\ufaff]';
  const latinOrNumber = '[A-Za-z0-9]';
  return value
    .replace(new RegExp(`(${cjk})(?=${latinOrNumber})`, 'g'), '$1 ')
    .replace(new RegExp(`(${latinOrNumber})(?=${cjk})`, 'g'), '$1 ');
}

function proxyGeekbangImages(node) {
  if (node?.type === 'image' && typeof node.url === 'string' && geekbangImageUrl.test(node.url)) {
    const source = new URL(node.url);
    // Keep the upstream host out of the public URL. The proxy only serves the
    // fixed Geekbang image directory, which avoids an open-proxy endpoint.
    node.url = `/image-proxy${source.pathname}${source.search}`;
  }
  if (Array.isArray(node?.children)) node.children.forEach(proxyGeekbangImages);
}

function remarkProxyGeekbangImages() {
  return (tree) => proxyGeekbangImages(tree);
}

const inlineFormattingTypes = new Set(['strong', 'emphasis', 'delete']);
const cjkCharacter = /[\u3400-\u9fff\uf900-\ufaff]/;
const latinOrNumberCharacter = /[A-Za-z0-9]/;

function inlineText(node) {
  if (node.type === 'text') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(inlineText).join('');
}

function firstTextNode(node) {
  if (node.type === 'text') return node;
  if (!Array.isArray(node.children)) return undefined;
  for (const child of node.children) {
    const result = firstTextNode(child);
    if (result) return result;
  }
}

function lastTextNode(node) {
  if (node.type === 'text') return node;
  if (!Array.isArray(node.children)) return undefined;
  for (const child of [...node.children].reverse()) {
    const result = lastTextNode(child);
    if (result) return result;
  }
}

function needsTypographySpace(left, right) {
  return (
    (cjkCharacter.test(left) && latinOrNumberCharacter.test(right)) ||
    (latinOrNumberCharacter.test(left) && cjkCharacter.test(right))
  );
}

function restoreLiteralStrong(children) {
  if (!Array.isArray(children)) return;
  children.forEach((child) => restoreLiteralStrong(child.children));

  const restored = [];
  for (const child of children) {
    if (child.type !== 'text' || !child.value.includes('**')) {
      restored.push(child);
      continue;
    }

    const pattern = /\*\*([^\n]*?)\*\*/g;
    let cursor = 0;
    let matched = false;
    for (const match of child.value.matchAll(pattern)) {
      const content = match[1].trim();
      if (!content) continue;
      matched = true;
      const start = match.index ?? 0;
      if (start > cursor) restored.push({ type: 'text', value: child.value.slice(cursor, start) });
      restored.push({ type: 'strong', children: [{ type: 'text', value: content }] });
      cursor = start + match[0].length;
    }
    if (!matched) {
      restored.push(child);
      continue;
    }
    if (cursor < child.value.length) restored.push({ type: 'text', value: child.value.slice(cursor) });
  }

  children.splice(0, children.length, ...restored);
}

function remarkRestoreLiteralStrong() {
  return (tree) => restoreLiteralStrong(tree.children);
}

function normalizeInlineBoundaries(children) {
  if (!Array.isArray(children)) return;
  children.forEach((child) => normalizeInlineBoundaries(child.children));

  children.forEach((child, index) => {
    if (!inlineFormattingTypes.has(child.type)) return;

    const first = firstTextNode(child);
    const last = lastTextNode(child);
    if (first) first.value = first.value.replace(/^\s+/, '');
    if (last) last.value = last.value.replace(/\s+$/, '');

    const content = inlineText(child);
    const previous = children[index - 1];
    const next = children[index + 1];
    if (previous?.type === 'text' && content) {
      const left = previous.value.at(-1);
      const right = content.at(0);
      if (left && right && needsTypographySpace(left, right) && !/\s$/.test(previous.value)) previous.value += ' ';
    }
    if (next?.type === 'text' && content) {
      const left = content.at(-1);
      const right = next.value.at(0);
      if (left && right && needsTypographySpace(left, right) && !/^\s/.test(next.value)) next.value = ` ${next.value}`;
    }
  });
}

function remarkInlineTypography() {
  return (tree) => normalizeInlineBoundaries(tree.children);
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
  compressHTML: true,
  build: {
    format: 'directory',
  },
  markdown: {
    processor: unified(),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    remarkPlugins: [
      remarkFeaturedComments,
      remarkProxyGeekbangImages,
      [remarkTextr, { plugins: [chineseTypography] }],
      remarkRestoreLiteralStrong,
      remarkInlineTypography,
    ],
    rehypePlugins: [addImageAttributes],
  },
  vite: {
    server: {
      proxy: {
        '/image-proxy': {
          target: 'https://static001.geekbang.org',
          changeOrigin: true,
          headers: { Referer: 'https://time.geekbang.org/' },
          rewrite(path) {
            return path.replace(/^\/image-proxy/, '');
          },
        },
      },
    },
    plugins: [preserveMissingMarkdownImages()],
  },
});
