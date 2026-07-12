export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`logo-script ${small ? 'logo-script--small' : ''}`} aria-label="Chloe's archive">
      <span>Chloe&apos;s archive</span>
    </div>
  );
}
