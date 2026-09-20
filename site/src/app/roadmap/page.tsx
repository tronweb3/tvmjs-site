import { CommonLayout } from '@/components/CommonLayout';
import { RoadmapPageContent } from './RoadmapPageContent';
import { absoluteUrl } from '@/lib/config';

const title = 'Roadmap | TVMJS';
const description = 'Quarterly milestones for TVMJS, the TRON Virtual Machine implemented in TypeScript.';
const canonical = absoluteUrl('/roadmap.html');

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

export default function RoadmapPage() {
  return (
    <CommonLayout pathname="/roadmap.html" className="bg-announcement">
      <div className="relative mx-auto">
        <RoadmapPageContent />
      </div>
    </CommonLayout>
  );
}
