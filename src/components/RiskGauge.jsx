// Semicircle gauge showing the 0-100 scam score.
const COLORS = { low: "#1f9d55", medium: "#e08a00", high: "#d63031" };

export default function RiskGauge({ score, risk }) {
  const radius = 80;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - score / 100);
  const color = COLORS[risk] || "#888";

  return (
    <div className="gauge" role="img" aria-label={`Risk score ${score} out of 100, ${risk} risk`}>
      <svg viewBox="0 0 200 115" width="100%">
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--track)" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="100" y="88" textAnchor="middle" className="gauge-score" fill={color}>
          {score}
        </text>
        <text x="100" y="108" textAnchor="middle" className="gauge-label">
          {risk.toUpperCase()} RISK
        </text>
      </svg>
    </div>
  );
}
