import { ADVENTURE } from "../../lib/adventureCardTokens";

/** 약한 등고선·경로 SVG 패턴 */
export function ContourPattern({
  tone = "light",
  pathVariant = 0,
}: {
  tone?: "light" | "dark";
  pathVariant?: number;
}) {
  const stroke = tone === "dark" ? "#E8DCC4" : ADVENTURE.forest;
  const paths = [
    "M8,120 C30,90 50,100 70,70 C90,40 110,50 130,28",
    "M12,40 C40,55 60,35 90,60 C110,78 120,100 140,120",
    "M20,100 C45,60 75,80 100,45 C115,28 125,55 145,70",
  ];
  const d = paths[pathVariant % paths.length]!;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 150 200"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ opacity: tone === "dark" ? 0.07 : 0.06 }}
    >
      <ellipse cx="75" cy="100" rx="52" ry="68" fill="none" stroke={stroke} strokeWidth="1" />
      <ellipse cx="75" cy="100" rx="36" ry="48" fill="none" stroke={stroke} strokeWidth="0.8" />
      <ellipse cx="75" cy="100" rx="20" ry="28" fill="none" stroke={stroke} strokeWidth="0.7" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.1" strokeDasharray="3 4" />
    </svg>
  );
}

export function PaperNoise({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: dark ? 0.06 : 0.05,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
      aria-hidden="true"
    />
  );
}

/** 모서리 지도 좌표 표식 */
export function CornerMarks({ tone = "light" }: { tone?: "light" | "dark" }) {
  const c = ADVENTURE.brass;
  void tone;
  return (
    <>
      {[
        "left-2 top-2",
        "right-2 top-2",
        "left-2 bottom-2",
        "right-2 bottom-2",
      ].map((pos) => (
        <span
          key={pos}
          className={`pointer-events-none absolute h-2.5 w-2.5 ${pos}`}
          style={{
            borderColor: c,
            borderStyle: "solid",
            borderWidth: pos.includes("left") && pos.includes("top") ? "1.5px 0 0 1.5px"
              : pos.includes("right") && pos.includes("top") ? "1.5px 1.5px 0 0"
              : pos.includes("left") && pos.includes("bottom") ? "0 0 1.5px 1.5px"
              : "0 1.5px 1.5px 0",
            opacity: 0.55,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
