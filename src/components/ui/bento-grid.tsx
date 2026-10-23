import React from "react";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BentoGrid({ children, className, style }: BentoGridProps) {
  return (
    <div
      className={cn("bento-grid", className)}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  background?: React.ReactNode;
  onClick?: () => void;
  color?: string;
  tag?: string;
  style?: React.CSSProperties;
}

export function BentoCard({
  name,
  description,
  icon,
  className,
  background,
  onClick,
  color = "#58e5ee",
  tag,
  style,
}: BentoCardProps) {
  return (
    <div
      className={cn("bento-card", className)}
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        border: "1px solid var(--line)",
        background: "rgba(14, 29, 37, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        padding: "24px",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = color;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${color}22, 0 8px 32px rgba(0,0,0,0.4)`;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {background && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.06,
            overflow: "hidden",
          }}
        >
          {background}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {icon && (
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1,
              marginBottom: "10px",
              color: color,
            }}
          >
            {icon}
          </div>
        )}
        {tag && (
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: "4px",
              background: `${color}20`,
              border: `1px solid ${color}44`,
              color: color,
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {tag}
          </span>
        )}
        <h3
          style={{
            margin: "0 0 6px 0",
            fontSize: "15px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {name}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "var(--dim)",
            lineHeight: 1.65,
          }}
        >
          {description}
        </p>
        <div
          style={{
            marginTop: "14px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: color,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Inspect →
        </div>
      </div>
    </div>
  );
}
