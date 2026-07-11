import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const leadingDivider = /^---\r?\n[ \t]*\r?\n/;
const dividerPlaceholder = '<!-- geektime-leading-divider -->';

const markdownFiles = execFileSync('git', ['ls-files', '-z', '--', '*.md'], {
  encoding: 'buffer',
  maxBuffer: 16 * 1024 * 1024,
})
  .toString('utf8')
  .split('\0')
  .filter(Boolean);

for (const file of markdownFiles) {
  const original = await readFile(file, 'utf8');

  // A leading `---` followed by a blank line is not frontmatter. It is a
  // horizontal divider that Prettier previously rewrote from `* * *`; Astro
  // interprets it as frontmatter and fails while parsing the article.
  const normalized = original.replace(leadingDivider, '* * *\n\n');
  const protectedSource = normalized.replace(/^\* \* \*(?=\r?\n)/, dividerPlaceholder);

  if (protectedSource !== original) await writeFile(file, protectedSource, 'utf8');
}

execFileSync(
  process.platform === 'win32' ? 'node_modules/.bin/prettier.cmd' : 'node_modules/.bin/prettier',
  ['--write', '--cache', '--ignore-path', '.gitignore', '--log-level', 'warn', '**/*.md'],
  { stdio: 'inherit' },
);

for (const file of markdownFiles) {
  const formatted = await readFile(file, 'utf8');
  const result = formatted.replace(dividerPlaceholder, '* * *');
  if (result !== formatted) await writeFile(file, result, 'utf8');
}

console.log(`Formatted ${markdownFiles.length} Markdown files.`);
