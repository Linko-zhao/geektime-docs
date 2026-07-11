import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const categoryPattern = '{AI-大数据,产品-运营,前端-移动,后端-架构,管理-成长,计算机基础,运维-测试}/*/docs/*.md';

const articles = defineCollection({
  loader: glob({
    base: '.',
    pattern: categoryPattern,
    // Astro's default IDs are slugified. Keep the original relative path so
    // course names and article URLs retain Chinese characters and punctuation.
    generateId: ({ entry }) => entry.replace(/\.md$/i, ''),
  }),
});

export const collections = { articles };
