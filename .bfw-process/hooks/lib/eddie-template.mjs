// The `eddie-template` page declaration, and which files are pages (#290, #291).
//
// Every page source in an Eddie project names where it came from:
//
//   eddie-template: ed-p-homepage                               — an Eddie page template
//   eddie-template: none — marketing one-off, no template fits   — a logged escape
//
// Two readers enforce it: the `template-first` Claude Code hook (before a
// write) and the ship gate's provenance check (at merge time). They must never
// disagree about what a declaration says or which files are pages, so this is
// the one parser both use. It lives under `hooks/lib/` because the hook runs
// from a consumer's `.bfw-process/hooks/` copy, where nothing from `src/` is
// reachable; `src/lib/eddie-template.mjs` re-exports it for everything else.
//
// Dependency-free on purpose: the hook must run in a fresh worktree with no
// node_modules, on any Node the package supports (>=18, so no path.matchesGlob).

/** How far into a file a declaration may sit (front matter or a leading comment). */
export const DECLARATION_SCAN_LINES = 40;

const TEMPLATE_TAG = /^ed-p-[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Comment closers and quotes that can trail the value on the declaration line:
// `<!-- eddie-template: ed-p-grid -->`, `{# … #}`, `{{!-- … --}}`, `/* … */`,
// and Liquid's `{% comment %} … {% endcomment %}` / `{%# … %}`.
const TRAILING_NOISE = /\s*(?:-->|--}}|#}|\*\/|\{%-?\s*endcomment\s*-?%\}|-?%\})\s*$/;

/**
 * Read the `eddie-template` declaration from a page's source.
 *
 * @param {string|null|undefined} content
 * @returns {null
 *   | {kind: 'template', template: string}
 *   | {kind: 'none', reason: string}
 *   | {kind: 'invalid', value: string, problem: string}}
 *   `null` means the file declares nothing.
 */
export function parseTemplateDeclaration(content) {
  if (typeof content !== 'string' || content.length === 0) return null;

  const head = content.split(/\r?\n/, DECLARATION_SCAN_LINES);
  for (const line of head) {
    const m = line.match(/eddie-template\s*:\s*(.*)$/);
    if (!m) continue;

    const value = m[1].replace(TRAILING_NOISE, '').trim().replace(/^["']|["']$/g, '').trim();

    if (TEMPLATE_TAG.test(value)) return { kind: 'template', template: value };

    const none = value.match(/^none\b\s*(?:—|–|--|-|:)?\s*(.*)$/i);
    if (none) {
      const reason = none[1].trim();
      if (reason) return { kind: 'none', reason };
      return {
        kind: 'invalid',
        value,
        problem: '`none` needs a reason: `eddie-template: none — <why no template fits>`',
      };
    }

    return {
      kind: 'invalid',
      value,
      problem: `"${value}" is neither an \`ed-p-*\` template nor \`none — <reason>\``,
    };
  }
  return null;
}

// --- Which files are pages -------------------------------------------------

/**
 * Default page globs by project type. `!`-prefixed entries exclude.
 *
 * Markdown is deliberately absent (FEATURE-SPEC #290 §10 Q4): on an Eleventy
 * site a `.md` file is content riding a layout, and a declaration on every blog
 * post would be noise. Every `_`-prefixed file or directory is excluded
 * (`_includes`, `_layouts`, `_data`, `_components`, `_partial.njk` …), and so
 * are templates whose output isn't HTML (`sitemap.xml.njk`, `robots.txt.njk`).
 * `.11ty.js` is left out because it is as often CSS or a feed as a page; a
 * project that renders pages with it adds it to `designSystem.pages`.
 * `recipe` has no pages — recipes aren't pages.
 */
export const DEFAULT_PAGE_GLOBS = {
  'content-site': [
    'src/**/*.{njk,html,liquid}',
    '!**/_*/**',
    '!**/_*',
    '!**/*.{xml,txt,json,css,js,webmanifest}.{njk,liquid}',
  ],
  app: ['pages/**/*.vue', 'app/pages/**/*.vue'],
};

/** Default glob for the built pages the adoption floor measures. */
export const DEFAULT_BUILT_PAGES = {
  'content-site': '_site/**/*.html',
  app: '.output/public/**/*.html',
};

// Project types with no user-facing surface. Mirrors NO_UI_SURFACE in
// src/lib/ship-scripts.mjs, which this module can't import (it must run from a
// consumer's .bfw-process/hooks/ copy); a unit test holds the two equal.
export const NO_PAGE_TYPES = ['script', 'experiment'];

/**
 * The page globs a project uses: `designSystem.pages`, else its type's
 * default. A type with no UI surface has no pages whatever it declares, so the
 * hook and the gate agree that nothing there is guarded.
 */
export function pageGlobs(config) {
  if (NO_PAGE_TYPES.includes(config?.projectType)) return [];
  const declared = config?.designSystem?.pages;
  if (Array.isArray(declared)) return declared;
  if (typeof declared === 'string') return [declared];
  return DEFAULT_PAGE_GLOBS[config?.projectType || 'content-site'] || [];
}

/** The built-pages glob the adoption floor measures, or null when the type has none. */
export function builtPagesGlob(config) {
  const declared = config?.designSystem?.builtPages;
  if (typeof declared === 'string' && declared) return declared;
  return DEFAULT_BUILT_PAGES[config?.projectType || 'content-site'] || null;
}

/** Expand every `{a,b}` group into separate globs (recursively, one group at a time). */
function expandBraces(glob) {
  const m = glob.match(/^(.*?)\{([^{}]*)\}(.*)$/);
  if (!m) return [glob];
  return m[2].split(',').flatMap((alt) => expandBraces(m[1] + alt + m[3]));
}

function segmentToRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        // `**/` matches zero or more whole directories; a bare `**` anything.
        if (glob[i + 2] === '/') {
          re += '(?:[^/]+/)*';
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return re;
}

/**
 * The literal directory a glob's files live under, before its first wildcard
 * segment: `_site/**\/*.html` → `_site`. A glob with no wildcard names a file,
 * so its base is the directory holding it.
 */
export function globBase(glob) {
  const segments = glob.split('/');
  const i = segments.findIndex((s) => /[*?{]/.test(s));
  return (i === -1 ? segments.slice(0, -1) : segments.slice(0, i)).join('/');
}

/** Compile a glob (with `*`, `**`, `?`, `{a,b}`) to an anchored RegExp. */
export function globToRegExp(glob) {
  const alternatives = expandBraces(glob).map(segmentToRegex);
  return new RegExp(`^(?:${alternatives.join('|')})$`);
}

/**
 * Does a repo-relative path match the glob list? A path matches when it
 * matches at least one positive glob and no `!` glob. Paths use `/`.
 */
export function matchesGlobs(relPath, globs) {
  const path = relPath.split('\\').join('/').replace(/^\.\//, '');
  let included = false;
  for (const g of globs) {
    if (g.startsWith('!')) {
      if (globToRegExp(g.slice(1)).test(path)) return false;
    } else if (!included && globToRegExp(g).test(path)) {
      included = true;
    }
  }
  return included;
}

/** Is `relPath` a page under this project's config? */
export function isPageFile(relPath, config) {
  return matchesGlobs(relPath, pageGlobs(config));
}

/** Pull every `ed-p-*` tag out of arbitrary text (a tool response, a catalog). */
export function extractTemplateTags(text) {
  if (typeof text !== 'string') return [];
  return [...new Set(text.match(/ed-p-[a-z0-9]+(?:-[a-z0-9]+)*/g) || [])].sort();
}
