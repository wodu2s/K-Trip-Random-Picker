import { motion } from "motion/react";
import { Compass, Gem, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "../layout/PageContainer";
import { StepProgress } from "../layout/StepProgress";
import { AdventurePageShell } from "../layout/AdventurePageShell";
import { Button } from "../ui/Button";
import { DestinationMeta } from "./DestinationMeta";
import { DestinationActions } from "./DestinationActions";
import { HiddenPlaceCards } from "./HiddenPlaceCards";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { THEME_META } from "../../data/destinations";
import { useTravel } from "../../state/TravelContext";
import { getDestinationById } from "../../data/destinations";
import { fetchDestinationDetail } from "../../api/tour";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { CARD_MOTION } from "../../lib/cardMotion";

/** 탐험 결과 — 중복 제목 없이 2열 hero */
export function DestinationPage() {
  const { revealedDestinationId, restart } = useTravel();
  const [destination, setDestination] = useState(() =>
    revealedDestinationId ? getDestinationById(revealedDestinationId) : undefined,
  );

  // 공개된 여행지의 실제 개요·주변 명소를 비동기로 보강한다 (실데이터일 때만 호출됨)
  useEffect(() => {
    const base = revealedDestinationId ? getDestinationById(revealedDestinationId) : undefined;
    setDestination(base);
    if (!base) return;
    if (!base.contentId && !base.mapx) return;
    let cancelled = false;
    void fetchDestinationDetail(base).then((patch) => {
      if (cancelled || Object.keys(patch).length === 0) return;
      setDestination((prev) => (prev ? { ...prev, ...patch } : prev));
    });
    return () => {
      cancelled = true;
    };
  }, [revealedDestinationId]);

  const reduce = useReducedMotion();
  const stagger = reduce ? 0 : CARD_MOTION.revealStagger;
  const [imgError, setImgError] = useState(false);

  if (!destination) {
    return (
      <AdventurePageShell>
        <PageContainer className="text-center">
          <div className="expedition-panel mx-auto max-w-md p-10">
            <Compass className="mx-auto h-10 w-10 text-brass" strokeWidth={1.8} aria-hidden="true" />
            <h1 className="font-expedition mt-4 text-2xl font-bold text-ink">목적지를 찾을 수 없어요</h1>
            <p className="mt-2 text-muted">카드를 다시 골라 새로운 탐험지를 만나보세요.</p>
            <div className="mt-6">
              <Button onClick={restart} variant="primary" size="lg">
                카드 다시 고르기
              </Button>
            </div>
          </div>
        </PageContainer>
      </AdventurePageShell>
    );
  }

  return (
    <AdventurePageShell>
      <PageContainer className="relative mx-auto max-w-[1280px] overflow-x-hidden py-6 lg:py-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <StepProgress current={4} className="mx-auto mb-6 max-w-4xl" />
        </motion.div>

        <motion.section
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] lg:gap-8"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: stagger }}
        >
          <div className="order-2 space-y-5 lg:order-1">
            <div>
              <p className="font-expedition text-[11px] font-bold tracking-[0.16em] text-brass">
                DESTINATION FOUND
              </p>
              <p className="mt-2 text-sm font-semibold text-muted">{destination.region}</p>
              <h1 className="font-expedition mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {destination.name}
              </h1>
              <p className="mt-2 text-base font-medium leading-relaxed text-ink/90">
                {destination.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {destination.themes.map((t) => (
                <span
                  key={t}
                  className="rounded-[6px] border border-brass/35 bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary"
                >
                  {THEME_META[t].label}
                </span>
              ))}
            </div>

            <DestinationMeta destination={destination} />
            <DestinationActions destination={destination} />
          </div>

          <div className="order-1 lg:order-2">
            <motion.div
              className="relative w-full overflow-hidden rounded-[16px] border border-brass/40 shadow-[0_16px_40px_rgba(22,40,31,0.16)]"
              style={{ height: "clamp(280px, 48vh, 560px)" }}
              initial={reduce ? false : { opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 0.8, 0.2, 1] }}
            >
              {!imgError ? (
                <img
                  src={destination.image}
                  alt={`${destination.name} 대표 사진`}
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover object-center"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/20">
                  <MapPin className="h-10 w-10 text-primary" strokeWidth={1.6} />
                </div>
              )}

              {destination.isHiddenGem && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-[8px] border border-brass/30 bg-[var(--color-parchment-100)]/95 px-3 py-1.5 text-sm font-bold text-primary shadow-sm">
                  <Gem className="h-4 w-4 text-brass" strokeWidth={2.2} aria-hidden="true" /> 숨은 명소
                </span>
              )}

              <span
                className="font-expedition absolute right-4 top-4 rotate-[-10deg] rounded-sm border-2 border-brass px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-brass"
                aria-hidden="true"
              >
                ARRIVED
              </span>

              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-[8px] border border-brass/30 bg-[var(--color-parchment-100)]/95 px-3 py-1.5 text-sm font-bold text-ink shadow-sm">
                <MapPin className="h-4 w-4 text-brass" strokeWidth={2.2} aria-hidden="true" />
                {destination.region}
              </span>
            </motion.div>

            <p className="mt-3 text-sm leading-relaxed text-muted lg:px-1">{destination.story}</p>
          </div>
        </motion.section>

        <motion.div
          id="schedule-timeline"
          className="mt-10 scroll-mt-24"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: stagger * 4 }}
        >
          <p className="font-expedition text-center text-[11px] font-bold tracking-[0.16em] text-brass">
            EXPEDITION ROUTE
          </p>
          <h2 className="font-expedition mt-1 text-center text-xl font-bold text-ink">탐험 경로</h2>
          <p className="mt-1 text-center text-sm text-muted">출발부터 저녁까지, 오늘의 코스를 따라가 보세요</p>
          <div className="mx-auto mt-5 max-w-[820px]">
            <ScheduleTimeline schedule={destination.schedule} />
          </div>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: stagger * 5 }}
        >
          <HiddenPlaceCards places={destination.hiddenPlaces} />
        </motion.div>
      </PageContainer>
    </AdventurePageShell>
  );
}
