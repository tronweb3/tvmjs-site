import { CommonLayout } from '@/components/CommonLayout';
import { notFound } from 'next/navigation';
import { ANNOUNCEMENTS } from '../announcements';
import { AnnouncementDetailContent } from './AnnouncementDetailContent';
import { MarkdownBlock } from './MarkdownBlock';
import { absoluteUrl } from '@/lib/config';

export const dynamicParams = false;

export function generateStaticParams() {
  return ANNOUNCEMENTS.map((a) => ({ version: a.version }));
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const item = ANNOUNCEMENTS.find((a) => a.version === version);
  if (!item) return {};
  const canonical = absoluteUrl(`/announcement/${item.version}.html`);
  const description = `${item.title} — TVMJS release notes and announcement details.`;
  return {
    title: `${item.title} | TVMJS`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${item.title} | TVMJS`,
      description,
      url: canonical,
      siteName: 'TVMJS',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${item.title} | TVMJS`,
      description,
    },
  };
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const index = ANNOUNCEMENTS.findIndex((a) => a.version === version);
  if (index === -1) notFound();
  const item = ANNOUNCEMENTS[index];
  const newer = index > 0 ? ANNOUNCEMENTS[index - 1] : undefined;
  const older = index < ANNOUNCEMENTS.length - 1 ? ANNOUNCEMENTS[index + 1] : undefined;
  return (
    <CommonLayout pathname="/announcement.html" className="bg-announcement">
      <div className="relative mx-auto">
        <AnnouncementDetailContent version={version} newerVersion={newer?.version} olderVersion={older?.version}>
          {item.detailContent ? <MarkdownBlock source={item.detailContent} /> : undefined}
        </AnnouncementDetailContent>
      </div>
    </CommonLayout>
  );
}
