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
const TYPES = 'custom-elements.d.ts';
/**
 * Analysed into a scratch directory rather than straight into dist/, so
 * `--check` can compare what the analyzer produced against what is committed.
 * Writing directly would overwrite the file first and make the two
 * indistinguishable.
 *
 * The analyzer also writes its outdir into package.json's `customElements`
 * field by default, which pointed every consumer at this gitignored, deleted
 * directory. custom-elements-manifest.config.mjs turns that off; the field is
 * declared by hand and names the manifest that actually ships.
 */
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
      // stderr is inherited rather than piped. The analyzer reports a bad
      // config by logging and carrying on, so piping it swallowed the one
      // message that would have explained why custom-elements-manifest.config
      // was being ignored. stdout stays piped; it is only a summary.
      { stdio: ['ignore', 'pipe', 'inherit'] }
    );
    const generated = fs.readFileSync(path.join(tmp, MANIFEST));
    return sync(path.join(DIST, MANIFEST), generated) ? 1 : 0;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * TypeScript declarations, generated from the manifest rather than hand-written,
 * so they cannot drift from what the components actually expose.
 *
 * This is deliberately not a set of framework wrappers. What a wrapper mostly
 * buys is autocomplete and type errors, and those come from declaring the
 * elements once: HTMLElementTagNameMap makes every DOM lookup typed, in vanilla
 * TypeScript and inside React, Vue or Svelte alike.
 */
function generateTypes() {
  const manifestPath = path.join(DIST, MANIFEST);
  if (!fs.existsSync(manifestPath)) return 0;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const elements = manifest.modules
    .flatMap((m) => m.declarations ?? [])
    .filter((d) => d.customElement && d.tagName)
    .sort((a, b) => a.tagName.localeCompare(b.tagName));

  /** Underscore and hash names are internal state, whatever the manifest says. */
  const isPublic = (member) =>
    member.privacy !== 'private' && !/^[_#]/.test(member.name);

  const comment = (text, indent) => {
    if (!text) return '';
    const body = text.replace(/\s+/g, ' ').trim();
    return `${indent}/** ${body} */\n`;
  };

  /** A name that is not a plain identifier has to be quoted to be legal TS. */
  const key = (name) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : `'${name}'`);

  const identifier = (name) => /^[A-Za-z_$][\w$]*$/.test(name);

  /**
   * A JSDoc type the analyzer could not parse arrives as raw JSDoc text, which
   * is not a type at all. Anything carrying a newline or an @ is discarded
   * rather than written out — it stopped the whole file parsing once.
   */
  const typeText = (text, fallback = 'unknown') =>
    text && !/[@\n]/.test(text) ? text : fallback;

  const interfaceName = (tag) =>
    tag.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('') + 'Element';

  /**
   * `@returns {HsToast}` names the component CLASS, which this file does not
   * declare — it declares HsToastElement. Without this the return type is a
   * dangling reference that only shows up when someone compiles against it.
   */
  const classToInterface = new Map(
    elements.filter((e) => e.name).map((e) => [e.name, interfaceName(e.tagName)])
  );
  const resolveType = (text, fallback) => {
    const resolved = typeText(text, fallback);
    return classToInterface.get(resolved) ?? resolved;
  };

  const blocks = elements.map((element) => {
    const name = interfaceName(element.tagName);
    const members = (element.members ?? []).filter(isPublic);
    const fields = members.filter((m) => m.kind === 'field');
    const methods = members.filter((m) => m.kind === 'method');
    const events = element.events ?? [];

    const eventMap = events.length
      ? `export interface ${name}EventMap {\n` +
        events
          .map(
            (event) =>
              comment(event.description, '  ') +
              `  ${key(event.name)}: ${event.type?.text || 'Event'};\n`
          )
          .join('') +
        `}\n\n`
      : '';

    const listeners = events.length
      ? `\n` +
        ['addEventListener', 'removeEventListener']
          .map(
            (method) =>
              `  ${method}<K extends keyof ${name}EventMap>(\n` +
              `    type: K,\n` +
              `    listener: (this: ${name}, event: ${name}EventMap[K]) => unknown,\n` +
              `    options?: boolean | ${method === 'addEventListener' ? 'AddEventListenerOptions' : 'EventListenerOptions'}\n` +
              `  ): void;\n` +
              `  ${method}(\n` +
              `    type: string,\n` +
              `    listener: EventListenerOrEventListenerObject,\n` +
              `    options?: boolean | ${method === 'addEventListener' ? 'AddEventListenerOptions' : 'EventListenerOptions'}\n` +
              `  ): void;\n`
          )
          .join('')
      : '';

    const body =
      fields
        .map(
          (field) =>
            comment(field.description, '  ') +
            // `unknown` rather than a guess. The analyzer cannot infer a getter's
            // type, and declaring `panels` a string because that was a
            // convenient default would be worse than declaring nothing.
            `  ${key(field.name)}: ${resolveType(field.type?.text, 'unknown')};\n`
        )
        .join('') +
      methods
        .map((method) => {
          const declared = method.parameters ?? [];
          // One unusable parameter name poisons the whole signature, so the
          // list is taken as a unit rather than patched element by element.
          const usable = declared.every((p) => identifier(p.name));
          const params = usable
            ? declared
                .map(
                  (p) =>
                    `${p.name}${p.optional ? '?' : ''}: ${resolveType(p.type?.text, 'unknown')}`
                )
                .join(', ')
            : '...args: unknown[]';
          return (
            comment(method.description, '  ') +
            `  ${key(method.name)}(${params}): ${resolveType(method.return?.type?.text, 'void')};\n`
          );
        })
        .join('');

    return (
      eventMap +
      comment(element.description, '') +
      `export interface ${name} extends HTMLElement {\n${body}${listeners}}\n`
    );
  });

  const tagMap = elements
    .map((element) => `    ${key(element.tagName)}: ${interfaceName(element.tagName)};`)
    .join('\n');

  const output =
    `// Generated by build.js from ${MANIFEST}. Do not edit.\n` +
    `//\n` +
    `// Declaring the elements once is what a framework wrapper would mostly have\n` +
    `// bought: HTMLElementTagNameMap types every document.querySelector and\n` +
    `// createElement call, in plain TypeScript and inside any framework.\n` +
    `\n` +
    blocks.join('\n') +
    `\ndeclare global {\n  interface HTMLElementTagNameMap {\n${tagMap}\n  }\n}\n`;

  return sync(path.join(DIST, TYPES), Buffer.from(output)) ? 1 : 0;
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
// After the manifest, which it is generated from.
changed += generateTypes();

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
