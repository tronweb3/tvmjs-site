import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildNav, SIDEBAR_WITH_RELEASES, RELEASES, SRC_EXCLUDE, type NavLink } from '../../docs/.vitepress/navigation';
import { TVMJS_VERSION } from '../../docs/.vitepress/version';

const DOCS_ROOT = path.resolve(import.meta.dirname, '../../docs');

/** Resolve a VitePress link to the markdown file it renders. */
function sourceFor(link: string) {
  const clean = link.split('#')[0];
  return clean.endsWith('/') ? path.join(DOCS_ROOT, clean, 'index.md') : path.join(DOCS_ROOT, `${clean}.md`);
}

const isInternal = (link: string) => link.startsWith('/');

function flattenSidebar(): NavLink[] {
  return SIDEBAR_WITH_RELEASES.flatMap((group) => group.items);
}

describe('sidebar', () => {
  it('has entries', () => {
    expect(flattenSidebar().length).toBeGreaterThan(0);
  });

  it.each(flattenSidebar().map((item) => [item.text, item.link] as const))(
    'links %s to a markdown file that exists',
    (_text, link) => {
      expect(isInternal(link)).toBe(true);
      expect(fs.existsSync(sourceFor(link))).toBe(true);
    }
  );

  it('does not link the same page twice', () => {
    const links = flattenSidebar().map((item) => item.link);
    expect(new Set(links).size).toBe(links.length);
  });
});

describe('nav', () => {
  const nav = buildNav('/tvmjs', TVMJS_VERSION);

  it('points Home at the site root, outside the docs base', () => {
    const home = nav.find((entry) => 'component' in entry);
    expect(home).toBeDefined();
    expect(home && 'props' in home && home.props.href).toBe('/tvmjs/');
  });

  it('points Home at "/" when the site is served from the origin root', () => {
    const [home] = buildNav('', TVMJS_VERSION);
    expect('props' in home && home.props.href).toBe('/');
  });

  it('has a Docs entry that leads to the docs landing page', () => {
    const docs = nav.find((entry) => 'text' in entry && entry.text === 'Docs');
    expect(docs && 'link' in docs && docs.link).toBe('/');
  });

  it.each(
    buildNav('/tvmjs', TVMJS_VERSION)
      .flatMap((entry) => ('items' in entry ? entry.items : 'link' in entry ? [entry] : []))
      .filter((item) => isInternal(item.link))
      .map((item) => [item.text, item.link] as const)
  )('links %s to a markdown file that exists', (_text, link) => {
    expect(fs.existsSync(sourceFor(link))).toBe(true);
  });

  it('shows the version the docs were written against', () => {
    const versionEntry = nav.find((entry) => 'text' in entry && entry.text === `v${TVMJS_VERSION}`);
    expect(versionEntry).toBeDefined();
  });
});

describe('releases', () => {
  it('documents the version the nav advertises', () => {
    expect(RELEASES.some((release) => release.link === `/releases/v${TVMJS_VERSION}`)).toBe(true);
  });

  it('lists every release note file, so none is published but unreachable', () => {
    const onDisk = fs
      .readdirSync(path.join(DOCS_ROOT, 'releases'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => `/releases/${name.replace(/\.md$/, '')}`)
      .sort();
    const linked = RELEASES.map((release) => release.link).sort();
    expect(linked).toEqual(onDisk);
  });
});

describe('docs pages', () => {
  const markdown = fs
    .readdirSync(DOCS_ROOT, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.md'))
    // VitePress ignores all three: `.vitepress` is configuration, `node_modules` is not
    // content, and SRC_EXCLUDE is what the config itself declares is not a page.
    .filter(
      (entry) =>
        !entry.startsWith('.vitepress') &&
        !entry.split(path.sep).includes('node_modules') &&
        !SRC_EXCLUDE.includes(entry)
    );

  it('reaches every page from the sidebar or the nav', () => {
    const reachable = new Set(
      [...flattenSidebar(), ...buildNav('', TVMJS_VERSION).flatMap((e) => ('items' in e ? e.items : []))]
        .filter((item) => isInternal(item.link))
        .map((item) => path.relative(DOCS_ROOT, sourceFor(item.link)))
    );
    // index.md is the landing page; VitePress routes it without a sidebar entry.
    const orphans = markdown.filter((file) => file !== 'index.md' && !reachable.has(file));
    expect(orphans).toEqual([]);
  });

  it.each(markdown)('gives %s a level-1 heading or a frontmatter layout', (file) => {
    const source = fs.readFileSync(path.join(DOCS_ROOT, file), 'utf8');
    const hasHeading = /^#\s+\S/m.test(source);
    const hasLayout = /^---[\s\S]*?\blayout:\s*\S/m.test(source);
    expect(hasHeading || hasLayout).toBe(true);
  });
});
