import type { Destination } from "../types/travel";

/**
 * TourAPI에서 받아온 여행지를 담는 런타임 저장소.
 * 기존 코드의 동기 조회(getDestinationById / recommendCards)를 그대로 유지하기 위해
 * 모듈 레벨 Map으로 캐싱한다. 비어 있으면 앱은 mock 데이터로 폴백한다.
 */
const runtime = new Map<string, Destination>();

export function registerDestinations(list: Destination[]): void {
  for (const d of list) runtime.set(d.id, d);
}

/** 상세정보 보강 등으로 이미 등록된 여행지를 갱신 */
export function updateDestination(id: string, patch: Partial<Destination>): Destination | undefined {
  const prev = runtime.get(id);
  if (!prev) return undefined;
  const next = { ...prev, ...patch };
  runtime.set(id, next);
  return next;
}

export function getRuntimeDestination(id: string): Destination | undefined {
  return runtime.get(id);
}

export function getRuntimePool(): Destination[] {
  return [...runtime.values()];
}

export function hasRuntimePool(): boolean {
  return runtime.size > 0;
}
