import Link from "next/link";
import { FeatureItems } from "@/components/landing/FeatureItems";
import { DeviceSwitch } from "@/components/system/DeviceProvider";

/**
 * PAGE 1 랜딩.
 * 서버에서 판별한 기기 타입에 따라 데스크톱 전용 / 모바일 전용 화면을 각각 렌더한다.
 * p1.png(3D 히어로 배경, 텍스트·버튼 없음) 위에 실제 HTML 텍스트/버튼을 오버레이한다.
 */

const TITLE_SHADOW = {
  textShadow: "0 2px 0 rgba(18,48,92,0.18), 0 10px 22px rgba(18,48,92,0.22)",
} as const;

/** 히어로 문구 (제목·부제·CTA·특징). full=모바일 전체폭 버튼 */
function HeroCopy({ full = false }: { full?: boolean }) {
  const btnBase =
    "inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl px-7 text-lg font-extrabold transition-all duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 active:translate-y-1";
  return (
    <div className="space-y-4">
      <span className="inline-block rounded-full bg-white/75 px-4 py-1.5 text-xs font-bold text-primary-dark shadow-sm backdrop-blur sm:text-sm">
        여행지를 검색하지 말고, 오늘은 뽑아보세요
      </span>

      <h1
        className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white lg:text-5xl xl:text-6xl"
        style={TITLE_SHADOW}
      >
        당신의 다음
        <br />
        <span className="text-accent">여행지</span>는?
      </h1>

      <p
        className="text-lg font-semibold leading-relaxed text-white lg:text-xl"
        style={{ textShadow: "0 2px 10px rgba(18,48,92,0.3)" }}
      >
        지금 갈 수 있는 여행지를
        <br />
        <span className="text-accent">랜덤</span>으로 뽑아드릴게요!
      </p>

      <div className={`flex flex-wrap gap-3 pt-1 ${full ? "flex-col" : ""}`}>
        <Link
          href="/conditions"
          className={`${btnBase} bg-accent text-ink shadow-[0_6px_0_#e0a92e,0_16px_26px_rgba(224,169,46,0.45)] hover:-translate-y-0.5 focus-visible:outline-accent active:shadow-[0_2px_0_#e0a92e] ${full ? "w-full" : ""}`}
        >
          여행지 뽑기
        </Link>
        <Link
          href="/conditions"
          className={`${btnBase} bg-white font-bold text-primary shadow-[0_6px_0_#dbeafe,0_12px_22px_rgba(47,115,246,0.2)] hover:-translate-y-0.5 focus-visible:outline-primary active:shadow-[0_2px_0_#dbeafe] ${full ? "w-full" : ""}`}
        >
          서비스 둘러보기
        </Link>
      </div>

      <FeatureItems className="pt-2" />
    </div>
  );
}

/** 데스크톱: 뷰포트를 꽉 채우는 히어로 (스크롤 없음) */
function LandingDesktop() {
  return (
    <section className="relative overflow-hidden h-[calc(100vh-4rem)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/p1.png"
        alt="Pick&Go 3D 일러스트 — 여행 카드 덱, 나침반, 지도, 여행 가방"
        className="absolute inset-0 h-full w-full select-none object-cover object-center"
        draggable={false}
      />
      <div className="absolute inset-0">
        <div className="mx-auto flex h-full max-w-content items-center px-4 lg:px-8">
          <div className="w-[48%] max-w-xl">
            <HeroCopy />
          </div>
        </div>
      </div>
    </section>
  );
}

/** 모바일: 이미지 위에 세로 텍스트 (전체폭 버튼 · 큰 터치 영역) */
function LandingMobile() {
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/p1.png"
        alt="Pick&Go 3D 일러스트"
        className="block w-full select-none"
        draggable={false}
      />
      <section className="bg-gradient-to-b from-[#8fc0f2] to-[#cfe6fb] px-5 py-8">
        <HeroCopy full />
      </section>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main>
      <DeviceSwitch mobile={<LandingMobile />} desktop={<LandingDesktop />} />
    </main>
  );
}
