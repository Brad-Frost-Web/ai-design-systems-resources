#!/usr/bin/env node
/**
 * Template-first hook for Claude Code (#290). AGENTS.md §2.5 rules 4 and 6.
 *
 * Installed by `bfw-process init` / `sync` into `.bfw-process/hooks/` and wired
 * into `.claude/settings.json` on two events:
 *
 * - PostToolUse on `mcp__*__eddie_list_pages` / `mcp__*__eddie_compose_recipe`
 *   RECORDS the call for this session: which `ed-p-*` templates list_pages
 *   returned, and each compose intent.
 * - PreToolUse on Write/Edit/MultiEdit GUARDS page files. The write is refused
 *   (exit 2, reason on stderr, which Claude Code hands back to the model) unless
 *   the file's resulting content declares either
 *     `eddie-template: none — <reason>`  (the logged escape), or
 *     `eddie-template: ed-p-…`           where this session called BOTH tools
 *                                        and list_pages returned that template.
 *
 * Why a hook: the rules are prose, and prose is summarised away at compaction.
 * On learn.bradfrost.com the agent's post-compaction summary kept "look up every
 * component" and dropped the template-first steps; the hub shipped 23% Eddie
 * (Brad-Frost-Web/learn#18). A hook runs every time and survives compaction.
 *
 * Session state lives in the OS temp dir (FEATURE-SPEC #290 §10 Q3): one
 * directory per session_id, one file per recorded call, each written to a
 * temporary name and renamed into place. Separate files rather than one
 * read-modify-write record, because the two tool calls can run in parallel and
 * a lost update would refuse a write the session had earned. The durable,
 * reviewable record is the declaration in the page.
 *
 * Allows WITH a one-line stderr note on: `eddieIntegration: false`, a missing
 * session_id, an unparseable payload, and any internal error — including the
 * parser module failing to load. A hook that crashed into refusing every write
 * would be worse than none; the ship gate's provenance check (#291) is the
 * backstop. Allows SILENTLY, because these are not pages: a path outside the
 * project (compared as real paths, so a symlinked checkout can't dodge it) and
 * any file the project's page globs don't match. Other harnesses have no hooks
 * at all, which is what the gate is for.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, renameSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';

const RECORD_TOOL = /^mcp__.+__eddie_(list_pages|compose_recipe)$/;
const GUARDED_TOOLS = new Set(['Write', 'Edit', 'MultiEdit']);

const NEXT_ACTION =
  'call `eddie_list_pages` and `eddie_compose_recipe` with the page\'s intent, then start from ' +
  'the closest `ed-p-*` and declare it in the page (`eddie-template: ed-p-…` in front matter or ' +
  'a leading comment), or declare `eddie-template: none — <reason>`.';

class Allow {
  constructor(note) {
    this.note = note;
  }
}

/** One directory per session; the id is sanitised because it becomes a path. */
function sessionDir(sessionId) {
  return join(tmpdir(), 'bfw-process-template-first', String(sessionId).replace(/[^A-Za-z0-9_-]/g, '_'));
}

/** Append one recorded call atomically: write a temp file, then rename it in. */
function appendRecord(dir, record) {
  mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${process.pid}-${Math.random().toString(36).slice(2)}`;
  writeFileSync(join(dir, `.${name}.tmp`), JSON.stringify(record));
  renameSync(join(dir, `.${name}.tmp`), join(dir, `${name}.json`));
}

/** Fold every recorded call in a session into { listPages, composeRecipe }. */
function readSession(dir) {
  const session = { listPages: null, composeRecipe: [] };
  let names = [];
  try {
    names = readdirSync(dir).filter((n) => n.endsWith('.json'));
  } catch {
    return session;
  }
  for (const name of names.sort()) {
    let rec;
    try {
      rec = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    } catch {
      continue;
    }
    if (rec.tool === 'list_pages') {
      const templates = new Set([...(session.listPages?.templates || []), ...(rec.templates || [])]);
      session.listPages = { at: rec.at, templates: [...templates].sort() };
    } else if (rec.tool === 'compose_recipe') {
      session.composeRecipe.push({ at: rec.at, intent: rec.intent ?? null });
    }
  }
  return session;
}

/** The file's content as it would be after this tool call. */
function resultingContent(toolName, toolInput, onDisk) {
  if (toolName === 'Write') return toolInput?.content ?? '';
  const apply = (text, { old_string: from = '', new_string: to = '', replace_all: all } = {}) =>
    !from ? text : all ? text.split(from).join(to) : text.replace(from, () => to);
  if (toolName === 'Edit') return apply(onDisk ?? '', toolInput);
  if (toolName === 'MultiEdit') return (toolInput?.edits || []).reduce(apply, onDisk ?? '');
  return onDisk ?? '';
}

/** Decide a guarded write: { allow: true, note? } or { allow: false, reason }. */
function decide({ relPath, decl, session }) {
  if (decl?.kind === 'none') {
    return { allow: true, note: `[template-first] ${relPath}: escape declared — ${decl.reason}` };
  }
  if (decl?.kind === 'invalid') {
    return {
      allow: false,
      reason: `Template-first: ${relPath} has an invalid eddie-template declaration: ${decl.problem}.`,
    };
  }
  if (!decl) {
    return {
      allow: false,
      reason:
        `Template-first: ${relPath} is a page and declares no template. Before building this page, ` +
        NEXT_ACTION,
    };
  }

  const missing = [];
  if (!session.listPages) missing.push('`eddie_list_pages`');
  if (!session.composeRecipe.length) missing.push('`eddie_compose_recipe`');
  if (missing.length) {
    return {
      allow: false,
      reason:
        `Template-first: ${relPath} declares ${decl.template}, but this session hasn't called ` +
        `${missing.join(' or ')}. Before building this page, ${NEXT_ACTION}`,
    };
  }
  const returned = session.listPages.templates;
  if (!returned.includes(decl.template)) {
    return {
      allow: false,
      reason:
        `Template-first: ${relPath} declares ${decl.template}, which \`eddie_list_pages\` did not ` +
        `return this session (it returned: ${returned.join(', ') || 'nothing'}). Declare one of those, ` +
        'or `eddie-template: none — <reason>`.',
    };
  }
  return { allow: true };
}

