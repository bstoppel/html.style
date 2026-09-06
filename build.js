/**
 * html.style build
 *
 * Single source of truth: everything in dist/ is generated from src/, and the
 * framework assets under website/ are mirrored from src/ too. Nothing in dist/
 * or website/css|js is hand-edited.
 *
 *   node build.js           write dist/ and mirror website assets
 *   node build.js --check   verify both are in sync; exit 1 if not
 *
 * HTML is processed with regular expressions rather than a parser. That is a
 * deliberate limit, not an oversight: this project ships no dependencies, and
 * the partial syntax is small enough to stay legible. Partials must use plain,
 * well-formed tags.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHECK = process.argv.includes('--check');

const SRC = 'src';
const DIST = 'dist';
const WEBSITE = 'website';

/** Mirrored verbatim from src/ into dist/. */
const ASSET_DIRS = ['css', 'js', 'components'];

/**
 * Components are ALSO shipped as one bundle. Lit imports by bare specifier
 * ('lit'), which a browser cannot resolve on its own, so the unbundled sources
 * mirrored above are for consumers who run their own bundler, and this file is
 * for the copy-dist-and-open path the project exists to support.
 */
const COMPONENT_ENTRY = 'src/components/index.js';
const COMPONENT_BUNDLE = 'js/html.style.components.js';

/**
 * A classic-script build of the same components. ES modules are blocked from
 * file:// by CORS, so a page opened straight off disk cannot use the module
 * bundle at all. This one registers the elements as a side effect of a plain
 * <script src>, which file:// does allow.
 */
const COMPONENT_BUNDLE_CLASSIC = 'js/html.style.components.classic.js';

/**
 * The custom elements manifest is what gives editors and agents completion and
 * type information for <hs-*>. It is generated from the SHIPPED modules under
 * dist/components/, so the module paths it records are the ones a consumer
 * actually has.
 */
const MANIFEST = 'custom-elements.json';
const MANIFEST_TMP = '.cem-tmp';
const STATIC_FILES = ['favicon.svg', 'site.webmanifest', 'robots.txt'];

/** The project website consumes the framework's own assets; kept in sync so it cannot drift. */
const WEBSITE_ASSET_DIRS = ['css', 'js'];
const WEBSITE_STATIC_FILES = ['favicon.svg', 'site.webmanifest'];

const stale = [];

/** Write only when content differs. Under --check, record the path instead. */
function sync(dest, content) {
  const current = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
  if (current && current.equals(content)) return false;
  if (CHECK) {
    stale.push(dest);
    return true;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
  return true;
}

function copyDir(from, to) {
  let changed = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) changed += copyDir(src, dest);
    else if (sync(dest, fs.readFileSync(src))) changed++;
  }
  return changed;
}

function copyFiles(names, from, to) {
  let changed = 0;
  for (const name of names) {
    const src = path.join(from, name);
    if (fs.existsSync(src) && sync(path.join(to, name), fs.readFileSync(src))) changed++;
  }
  return changed;
}

/**
 * Partials are named for the element they render: src/partials/site-header.html
 * defines <site-header>. Custom element names must contain a hyphen.
 */
function loadPartials() {
  const dir = path.join(SRC, 'partials');
  if (!fs.existsSync(dir)) return {};

  const partials = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    const name = path.basename(file, '.html');
    if (!name.includes('-')) {
      throw new Error(
        `Partial ${file} must be named for the custom element it renders, ` +
          `which requires a hyphen (e.g. site-header.html).`
      );
    }
    partials[name] = fs.readFileSync(path.join(dir, file), 'utf8');
  }
  return partials;
}

/**
 * Fill a partial's <slot name="x">fallback</slot> from the instance's
 * <span slot="x">override</span> children, matching what the runtime
 * <site-header> component does at render time. A slot with no matching
 * override keeps its own content.
 */
