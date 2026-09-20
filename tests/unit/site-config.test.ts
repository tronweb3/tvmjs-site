import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * site/src/lib/config.ts reads its environment once at module load, the same way the
 * bundled app does, so every case here re-imports the module under a stubbed environment.
 */
async function loadConfig(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) vi.stubEnv(key, '');
    else vi.stubEnv(key, value);
  }
  return import('@/lib/config');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('normalizePath', () => {
  it('collapses the exported and the dev form of a route to one value', async () => {
    const { normalizePath } = await loadConfig();
    expect(normalizePath('/roadmap.html')).toBe('/roadmap');
    expect(normalizePath('/roadmap')).toBe('/roadmap');
  });

  it('drops query strings and fragments', async () => {
    const { normalizePath } = await loadConfig();
    expect(normalizePath('/roadmap.html?utm=x#top')).toBe('/roadmap');
  });

  it('keeps the root as "/" rather than collapsing it to an empty string', async () => {
    const { normalizePath } = await loadConfig();
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('')).toBe('/');
  });

  it('strips a trailing slash but not the root slash', async () => {
    const { normalizePath } = await loadConfig();
    expect(normalizePath('/docs/')).toBe('/docs');
  });

  it('strips an index suffix', async () => {
    const { normalizePath } = await loadConfig();
    expect(normalizePath('/announcement/index')).toBe('/announcement');
  });
});

describe('isActivePath', () => {
  it('matches a page rendered as .html against the dev-form nav entry', async () => {
    const { isActivePath } = await loadConfig();
    expect(isActivePath('/roadmap.html', '/roadmap')).toBe(true);
  });

  it('does not match a different route', async () => {
    const { isActivePath } = await loadConfig();
    expect(isActivePath('/roadmap.html', '/announcement')).toBe(false);
  });

  it('does not treat a prefix as a match', async () => {
    const { isActivePath } = await loadConfig();
    expect(isActivePath('/announcement/1.1.0.html', '/announcement')).toBe(false);
  });
});

describe('withBasePath', () => {
  it('prefixes public assets when the app is mounted under a path', async () => {
    const { withBasePath, assetPath } = await loadConfig({ NEXT_PUBLIC_BASE_PATH: '/tvmjs' });
    expect(withBasePath('/logo.png')).toBe('/tvmjs/logo.png');
    expect(assetPath('/favicon.ico')).toBe('/tvmjs/favicon.ico');
  });

  it('is a no-op at the origin root', async () => {
    const { withBasePath } = await loadConfig({ NEXT_PUBLIC_BASE_PATH: '' });
    expect(withBasePath('/logo.png')).toBe('/logo.png');
  });

  it('never produces a double slash', async () => {
    const { withBasePath } = await loadConfig({ NEXT_PUBLIC_BASE_PATH: '/tvmjs' });
    expect(withBasePath('/logo.png')).not.toContain('//');
  });
});

describe('SITE_ROOT', () => {
  it('points at the mount point when nested', async () => {
    const { SITE_ROOT } = await loadConfig({ NEXT_PUBLIC_BASE_PATH: '/tvmjs' });
    expect(SITE_ROOT).toBe('/tvmjs');
  });

  it('falls back to "/" at the origin root, so the logo link is never empty', async () => {
    const { SITE_ROOT } = await loadConfig({ NEXT_PUBLIC_BASE_PATH: '' });
    expect(SITE_ROOT).toBe('/');
  });
});

describe('absoluteUrl', () => {
  it('builds canonical URLs from the configured origin', async () => {
    const { absoluteUrl } = await loadConfig({ NEXT_PUBLIC_SITE_URL: 'https://example.org/tvmjs' });
    expect(absoluteUrl('/roadmap.html')).toBe('https://example.org/tvmjs/roadmap.html');
  });

  it('tolerates a trailing slash on the configured origin', async () => {
    const { absoluteUrl } = await loadConfig({ NEXT_PUBLIC_SITE_URL: 'https://example.org/tvmjs/' });
    expect(absoluteUrl('/roadmap.html')).toBe('https://example.org/tvmjs/roadmap.html');
  });

  it('adds the missing separator for a path given without one', async () => {
    const { absoluteUrl } = await loadConfig({ NEXT_PUBLIC_SITE_URL: 'https://example.org' });
    expect(absoluteUrl('roadmap.html')).toBe('https://example.org/roadmap.html');
  });

  it('does not double-apply the base path — SITE_URL already carries it', async () => {
    const { absoluteUrl } = await loadConfig({
      NEXT_PUBLIC_SITE_URL: 'https://example.org/tvmjs',
      NEXT_PUBLIC_BASE_PATH: '/tvmjs',
    });
    expect(absoluteUrl('/roadmap.html')).toBe('https://example.org/tvmjs/roadmap.html');
  });
});

describe('GA_ID', () => {
  it('is empty by default, so a fork ships no analytics', async () => {
    const { GA_ID } = await loadConfig();
    expect(GA_ID).toBe('');
  });
});

describe('NAV_LIST', () => {
  it('sends every entry somewhere', async () => {
    const { NAV_LIST, isNavGroup } = await loadConfig();
    for (const entry of NAV_LIST) {
      if (isNavGroup(entry)) {
        expect(entry.children.length).toBeGreaterThan(0);
        for (const child of entry.children) expect(child.path).toMatch(/^\//);
      } else {
        expect(entry.path).toMatch(/^\//);
        expect(entry.title).not.toBe('');
      }
    }
  });

  it('marks the docs entry external — it is a separate VitePress build, not a Next route', async () => {
    const { NAV_LIST, isNavGroup } = await loadConfig();
    const docs = NAV_LIST.find((entry) => !isNavGroup(entry) && entry.path === '/docs/');
    expect(docs).toBeDefined();
    expect(docs && !isNavGroup(docs) && docs.external).toBe(true);
  });
});
