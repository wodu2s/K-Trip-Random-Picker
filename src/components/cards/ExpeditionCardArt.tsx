import { LANDING_ASSET_CONFIG } from "../landing/landingAssets";
import { useLandingAsset } from "../landing/useLandingAsset";

/**
 * Classic Expedition 카드 페이스 — 랜딩 덱·셔플 뒷면 공통.
 * 이미지 로드 실패 시 CSS/SVG 폴백.
 */
export function ExpeditionCardArt({
  className = "",
  featured = true,
  showHints = false,
  serial,
}: {
  className?: string;
  featured?: boolean;
  /** Landing hero — emoji signal row when image asset is unavailable */
  showHints?: boolean;
  /** Optional face number for fallback art (001–005). Image asset unchanged. */
  serial?: number;
}) {
  const asset = useLandingAsset(LANDING_ASSET_CONFIG.cardBack.src);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        borderRadius: "var(--radius-card)",
        background:
          "linear-gradient(165deg, #1B3022 0%, var(--color-forest-900) 48%, #122018 100%)",
        boxShadow: featured
          ? "0 18px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,162,39,0.35)"
          : "0 10px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      {asset.ready ? (
        <img
          src={LANDING_ASSET_CONFIG.cardBack.src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          onError={asset.fail}
        />
      ) : (
        <ExpeditionCardArtFallback
          featured={featured}
          showHints={showHints}
          serial={serial}
        />
      )}
    </div>
  );
}

function ExpeditionCardArtFallback({
  featured,
  showHints = false,
  serial,
}: {
  featured: boolean;
  showHints?: boolean;
  serial?: number;
}) {
  const gold = "#D4AF37";
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: "inset 0 0 0 1.5px var(--color-brass-500)" }}
      />
      <div
        className="pointer-events-none absolute inset-[7px] rounded-[7px]"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-brass-line)" }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 200 300"
        fill="none"
        style={{ opacity: featured ? 0.22 : 0.14 }}
        aria-hidden="true"
      >
        <path
          d="M10 70 C50 45 90 95 130 60 C160 35 185 80 205 55"
          stroke="#C9A227"
          strokeWidth="0.7"
        />
        <path
          d="M-5 110 C45 85 85 135 135 100 C165 75 190 125 210 95"
          stroke="#C9A227"
          strokeWidth="0.65"
        />
        <path
          d="M5 160 C55 130 95 185 150 150 C175 130 195 175 210 155"
          stroke="#D8B84A"
          strokeWidth="0.6"
        />
        <path
          d="M0 210 C60 175 105 235 160 200 C185 180 200 230 215 205"
          stroke="#C9A227"
          strokeWidth="0.65"
        />
        <ellipse cx="100" cy="145" rx="58" ry="42" stroke="#C9A227" strokeWidth="0.45" opacity="0.5" />
        {/* Corner L-brackets */}
        <path d="M14 40 V18 H36" stroke={gold} strokeWidth="2.2" strokeLinecap="square" />
        <circle cx="18" cy="22" r="1.4" fill={gold} />
        <circle cx="22" cy="18" r="1.4" fill={gold} />
        <path d="M186 40 V18 H164" stroke={gold} strokeWidth="2.2" strokeLinecap="square" />
        <circle cx="182" cy="22" r="1.4" fill={gold} />
        <circle cx="178" cy="18" r="1.4" fill={gold} />
        <path d="M14 260 V282 H36" stroke={gold} strokeWidth="2.2" strokeLinecap="square" />
        <circle cx="18" cy="278" r="1.4" fill={gold} />
        <circle cx="22" cy="282" r="1.4" fill={gold} />
        <path d="M186 260 V282 H164" stroke={gold} strokeWidth="2.2" strokeLinecap="square" />
        <circle cx="182" cy="278" r="1.4" fill={gold} />
        <circle cx="178" cy="282" r="1.4" fill={gold} />
      </svg>
      <div className="relative z-[1] flex h-full flex-col items-center px-3 pt-[16px] pb-[14px] text-center">
        <div className="flex w-full items-start justify-between px-1">
          <p
            className="font-landing-display tracking-[0.12em]"
            style={{
              fontSize: featured ? 14 : 11,
              fontWeight: 600,
              color: "var(--color-brass-400)",
            }}
          >
            Pick&Go
          </p>
          {serial != null ? (
            <p
              className="font-landing-display text-[10px] font-bold tracking-[0.14em]"
              style={{ color: "rgba(232,200,106,0.85)" }}
            >
              NO. {String(serial).padStart(3, "0")}
            </p>
          ) : featured ? (
            <p
              className="font-landing-display text-[10px] font-bold tracking-[0.14em]"
              style={{ color: "rgba(232,200,106,0.85)" }}
            >
              NO. 005
            </p>
          ) : null}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <svg
            width={featured ? 128 : 72}
            height={featured ? 128 : 72}
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="60" cy="60" r="52" stroke={gold} strokeWidth="1.8" />
            <circle
              cx="60"
              cy="60"
              r="44"
              stroke="#C9A227"
              strokeWidth="0.8"
              strokeDasharray="2 3"
            />
            <path d="M60 14 L66 60 L60 64 L54 60 Z" fill={gold} />
            <path d="M60 106 L66 60 L60 56 L54 60 Z" fill="#A8841C" />
            <path d="M14 60 L60 54 L64 60 L60 66 Z" fill="#D8B84A" />
            <path d="M106 60 L60 54 L56 60 L60 66 Z" fill="#A8841C" />
            <circle cx="60" cy="60" r="6" fill={gold} />
            <text
              x="60"
              y="28"
              textAnchor="middle"
              fill={gold}
              fontSize="10"
              fontFamily="serif"
            >
              N
            </text>
          </svg>
        </div>
        <p
          className="font-landing-display tracking-[0.22em]"
          style={{
            fontSize: featured ? 12 : 9,
            fontWeight: 700,
            color: "var(--color-brass-400)",
          }}
        >
          EXPEDITION
        </p>
        {showHints && featured ? (
          <div className="mt-2.5 flex items-center justify-center gap-2">
            {["🌲", "🎧", "🚶"].map((emoji) => (
              <span
                key={emoji}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[12px]"
                style={{
                  background: "rgba(245,240,225,0.1)",
                  border: "1px solid rgba(212,168,74,0.4)",
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