/** A path's real location, resolving symlinks through its nearest existing ancestor. */
function realPath(path) {
  let dir = path;
  const tail = [];
  for (;;) {
    try {
      return join(realpathSync(dir), ...tail.reverse());
    } catch {
      const parent = dirname(dir);
      if (parent === dir) return path;
      tail.push(basename(dir));
      dir = parent;
    }
  }
}

function readConfig(root) {
  try {
    return JSON.parse(readFileSync(resolve(root, '.bfw-process/config.json'), 'utf8')) || {};
  } catch {
    return {};
  }
}

async function main() {
  // Loaded inside the fail-open: a missing or mismatched parser is an internal
  // error like any other, not a stack trace that exits 1.
  const { extractTemplateTags, isPageFile, parseTemplateDeclaration } = await import('./lib/eddie-template.mjs');

  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    throw new Allow('[template-first] unreadable hook payload; skipping.');
  }

  const root = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const config = readConfig(root);
  if (config.eddieIntegration === false) {
    throw new Allow('[template-first] eddieIntegration is false in .bfw-process/config.json; skipping.');
  }
  if (!payload.session_id) throw new Allow('[template-first] no session_id in the hook payload; skipping.');

  const dir = sessionDir(payload.session_id);
  const toolName = payload.tool_name || '';

  if (payload.hook_event_name === 'PostToolUse') {
    const m = toolName.match(RECORD_TOOL);
    if (!m) throw new Allow();
    const at = new Date().toISOString();
    if (m[1] === 'list_pages') {
      const r = payload.tool_response;
      appendRecord(dir, {
        tool: 'list_pages',
        at,
        templates: extractTemplateTags(typeof r === 'string' ? r : JSON.stringify(r ?? '')),
      });
    } else {
      appendRecord(dir, { tool: 'compose_recipe', at, intent: payload.tool_input?.intent ?? null });
    }
    throw new Allow();
  }

  if (payload.hook_event_name !== 'PreToolUse' || !GUARDED_TOOLS.has(toolName)) throw new Allow();

  const target = payload.tool_input?.file_path;
  if (typeof target !== 'string' || !target) throw new Allow();
  const abs = realPath(isAbsolute(target) ? target : resolve(root, target));
  const relPath = relative(realPath(resolve(root)), abs).split('\\').join('/');
  if (!relPath || relPath.startsWith('..') || isAbsolute(relPath)) throw new Allow();
  if (!isPageFile(relPath, config)) throw new Allow();

  let onDisk = null;
  try {
    onDisk = readFileSync(abs, 'utf8');
  } catch {
    /* a new file */
  }

  const verdict = decide({
    relPath,
    decl: parseTemplateDeclaration(resultingContent(toolName, payload.tool_input, onDisk)),
    session: readSession(dir),
  });
  if (verdict.allow) throw new Allow(verdict.note);
  process.stderr.write(verdict.reason + '\n');
  process.exit(2);
}

try {
  await main();
} catch (err) {
  if (err instanceof Allow) {
    if (err.note) process.stderr.write(err.note + '\n');
  } else {
    process.stderr.write(`[template-first] internal error, allowing: ${err?.message || err}\n`);
  }
  process.exit(0);
}
