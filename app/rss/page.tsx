import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'RSS',
  description: 'RSS placeholder.'
};

export default function RssPage() {
  return (
    <PageIntro title="RSS">
      <p className="mx-auto mt-16 max-w-[720px] font-mono text-xl leading-8">
        RSS feed can be added later. This page is reserved for future subscription support.
      </p>
    </PageIntro>
  );
}
