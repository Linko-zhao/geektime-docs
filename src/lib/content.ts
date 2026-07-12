import { getCollection, type CollectionEntry } from 'astro:content';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export const categories = ['AI-大数据', '产品-运营', '前端-移动', '后端-架构', '管理-成长', '计算机基础', '运维-测试'] as const;

export type Category = (typeof categories)[number];
export type Article = CollectionEntry<'articles'>;

export interface Course {
  category: Category;
  name: string;
  articles: Article[];
}

export interface IndexedArticle {
  category: Category;
  course: string;
  title: string;
  slug: string;
  sourcePath: string;
  order: number;
  entry: Article;
}

const root = process.cwd();

function pathToId(path: string) {
  return path.replace(/\\/g, '/').replace(/\.md$/i, '');
}

function titleFrom(entry: Article) {
  const sourcePath = join(root, `${entry.id}.md`);
  const source = existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : '';
  let fence = '';
  for (const line of source.split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = '';
      continue;
    }
    if (!fence) {
      const title = line.match(/^\s*#(?!#)\s+(.+?)\s*#*\s*$/)?.[1]?.trim();
      if (title) return title;
      // A document title, when present, belongs before the first section. This
      // also avoids treating malformed comment HTML later in a source file as
      // a top-level heading.
      if (/^\s*##\s+/.test(line)) break;
    }
  }
  return entry.id.split('/').at(-1) || '未命名文章';
}

function articleFileName(entry: Article) {
  return `${entry.id.split('/').at(-1)}.md`;
}

function navNames(category: Category, course: string) {
  const configPath = join(root, category, course, 'mkdocs.yml');
  if (!existsSync(configPath)) return [];

  try {
    const config = parse(readFileSync(configPath, 'utf8')) as { nav?: unknown[] };
    return (config.nav ?? [])
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.replace(/^docs\//, ''));
  } catch (error) {
    console.warn(`无法解析课程导航: ${configPath}`, error);
    return [];
  }
}

function courseNames(category: Category) {
  const categoryPath = join(root, category);
  return readdirSync(categoryPath, { withFileTypes: true })
    .filter((item) => item.isDirectory() && existsSync(join(categoryPath, item.name, 'docs')))
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

export async function getSiteIndex() {
  const entries = await getCollection('articles');
  const bySource = new Map(entries.map((entry) => [entry.id, entry]));
  const courses: Course[] = [];

  for (const category of categories) {
    for (const name of courseNames(category)) {
      const prefix = `${category}/${name}/docs/`;
      const inCourse = entries.filter((entry) => entry.id.startsWith(prefix));
      const navigation = navNames(category, name);
      const order = new Map(navigation.map((file, index) => [pathToId(`${prefix}${file}`), index]));
      const ordered = [...inCourse].sort((left, right) => {
        const leftOrder = order.get(left.id) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = order.get(right.id) ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder || articleFileName(left).localeCompare(articleFileName(right), 'zh-CN');
      });

      for (const file of navigation) {
        const id = pathToId(`${prefix}${file}`);
        if (!bySource.has(id)) console.warn(`导航引用的文章不存在: ${category}/${name}/docs/${file}`);
      }
      courses.push({ category, name, articles: ordered });
    }
  }

  return courses;
}

export function toIndexedArticle(category: Category, course: string, entry: Article, order: number): IndexedArticle {
  return {
    category,
    course,
    title: titleFrom(entry),
    slug: entry.id.split('/').at(-1) || '',
    sourcePath: `${entry.id}.md`,
    order,
    entry,
  };
}

export function href(category: string, course?: string, article?: string) {
  const parts = [category, course, article].filter((part): part is string => Boolean(part));
  return `/${parts.map((part) => encodeURIComponent(part)).join('/')}/`;
}
