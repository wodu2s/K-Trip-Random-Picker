/** 출발 기준점 — 서울시청 (랜덤 국내여행 "서울 출발" 기준 소요시간) */
const ORIGIN = { x: 126.9779, y: 37.5665 };

/** 초 → "약 N시간 M분" */
function formatDuration(sec: number): string {
  const totalMin = Math.round(sec / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h && m) return `약 ${h}시간 ${m}분`;
  if (h) return `약 ${h}시간`;
  return `약 ${m}분`;
}

/**
 * Kakao Mobility 길찾기로 서울 출발 자동차 소요시간을 구한다.
 * 실패 시(키·상품 미활성 등) undefined 반환 → 호출부는 mock 시간을 유지.
 */
export async function fetchTravelTime(destMapx: number, destMapy: number): Promise<string | undefined> {
  try {
    const qs = new URLSearchParams({
      origin: `${ORIGIN.x},${ORIGIN.y}`,
      destination: `${destMapx},${destMapy}`,
    });
    const res = await fetch(`/api/kakao-navi?${qs.toString()}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    const duration = json?.routes?.[0]?.summary?.duration;
    if (typeof duration !== "number" || json?.routes?.[0]?.result_code !== 0) return undefined;
    return formatDuration(duration);
  } catch {
    return undefined;
  }
}
