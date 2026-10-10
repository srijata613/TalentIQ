"use client";

import { getScoreColor } from "./score-ring";

interface ScoreBarProps {
  label: string;
  score: number;
  matched?: string[];
  missing?: string[];
  evidence?: string[];
  collapsible?: boolean;
}

export default function ScoreBar({
  label,
  score,
  matched = [],
  missing = [],
  evidence = [],
}: ScoreBarProps) {
  const color = getScoreColor(score);
  const clamped = Math.max(0, Math.min(score, 100));

  return (
    <div className="glass-sm" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
          {label}
        </span>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>
          {Math.round(clamped)}
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      {(matched.length > 0 || missing.length > 0 || evidence.length > 0) && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {matched.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {matched.slice(0, 6).map((s) => (
                <span key={s} className="skill-tag skill-tag-matched">{s}</span>
              ))}
              {matched.length > 6 && (
                <span className="skill-tag skill-tag-neutral">+{matched.length - 6} more</span>
              )}
            </div>
          )}
          {missing.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {missing.slice(0, 4).map((s) => (
                <span key={s} className="skill-tag skill-tag-missing">{s}</span>
              ))}
              {missing.length > 4 && (
                <span className="skill-tag skill-tag-neutral">+{missing.length - 4} missing</span>
              )}
            </div>
          )}
          {evidence.slice(0, 2).map((e, i) => (
            <p key={i} style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              {e}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
