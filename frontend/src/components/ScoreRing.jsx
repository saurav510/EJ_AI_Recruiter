// Circular SVG score ring — renders a 0-100 score as an animated arc
const ScoreRing = ({ score, size = 100, strokeWidth = 8, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? '#06d6a0'   // emerald — good
      : score >= 50
      ? '#f59e0b'   // amber  — maybe
      : '#ef4444';  // red    — poor

  const textSize = size < 80 ? size * 0.22 : size * 0.2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`${label}: ${score} out of 100`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 6px ${color}88)`,
          }}
        />
        {/* Score text — counter-rotate so it's upright */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
            fill: color,
            fontSize: textSize,
            fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {score}
        </text>
      </svg>
      {label && (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;
