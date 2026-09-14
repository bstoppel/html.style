/**
 * Custom elements manifest analyzer configuration.
 *
 * One setting, and it exists to stop the analyzer editing package.json.
 *
 * By default the analyzer writes its `--outdir` into package.json's
 * `customElements` field on every run. build.js deliberately analyses into a
 * temporary directory — writing straight into dist/ would leave `--check`
 * unable to tell a stale manifest from a fresh one, because the file would
 * already have been overwritten — so the field was being reset to
 * `.cem-tmp/custom-elements.json` every build. That path is gitignored, deleted
 * in a `finally`, and outside `files[]`, so a published package would have
 * pointed every consumer's editor at nothing.
 *
 * Nothing errors when that happens. Completion for `<hs-*>` just silently does
 * not exist, which is the concrete form of the machine-readable claim.
 *
 * With this off, package.json declares the SHIPPED manifest by hand and the
 * build only generates it.
 */
export default {
  packagejson: false,
};
