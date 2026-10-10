"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 65) return "#FF6129";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  return "D";
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(score, 100));
  const offset = circumference - (clamped / 100) * circumference;
  const color = getScoreColor(clamped);
  const grade = getScoreGrade(clamped);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="score-ring-container">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.25,1,0.5,1)" }}
        />
        {/* Center text — counter-rotate */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            fill: color,
            fontSize: size > 100 ? "1.75rem" : "1.1rem",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {Math.round(clamped)}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            fill: "rgba(255,255,255,0.4)",
            fontSize: "0.65rem",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.08em",
          }}
        >
          GRADE {grade}
        </text>
      </svg>
      {label && (
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
      {sublabel && (
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}

export { getScoreColor, getScoreGrade };
