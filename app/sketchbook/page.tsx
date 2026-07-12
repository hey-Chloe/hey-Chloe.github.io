import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'Sketchbook',
  description: '草图、截图和想法碎片。'
};

const images = [
  '/images/sketch-1.svg',
  '/images/sketch-2.svg',
  '/images/sketch-3.svg',
  '/images/sketch-4.svg'
];

export default function SketchbookPage() {
  return (
    <PageIntro title="Sketchbook">
      <section className="mt-16 grid gap-5 md:grid-cols-2">
        {images.map((src, index) => (
          <article key={src} className="overflow-hidden border border-white/20 bg-black/35">
            <img src={src} alt="" className="h-[340px] w-full object-cover" />
            <p className="green-caption m-4">Sketch {index + 1}</p>
          </article>
        ))}
      </section>
    </PageIntro>
  );
}
