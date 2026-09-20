import { CommonLayout } from '@/components/CommonLayout';
import { HomePageContent } from './HomePageContent';

export default function HomePage() {
  return (
    <CommonLayout pathname="/" className="bg-home">
      <HomePageContent />
    </CommonLayout>
  );
}
