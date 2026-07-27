"use client";

import { useState } from "react";
import type { Destination } from "@/types/travel";
import { Button } from "@/components/ui/Button";

/**
 * 여행지 공개 화면의 CTA.
 * - 길찾기: 프로토타입이므로 카카오맵 검색 URL(placeholder)을 새 탭으로 연다.
 * - 저장: 로컬 상태로만 저장 표시 (실제 백엔드 없음).
 */
export function DestinationActions({
  destination,
}: {
  destination: Destination;
}) {
  const [saved, setSaved] = useState(false);

  // 실제 지도 API 대신 카카오맵 검색 링크(placeholder)
  const mapUrl = `https://map.kakao.com/?q=${encodeURIComponent(
    `${destination.region} ${destination.name}`,
  )}`;

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

      {saved && (
        <p className="text-center text-sm text-success" role="status">
          내 여행 목록에 저장했어요! (프로토타입 · 로컬 저장)
        </p>
      )}
    </div>
  );
}
