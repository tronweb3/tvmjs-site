import { describe, expect, it } from 'vitest';
import { MILESTONES, STATUS_LABEL, sortedMilestones, type MilestoneStatus } from '@/app/roadmap/milestones';
import { ANNOUNCEMENTS, getAnnouncementDetailHref } from '@/app/announcement/announcements';
import { TVMJS_VERSION } from '../../docs/.vitepress/version';

/**
 * The roadmap and the announcements are hand-maintained data files, edited once a quarter
 * by whoever ships the release. These assertions cover the mistakes that edit actually
 * makes: a duplicated quarter, a version that no longer matches the docs, a status typo.
 */

describe('milestones', () => {
  it('has entries', () => {
    expect(MILESTONES.length).toBeGreaterThan(0);
  });

  it.each(MILESTONES.map((m) => [`${m.year} ${m.quarter}`, m] as const))('%s is well formed', (_label, milestone) => {
    expect(milestone.quarter).toMatch(/^Q[1-4]$/);
    expect(milestone.year).toMatch(/^\d{4}$/);
    expect(Object.keys(STATUS_LABEL)).toContain(milestone.status);
  });

  it('does not list the same quarter twice', () => {
    const keys = MILESTONES.map((m) => `${m.year}-${m.quarter}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('sorts newest first regardless of the order entries are written in', () => {
    const sorted = sortedMilestones();
    const rank = (m: { year: string; quarter: string }) => Number(m.year) * 10 + Number(m.quarter.slice(1));
    for (let i = 1; i < sorted.length; i++) {
      expect(rank(sorted[i - 1])).toBeGreaterThan(rank(sorted[i]));
    }
  });

  it('does not mutate the source array while sorting', () => {
    const before = MILESTONES.map((m) => `${m.year}-${m.quarter}`);
    sortedMilestones();
    expect(MILESTONES.map((m) => `${m.year}-${m.quarter}`)).toEqual(before);
  });

  it('gives a released quarter something to show', () => {
    for (const milestone of MILESTONES.filter((m) => m.status === 'released')) {
      expect(milestone.items?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('labels every status', () => {
    const statuses: MilestoneStatus[] = ['released', 'in-progress', 'planned'];
    for (const status of statuses) expect(STATUS_LABEL[status]).toBeTruthy();
  });
});

describe('announcements', () => {
  it('has entries', () => {
    expect(ANNOUNCEMENTS.length).toBeGreaterThan(0);
  });

  it.each(ANNOUNCEMENTS.map((a) => [a.version, a] as const))('%s is well formed', (_version, item) => {
    expect(item.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(item.title.trim()).not.toBe('');
    expect(Number.isNaN(Date.parse(item.time))).toBe(false);
  });

  it('does not announce the same version twice — generateStaticParams would collide', () => {
    const versions = ANNOUNCEMENTS.map((a) => a.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it('is ordered newest first, which is the order the pages link through', () => {
    for (let i = 1; i < ANNOUNCEMENTS.length; i++) {
      expect(Date.parse(ANNOUNCEMENTS[i - 1].time)).toBeGreaterThanOrEqual(Date.parse(ANNOUNCEMENTS[i].time));
    }
  });

  it('announces the release the docs describe', () => {
    expect(ANNOUNCEMENTS.some((a) => a.version === TVMJS_VERSION)).toBe(true);
  });

  it('produces a route-shaped href in dev and an exported one in production', () => {
    expect(getAnnouncementDetailHref('1.1.0', true)).toBe('/announcement/1.1.0');
    expect(getAnnouncementDetailHref('1.1.0', false)).toBe('/announcement/1.1.0.html');
  });
});