function render(partial, instanceInner) {
  const overrides = {};
  const overridePattern = /<([a-zA-Z][\w-]*)\b[^>]*\sslot=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1\s*>/g;
  for (const match of instanceInner.matchAll(overridePattern)) {
    overrides[match[2]] = match[3].trim();
  }

  return partial.replace(
    /<slot\b(?:[^>]*?\sname=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/slot\s*>/g,
    (_, name, fallback) => (name && name in overrides ? overrides[name] : fallback)
  );
}

function bundleComponents() {
  if (!fs.existsSync(COMPONENT_ENTRY)) return 0;

  // buildSync keeps this script synchronous, so --check stays a straight
  // compare with no async plumbing.
  const { buildSync } = require('esbuild');
  const common = {
    entryPoints: [COMPONENT_ENTRY],
    bundle: true,
    target: 'es2022',
    minify: true,
    write: false,
    banner: { js: '/*! html.style components - MIT - https://html.style */' },
  };

  const esm = buildSync({ ...common, format: 'esm' });
  const classic = buildSync({ ...common, format: 'iife' });

  let changed = 0;
  if (sync(path.join(DIST, COMPONENT_BUNDLE), Buffer.from(esm.outputFiles[0].contents))) changed++;
  if (sync(path.join(DIST, COMPONENT_BUNDLE_CLASSIC), Buffer.from(classic.outputFiles[0].contents))) changed++;
  return changed;
}

function generateManifest() {
  const components = path.join(DIST, 'components');
  if (!fs.existsSync(components)) return 0;

  // The analyzer is a CLI that writes its own file, so run it into a temp
  // directory and route the result through sync(). Letting it write into dist/
  // directly would make --check unable to tell a stale manifest from a fresh
  // one, because the file would already have been overwritten.
  const analyzerPkg = require.resolve('@custom-elements-manifest/analyzer/package.json');
  const cli = path.join(path.dirname(analyzerPkg), 'cem.js');

  // --outdir is resolved relative to cwd and silently ignores an absolute
  // path, so the scratch directory has to live inside the project.
  const tmp = MANIFEST_TMP;
  fs.mkdirSync(tmp, { recursive: true });

  try {
    execFileSync(
      process.execPath,
      [cli, 'analyze', '--globs', `${components}/*.js`, '--litelement', '--outdir', tmp],
      { stdio: 'pipe' }
    );
    const generated = fs.readFileSync(path.join(tmp, MANIFEST));
    return sync(path.join(DIST, MANIFEST), generated) ? 1 : 0;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function buildHtml(partials) {
  let changed = 0;

  for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.html'))) {
    let html = fs.readFileSync(path.join(SRC, file), 'utf8');

    for (const [name, partial] of Object.entries(partials)) {
      const instance = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}\\s*>`, 'g');
      html = html.replace(instance, (_, inner) => render(partial, inner));
    }

    // Any slot outside a partial instance keeps its fallback content.
    html = html.replace(/<slot\b[^>]*>([\s\S]*?)<\/slot\s*>/g, '$1');

    if (sync(path.join(DIST, file), Buffer.from(html))) changed++;
  }

  return changed;
}

const partials = loadPartials();

let changed = buildHtml(partials);
changed += bundleComponents();
for (const dir of ASSET_DIRS) changed += copyDir(path.join(SRC, dir), path.join(DIST, dir));
changed += copyFiles(STATIC_FILES, SRC, DIST);
// After the component copy above, so the manifest describes what dist/ holds.
changed += generateManifest();

if (fs.existsSync(WEBSITE)) {
  for (const dir of WEBSITE_ASSET_DIRS) changed += copyDir(path.join(SRC, dir), path.join(WEBSITE, dir));
  changed += copyFiles(WEBSITE_STATIC_FILES, SRC, WEBSITE);
}

if (CHECK) {
  if (stale.length > 0) {
    console.error('Build output is stale. Run `npm run build` and commit the result:');
    for (const file of stale) console.error(`  ${file}`);
    process.exit(1);
  }
  console.log('Build output is in sync.');
} else {
  console.log(`Build complete: ${changed} file(s) written.`);
}
