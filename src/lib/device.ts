import { headers } from "next/headers";

export type DeviceType = "mobile" | "desktop";

/** 모바일 브라우저 User-Agent 패턴 */
const MOBILE_RE =
  /Mobi|Android|iPhone|iPod|IEMobile|BlackBerry|webOS|Opera Mini|Windows Phone/i;

/**
 * 서버에서 요청의 User-Agent로 접속 기기를 판별한다.
 * (Next 15: headers()는 async → 이 함수를 호출하는 라우트는 동적 렌더링으로 전환됨)
 *
 * 주의: iPadOS 13+ 사파리는 데스크톱 UA로 보고되어 "desktop"으로 분류될 수 있다.
 * 클라이언트에서는 DeviceProvider가 뷰포트 폭으로 한 번 더 보정한다.
 */
export async function getDeviceType(): Promise<DeviceType> {
  const ua = (await headers()).get("user-agent") ?? "";
  return MOBILE_RE.test(ua) ? "mobile" : "desktop";
}
