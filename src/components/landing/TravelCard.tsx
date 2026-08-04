import { ExpeditionCardArt } from "../cards/ExpeditionCardArt";

/**
 * Landing card face — reuses existing ExpeditionCardArt design
 * (asset image + CSS/SVG fallback).
 */
export function TravelCard({
  featured = false,
}: {
  index?: number;
  featured?: boolean;
  hovered?: boolean;
}) {
  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: "2 / 3",
        borderRadius: "var(--radius-card)",
        boxShadow: featured
          ? "0 40px 70px rgba(0,0,0,0.55), 0 12px 22px rgba(0,0,0,0.45), 0 0 0 1.5px rgba(213,168,79,0.35)"
          : "0 24px 44px rgba(0,0,0,0.45)",
      }}
    >
      <ExpeditionCardArt featured={featured} showHints={featured} />
    </div>
  );
}
