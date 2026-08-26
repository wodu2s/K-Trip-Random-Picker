/**
 * 두 GPS 좌표 사이 직선거리(km).
 * 자동차 이동거리·소요 시간이 아니므로 travelTime/drivingDistance로 쓰지 않는다.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 화면 표시용 직선거리 문구. 값이 없으면 정보 없음. */
export function formatStraightLineKm(distanceKm: number | undefined): string {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return "정보 없음";
  if (distanceKm < 10) return `직선거리 약 ${distanceKm.toFixed(1)}km`;
  return `직선거리 약 ${Math.round(distanceKm)}km`;
}
