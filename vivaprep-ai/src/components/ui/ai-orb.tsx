"use client";

interface AIOrbProps {
  size?: number;
  animate?: boolean;
}

export function AIOrb({ size = 36, animate = true }: AIOrbProps) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--grad)",
        boxShadow: "0 0 30px rgba(124,58,237,0.6), inset 0 0 20px rgba(255,255,255,0.2)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "15%",
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 50%)",
        }}
      />
      {animate && (
        <div
          style={{
            position: "absolute",
            inset: -size * 0.3,
            borderRadius: "50%",
            background: "var(--grad)",
            filter: `blur(${size * 0.4}px)`,
            opacity: 0.45,
            zIndex: -1,
            animation: "ai-think 2.6s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}
