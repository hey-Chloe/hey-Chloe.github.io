export default function XiaoyueMark({ label = false }: { label?: boolean }) {
  return (
    <span className="xiaoyue-mark-wrap">
      <svg className="xiaoyue-mark" viewBox="0 0 48 48" aria-hidden="true">
        <g className="xiaoyue-mark__petals">
          {Array.from({ length: 6 }, (_, index) => (
            <ellipse
              className="xiaoyue-mark__petal"
              key={index}
              cx="24"
              cy="10.5"
              rx="5.2"
              ry="9"
              transform={`rotate(${index * 60} 24 24)`}
            />
          ))}
        </g>
        <circle className="xiaoyue-mark__center" cx="24" cy="24" r="4.6" />
      </svg>
      {label && <span className="xiaoyue-mark-label">XIAOYUE INDEX</span>}
    </span>
  );
}
