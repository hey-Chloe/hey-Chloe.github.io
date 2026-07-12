import Container from '@/components/Container';

export default function Footer() {
  return (
    <footer className="border-t border-line/80 bg-white/60">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Chloe&apos;s Blog. Keep learning, keep building.</p>
        <p>Powered by Next.js, Markdown and GitHub Pages.</p>
      </Container>
    </footer>
  );
}
