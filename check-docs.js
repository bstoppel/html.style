/**
 * Documentation checker
 *
 *   node check-docs.js
 *
 * Verifies the claims in the Markdown that a machine can verify. It does not
 * judge prose — it catches the specific way these docs have gone wrong
 * repeatedly: naming a file that does not exist, linking to a heading that was
 * renamed, documenting a script that was removed, and describing a component
 * layer that has moved on.
 *
 * No dependencies, consistent with the rest of the project.
 */

const fs = require('fs');
const path = require('path');

const DOCS = [
  'README.md',
  'CLAUDE.md',
  'CONTRIBUTING.md',
  'tests/README.md',
  'docs/frameworks.md',
  'docs/design-system.md',
  'docs/positioning.md',
  'docs/adr/README.md',
  'docs/adr/0001-use-architecture-decision-records.md',
  'docs/adr/0002-web-components-as-delivery-mechanism.md',
  'docs/adr/0003-overridable-design-system.md',
  'docs/adr/0004-yearly-standards-snapshot.md',
  'docs/adr/0006-nav-collapse-mechanism.md',
  'docs/adr/0007-convenience-component-test.md',
  'src/FAVICON_GENERATION.md',
];

const MANIFEST = 'dist/custom-elements.json';

const problems = [];
const fail = (file, message) => problems.push({ file, message });

/** Markdown outside fenced code blocks. Links in samples are illustrative. */
function prose(source) {
  return source.replace(/```[\s\S]*?```/g, '');
}

/** GitHub's heading-to-anchor rule, close enough for our own headings. */
function slug(heading) {
  return heading
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function checkLinksAndAnchors(file, source) {
  const text = prose(source);
  const headings = new Set(
    [...source.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => slug(m[1]))
  );

  for (const [, , target] of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;

    const [pathPart, anchor] = target.split('#');

    if (pathPart) {
      const resolved = path.join(path.dirname(file), pathPart);
      if (!fs.existsSync(resolved)) {
        fail(file, `link points at a missing path: ${target}`);
      }
    } else if (anchor && !headings.has(anchor)) {
      fail(file, `link points at a missing heading: #${anchor}`);
    }
  }
}

/** Every npm script a doc tells the reader to run must exist. */
function checkNpmScripts(file, source) {
  const scripts = new Set(Object.keys(readJson('package.json').scripts ?? {}));
  for (const [, name] of source.matchAll(/npm run ([a-z0-9:_-]+)/g)) {
    if (!scripts.has(name)) fail(file, `references a missing npm script: ${name}`);
  }
}

/** Every filename drawn in a directory tree must exist somewhere in the repo. */
function checkFileTrees(file, source) {
  const known = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', 'test-results', 'playwright-report'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else known.add(entry.name);
    }
  };
  walk('.');

  // Scan lines carrying tree glyphs rather than trying to pair code fences.
  // Pairing is easy to get wrong — a regex expecting ``` followed by a newline
  // skips ```bash openers and then matches a CLOSING fence to the next opener,
  // inverting which text counts as a block.
  for (const line of source.split('\n')) {
    if (!line.includes('├──') && !line.includes('└──')) continue;
    const match = line.match(/([A-Za-z0-9_.-]+\.(?:webmanifest|json|html|css|svg|txt|md|js))\b/);
    if (match && !known.has(match[1])) {
      fail(file, `directory tree names a missing file: ${match[1]}`);
    }
  }
}

/** The README should document every element the build actually ships. */
function checkComponentsDocumented() {
  if (!fs.existsSync(MANIFEST)) {
    fail(MANIFEST, 'missing — run `npm run build` first');
    return;
  }

  const readme = fs.readFileSync('README.md', 'utf8');
  const manifest = readJson(MANIFEST);
  const tags = manifest.modules
    .flatMap((m) => m.declarations ?? [])
    .filter((d) => d.customElement && d.tagName)
    .map((d) => d.tagName);

  for (const tag of tags) {
    if (!readme.includes(`<${tag}`) && !readme.includes(`\`${tag}\``)) {
      fail('README.md', `ships ${tag} but never mentions it`);
    }
  }
  return tags.length;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

let checked = 0;
for (const file of DOCS) {
  if (!fs.existsSync(file)) {
    fail(file, 'listed in check-docs.js but does not exist');
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  checkLinksAndAnchors(file, source);
  checkNpmScripts(file, source);
  checkFileTrees(file, source);
  checked++;
}

const elementCount = checkComponentsDocumented();

if (problems.length > 0) {
  console.error(`Documentation is out of date (${problems.length} problem(s)):\n`);
  for (const { file, message } of problems) console.error(`  ${file}: ${message}`);
  console.error('');
  process.exit(1);
}

console.log(`Docs OK: ${checked} file(s), ${elementCount} element(s) documented.`);
