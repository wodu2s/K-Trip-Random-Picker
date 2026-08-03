import { PageContainer } from "@/components/layout/PageContainer";
import { StepProgress } from "@/components/layout/StepProgress";
import { ConditionsControls } from "@/components/conditions/ConditionsControls";
import { DeviceSwitch } from "@/components/system/DeviceProvider";

function TipBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-lg" aria-hidden="true">💡</span>
      <p className="text-sm font-semibold text-ink">
        <span className="text-primary">TIP</span>
        <span className="mx-2 text-line">|</span>
        설정할수록 더 잘 맞는 여행지를 추천받을 수 있어요!
      </p>
    </div>
  );
}

/** 데스크톱: 크게 채운 p2.png 배경 + 하얀 박스 위 컨트롤 오버레이 */
function ConditionsDesktop() {
  return (
    <section className="relative mx-auto w-full max-w-[1536px] px-4 pb-10 lg:px-8">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/p2.png"
          alt="여행 준비 풍경 — 창밖 여행지, 지구본, 지도, 여행 가방"
          className="block w-full select-none rounded-card"
          draggable={false}
        />

        {/* 하얀 박스 위 컨트롤 (박스 안 좌우 대칭 + 세로 중앙) */}
        <div
          className="absolute flex flex-col justify-center"
          style={{ left: "5.2%", top: "12%", width: "31.5%", height: "82%" }}
        >
          <ConditionsControls />
        </div>

        {/* 하단 TIP 바 (실측 좌표) */}
        <div
          className="absolute flex items-center pl-[3%]"
          style={{ left: "38.2%", top: "87.1%", width: "59.8%", height: "9.2%" }}
        >
          <TipBar />
        </div>
      </div>
    </section>
  );
}

/** 모바일: 세로 스택 (실제 흰 카드로 감싼 컨트롤 + TIP) */
function ConditionsMobile() {
  return (
    <PageContainer className="pt-0">
      <div className="surface-card rounded-card p-5 sm:p-6">
        <ConditionsControls />
      </div>
      <TipBar className="surface-card mt-4 rounded-2xl px-4 py-3" />
    </PageContainer>
  );
}

/** PAGE 2 여행 조건 설정 — 서버 기기 판별로 PC/모바일 전용 화면을 분기 */
export default function ConditionsPage() {
  return (
    <main>
      {/* 진행 단계 (제목은 컨트롤 상단으로 이동) */}
      <PageContainer className="pb-4">
        <StepProgress current={1} className="mx-auto max-w-2xl" />
      </PageContainer>

      <DeviceSwitch
        mobile={<ConditionsMobile />}
        desktop={<ConditionsDesktop />}
      />
    </main>
  );
}
