"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { DeviceType } from "@/lib/device";

const DeviceContext = createContext<DeviceType>("desktop");

/**
 * 서버에서 판별한 기기 타입(initial)을 앱 전역에 공급한다.
 * - 첫 렌더(SSR·하이드레이션)는 서버 UA 값 그대로 → 실제 기기는 깜빡임 없음.
 * - 마운트 후 뷰포트 폭으로 한 번 보정 → 데스크톱 좁은 창/화면 회전/태블릿도 대응.
 */
export function DeviceProvider({
  initial,
  children,
}: {
  initial: DeviceType;
  children: React.ReactNode;
}) {
  const [device, setDevice] = useState<DeviceType>(initial);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setDevice(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>
  );
}

/** 현재 기기 타입("mobile" | "desktop")을 읽는다. */
export function useDevice(): DeviceType {
  return useContext(DeviceContext);
}

/**
 * 기기 타입에 따라 둘 중 하나의 서브트리만 렌더한다.
 * 서버 컴포넌트 페이지에서 PC/모바일 전용 UI를 분기할 때 사용.
 *   <DeviceSwitch mobile={<Mobile/>} desktop={<Desktop/>} />
 */
export function DeviceSwitch({
  mobile,
  desktop,
}: {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
}) {
  return <>{useDevice() === "mobile" ? mobile : desktop}</>;
}
