import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';

export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <ChloesArchiveWordmark
      as="div"
      className={`logo-script ${small ? 'logo-script--small' : ''}`}
    />
  );
}
