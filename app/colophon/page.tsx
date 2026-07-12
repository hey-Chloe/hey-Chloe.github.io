import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'Colophon',
  description: '关于这个网站。'
};

export default function ColophonPage() {
  return (
    <PageIntro title="Colophon">
      <div className="prose mx-auto mt-16 max-w-[760px]">
        <p>Built with Next.js, TypeScript, Tailwind CSS, and Markdown.</p>
        <p>The interface is inspired by a tactile archive desk: paper textures, green tones, layered documents, and object-like navigation.</p>
        <p>Hosted on GitHub Pages. Still growing.</p>
      </div>
    </PageIntro>
  );
}
