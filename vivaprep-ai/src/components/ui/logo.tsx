"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withWord?: boolean;
  showTag?: boolean;
}

const sizes = {
  sm: { mark: 22, font: 14, gap: 6 },
  md: { mark: 28, font: 17, gap: 8 },
  lg: { mark: 36, font: 22, gap: 10 },
  xl: { mark: 48, font: 28, gap: 12 },
};

export function Logo({ size = "md", withWord = true, showTag = true }: LogoProps) {
  const s = sizes[size];
  return (
    <div className="logo-wordmark" style={{ fontSize: s.font, gap: s.gap }}>
      <span
        className="logo-mark"
        style={{
          width: s.mark,
          height: s.mark,
          borderRadius: s.mark * 0.28,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={s.mark * 0.55}
          height={s.mark * 0.55}
          fill="none"
          style={{ position: "relative", zIndex: 2 }}
        >
          <path
            d="M4 4 L12 20 L20 4"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="20" r="1.6" fill="white" />
        </svg>
      </span>
      {withWord && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: s.gap }}>
          <span>VivaPrep</span>
          {showTag && <span className="ai-tag">AI</span>}
        </span>
      )}
    </div>
  );
}
