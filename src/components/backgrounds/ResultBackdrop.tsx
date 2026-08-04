import { SunsetGlow } from "./SunsetGlow";

/**
 * PAGE 5 결과 배경 — 연한 블루 하늘을 유지하고, 수평선 근처에만 따뜻한 노을빛을 남긴다.
 * 일몰 글로는 결과 카드와 겹치지 않도록 우측으로 치우쳐 배치하고,
 * 실제 관광지 사진·정보가 중심이 되도록 배경은 보조 역할만 한다.
 */
export function ResultBackdrop() {
  return (
    <div className="scene-backdrop">
      <div className="absolute inset-0 bg-gradient-to-b from-[#E4F0FD] via-[#F4F8FE] to-[#F7FBFF]" />

      {/* 수평선 근처의 옅은 노을 밴드 */}
      <div
        className="absolute inset-x-0 bottom-[18%] h-[34%]"
        style={{ background: "linear-gradient(to bottom, rgba(255,226,180,0) 0%, rgba(255,220,168,0.32) 60%, rgba(255,214,158,0.1) 100%)" }}
        aria-hidden="true"
      />

      <SunsetGlow
        className="right-[8%] top-[38%] h-44 w-44"
        style={{ background: "radial-gradient(circle, rgba(255,200,87,0.3), transparent 70%)" }}
      />

      <svg className="absolute inset-x-0 bottom-0 h-[24%] w-full" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,42 Q100,18 200,36 T400,26 V100 H0 Z" fill="#BBD9F5" opacity="0.5" />
        <path d="M0,60 Q120,40 240,57 T400,50 V100 H0 Z" fill="#9AC3EA" opacity="0.4" />
        <ellipse cx="70" cy="80" rx="44" ry="8" fill="#7FAEDC" opacity="0.32" />
        <rect x="330" y="54" width="5" height="24" fill="#6E8FB8" opacity="0.4" />
        <polygon points="327,54 338,54 332.5,46" fill="#C98A6A" opacity="0.38" />
        <g fill="#6E8FB8" opacity="0.3">
          <path d="M250,86 q9,-14 18,0 Z" />
          <path d="M270,90 q11,-18 22,0 Z" />
        </g>
      </svg>
    </div>
  );
}
