export type EvidenceState = 'VERIFIED' | 'REPOSITORY REPORTED' | 'PROTOTYPE' | 'WIP';

export default function EvidenceBadge({ state, detail }: { state: EvidenceState; detail?: string }) {
  return (
    <span
      className={`evidence-badge evidence-badge--${state.toLowerCase().replaceAll(' ', '-')}`}
      data-state={state}
    >
      <i aria-hidden="true" />
      <span>{state}</span>
      {detail && <small>{detail}</small>}
    </span>
  );
}
