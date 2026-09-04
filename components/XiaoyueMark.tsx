export default function XiaoyueMark({
  label = false,
  variant = 'bloom'
}: {
  label?: boolean;
  variant?: 'bloom' | 'seal';
}) {
  return (
    <span className={`xiaoyue-mark-wrap xiaoyue-mark-wrap--${variant}`}>
      <svg className={`xiaoyue-mark xiaoyue-mark--${variant}`} viewBox="0 0 48 48" aria-hidden="true">
        {variant === 'seal' ? (
          <>
            <g className="xiaoyue-mark__registration">
              <path className="xiaoyue-mark__ring" d="M8.2 15.1A18.2 18.2 0 0 1 31.8 6.8" />
              <path className="xiaoyue-mark__ring" d="M39.8 15.8A18.2 18.2 0 0 1 33.1 39" />
              <path className="xiaoyue-mark__ring" d="M26.3 42A18.2 18.2 0 0 1 6.5 28.7" />
            </g>
            <g className="xiaoyue-mark__petals">
              <path className="xiaoyue-mark__petal xiaoyue-mark__petal--nw" d="M21.9 21.8C15.8 21.3 9.8 17.1 8.1 9.1C16.1 9.7 21.1 14.4 23.2 20.7Z" />
              <path className="xiaoyue-mark__petal xiaoyue-mark__petal--ne" d="M26 21.8C27.2 14.7 32.1 9.4 39.6 8.3C39.1 16.1 34.6 21.3 27.2 23.2Z" />
              <path className="xiaoyue-mark__petal xiaoyue-mark__petal--se" d="M26.2 26.1C33.7 26.7 38.7 31.6 39.9 39.5C32.2 39.1 26.9 34.8 24.8 27.3Z" />
              <path className="xiaoyue-mark__petal xiaoyue-mark__petal--sw" d="M21.7 26C20.7 33 15.8 38.3 8.5 39.5C8.8 31.8 13.1 26.7 20.7 24.8Z" />
            </g>
            <g className="xiaoyue-mark__veins">
              <path d="M22.1 22L13 13.4" />
              <path d="M26 22L35.5 12.8" />
              <path d="M26.1 26L35.7 35.6" />
              <path d="M21.8 26L12.8 35.4" />
            </g>
            <circle className="xiaoyue-mark__center" cx="24" cy="24" r="4.25" />
            <circle className="xiaoyue-mark__seed" cx="22.75" cy="22.65" r="1.1" />
          </>
        ) : (
          <>
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
          </>
        )}
      </svg>
      {label && <span className="xiaoyue-mark-label">XIAOYUE INDEX</span>}
    </span>
  );
}
