"use client";

import { useState } from "react";
import type { Destination, ThemeKey } from "@/types/travel";
import { Button } from "@/components/ui/Button";

const FONT = "'Pretendard', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";

// 테마별 공유 카드 배경 그라데이션
const THEME_BG: Record<string, [string, string]> = {
  sea: ["#5aa0e0", "#2a6bb0"],
  mountain: ["#6fa87f", "#3f6a52"],
  town: ["#d0a878", "#a5734a"],
  default: ["#5b93f0", "#2f73f6"],
};

function variantOf(themes: ThemeKey[]): keyof typeof THEME_BG {
  const t = themes[0];
  if (t === "sea") return "sea";
  if (t === "history" || t === "local" || t === "food") return "town";
  if (t === "nature" || t === "activity") return "mountain";
  return "default";
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 이름이 폭을 넘지 않도록 폰트 크기를 줄여서 반환 */
function fitFontPx(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startPx: number,
  weight = "800",
) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${FONT}`;
  while (ctx.measureText(text).width > maxWidth && px > 28) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${FONT}`;
  }
  return px;
}

/**
 * 여행지 공개 화면의 CTA + 공유 기능.
 * - 길찾기: 카카오맵 검색 URL(placeholder)을 새 탭으로.
 * - 저장: 로컬 상태 저장 표시.
 * - 이미지 저장: Canvas로 공유 카드(PNG)를 그려 다운로드 (라이브러리 미사용).
 * - 공유: Web Share API, 미지원 시 링크 클립보드 복사.
 */
export function DestinationActions({
  destination,
}: {
  destination: Destination;
}) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  const mapUrl = `https://map.kakao.com/?q=${encodeURIComponent(
    `${destination.region} ${destination.name}`,
  )}`;

  // ===== 이미지 저장 =====
  async function handleSaveImage() {
    setSavingImage(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const W = 1080;
      const H = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 배경 그라데이션
      const [c1, c2] = THEME_BG[variantOf(destination.themes)];
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, c1);
      bg.addColorStop(1, c2);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // 상단 발광
      const glow = ctx.createRadialGradient(W * 0.7, 120, 40, W * 0.7, 120, 420);
      glow.addColorStop(0, "rgba(255,255,255,0.35)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // 흰 카드
      ctx.save();
      ctx.shadowColor = "rgba(18,48,92,0.28)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = "#ffffff";
      roundRectPath(ctx, 80, 96, W - 160, H - 192, 56);
      ctx.fill();
      ctx.restore();

      ctx.textAlign = "center";

      // "이번 여행지는"
      ctx.fillStyle = "#667085";
      ctx.font = `600 30px ${FONT}`;
      ctx.textBaseline = "alphabetic";
      ctx.fillText("이번 여행지는", W / 2, 240);

      // 이름
      const namePx = fitFontPx(ctx, destination.name, W - 300, 92);
      ctx.fillStyle = "#17345f";
      ctx.font = `800 ${namePx}px ${FONT}`;
      ctx.fillText(destination.name, W / 2, 340);

      // 태그라인
      ctx.fillStyle = "#e0a419";
      ctx.font = `700 36px ${FONT}`;
      ctx.fillText(destination.tagline, W / 2, 410);

      // 이모지 힌트
      ctx.font = `96px ${FONT}`;
      ctx.fillText(destination.emojiHints.join("   "), W / 2, 560);

      // 구분선
      ctx.strokeStyle = "#e6eef8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 640);
      ctx.lineTo(W - 200, 640);
      ctx.stroke();

      // 지역
      ctx.fillStyle = "#17345f";
      ctx.font = `600 34px ${FONT}`;
      ctx.fillText(`📍 ${destination.region}`, W / 2, 720);

      // 별점 (골드 + 리뷰수)
      const goldPart = `★ ${destination.rating.toFixed(1)}`;
      const mutedPart = `   ·   리뷰 ${destination.reviewCount.toLocaleString()}개`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `800 40px ${FONT}`;
      const w1 = ctx.measureText(goldPart).width;
      ctx.font = `500 32px ${FONT}`;
      const w2 = ctx.measureText(mutedPart).width;
      let startX = (W - (w1 + w2)) / 2;
      ctx.fillStyle = "#f0a91e";
      ctx.font = `800 40px ${FONT}`;
      ctx.fillText(goldPart, startX, 800);
      ctx.fillStyle = "#667085";
      ctx.font = `500 32px ${FONT}`;
      ctx.fillText(mutedPart, startX + w1, 800);

      // 브랜드
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = `800 36px ${FONT}`;
      ctx.fillStyle = "#2f73f6";
      ctx.fillText("🧭 Pick&Go", W / 2, 930);

      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `pickandgo-${destination.name}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }
          resolve();
        }, "image/png");
      });
    } finally {
      setSavingImage(false);
    }
  }

  // ===== URL 공유 =====
  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `Pick&Go — ${destination.name}`,
      text: `${destination.name} · ${destination.tagline}`,
      url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // 사용자가 취소 → 무시
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 클립보드 실패 시 무시 */
    }
  }

  return (
    <div className="space-y-3">
      <Button
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="accent"
        size="lg"
        className="w-full"
      >
        📍 지금 길찾기 시작하기
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
      >
        {saved ? "✅ 저장되었어요" : "🔖 이 여행 저장하기"}
      </Button>

      {/* 이미지 저장 · 공유 */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={handleSaveImage}
          disabled={savingImage}
        >
          {savingImage ? "이미지 만드는 중…" : "🖼️ 이미지 저장"}
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={handleShare}
        >
          {copied ? "✅ 링크 복사됨" : "🔗 공유하기"}
        </Button>
      </div>

      {saved && (
        <p className="text-center text-sm text-success" role="status">
          내 여행 목록에 저장했어요! (프로토타입 · 로컬 저장)
        </p>
      )}
    </div>
  );
}
