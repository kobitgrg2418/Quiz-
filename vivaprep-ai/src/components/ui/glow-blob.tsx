"use client";

interface GlowBlobProps {
  color?: string;
  size?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  animate?: boolean;
}

export function GlowBlob({
  color = "rgba(124,58,237,0.4)",
  size = 400,
  top,
  left,
  right,
  bottom,
  animate = true,
}: GlowBlobProps) {
  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        zIndex: 0,
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: `radial-gradient(circle, ${color}, transparent 60%)`,
        filter: "blur(40px)",
        animation: animate ? "float 8s ease-in-out infinite" : "none",
      }}
    />
  );
}
