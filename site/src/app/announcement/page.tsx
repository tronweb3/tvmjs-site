import { CommonLayout } from '@/components/CommonLayout';
import { AnnouncementPageContent } from './AnnouncementPageContent';
import { absoluteUrl } from '@/lib/config';

const title = 'Announcements | TVMJS';
const description = 'Release notes and project updates for TVMJS, the TRON Virtual Machine in TypeScript.';
const canonical = absoluteUrl('/announcement.html');

export const metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: 'TVMJS',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default function AnnouncementPage() {
  return (
    <CommonLayout pathname="/announcement.html" className="bg-announcement">
      <div className="relative mx-auto">
        <AnnouncementPageContent />
      </div>
    </CommonLayout>
  );
}
