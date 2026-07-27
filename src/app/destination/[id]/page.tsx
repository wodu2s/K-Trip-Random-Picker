import { PageContainer } from "@/components/layout/PageContainer";
import { StepProgress } from "@/components/layout/StepProgress";
import { Button } from "@/components/ui/Button";
import { DestinationHero } from "@/components/destination/DestinationHero";
import { DestinationMeta } from "@/components/destination/DestinationMeta";
import { DestinationActions } from "@/components/destination/DestinationActions";
import { HiddenPlaceCards } from "@/components/destination/HiddenPlaceCards";
import { DESTINATIONS, THEME_META } from "@/data/destinations";

/** PAGE 5 여행지 공개 — URL id로 샘플 데이터를 조회(selectedCardId 불필요) */
export default async function DestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const destination = DESTINATIONS.find((d) => d.id === id);

  // 잘못된 접근: 404 대신 카드 선택으로 안내
  if (!destination) {
    return (
      <PageContainer className="text-center">
        <div className="surface-card mx-auto max-w-md rounded-card p-10">
          <div className="text-4xl">🧭</div>
          <h1 className="mt-4 text-2xl font-extrabold text-ink">
            여행지를 찾을 수 없어요
          </h1>
          <p className="mt-2 text-muted">
            카드를 다시 골라 새로운 여행지를 만나보세요.
          </p>
          <div className="mt-6">
            <Button href="/cards" variant="primary" size="lg">
              카드 다시 고르기
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="mx-auto max-w-3xl">
      <StepProgress current={4} className="mx-auto mb-8 max-w-2xl" />

      {/* 결정 축하 pill */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary-dark">
          🎉 여행지가 결정되었어요!
        </span>
      </div>

      {/* Hero (장소명 + 대형 이미지 + 힌트 + 배지) */}
      <DestinationHero destination={destination} />

      {/* 감성 한 줄 + 소개 */}
      <blockquote className="surface-card mt-6 rounded-card px-6 py-5 text-center">
        <p className="text-lg font-extrabold text-ink">
          <span className="text-primary">“</span>
          {destination.shortDescription}
          <span className="text-primary">”</span>
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {destination.story}
        </p>
      </blockquote>

      {/* 테마 태그 */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {destination.themes.map((t) => (
          <span
            key={t}
            className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary"
          >
            {THEME_META[t].emoji} {THEME_META[t].label}
          </span>
        ))}
      </div>

      {/* 메타 지수 카드 */}
      <div className="mt-6">
        <DestinationMeta destination={destination} />
      </div>

      {/* CTA (길찾기 / 저장) */}
      <div className="mt-8">
        <DestinationActions destination={destination} />
      </div>

      {/* 숨겨진 장소 추천 (가로 스크롤) */}
      <div className="mt-10">
        <HiddenPlaceCards places={destination.hiddenPlaces} />
      </div>
    </PageContainer>
  );
}

/** 샘플 데이터 기준 정적 경로 생성 */
export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ id: d.id }));
}
