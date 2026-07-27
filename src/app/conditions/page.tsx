import { PageContainer } from "@/components/layout/PageContainer";
import { StepProgress } from "@/components/layout/StepProgress";
import { ConditionsControls } from "@/components/conditions/ConditionsControls";

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

/** PAGE 2 여행 조건 설정 — p2.png 배경(크게) 위 하얀 박스에 컨트롤을 오버레이 */
export default function ConditionsPage() {
  return (
    <main>
      {/* 진행 단계 (제목은 박스 상단으로 이동) */}
      <PageContainer className="pb-4">
        <StepProgress current={1} className="mx-auto max-w-2xl" />
      </PageContainer>

      {/* ===== 데스크톱(lg+): 크게 채운 p2.png 배경 + 하얀 박스 위 컨트롤 ===== */}
      <section className="relative mx-auto hidden w-full max-w-[1536px] px-4 pb-10 lg:block lg:px-8">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/p2.png"
            alt="여행 준비 풍경 — 창밖 여행지, 지구본, 지도, 여행 가방"
            className="block w-full select-none rounded-card"
            draggable={false}
          />

          {/* 하얀 박스 위 컨트롤 (박스 실측: left 1.9% / right 39.9% / w 38% / h 83.3%)
              → 박스 안에서 좌우 대칭(각 3.25% 여백) + 세로 중앙 정렬 */}
          <div
            className="absolute flex flex-col justify-center"
            style={{ left: "5.2%", top: "12%", width: "31.5%", height: "82%" }}
          >
            <ConditionsControls />
          </div>

          {/* 하단 TIP 바 (실측: left 38.2% / top 87.1% / w 59.8% / h 9.2%) */}
          <div
            className="absolute flex items-center pl-[3%]"
            style={{ left: "38.2%", top: "87.1%", width: "59.8%", height: "9.2%" }}
          >
            <TipBar />
          </div>
        </div>
      </section>

      {/* ===== 모바일/태블릿(<lg): 세로 스택 ===== */}
      <PageContainer className="lg:hidden">
        <div className="surface-card rounded-card p-5 sm:p-6">
          <ConditionsControls />
        </div>
        <TipBar className="surface-card mt-4 rounded-2xl px-4 py-3" />
      </PageContainer>
    </main>
  );
}
