import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Compass, MapPin } from "lucide-react";
import { Button } from "../ui/Button";
import { DestinationMeta } from "./DestinationMeta";
import { DestinationActions, kakaoMapUrl } from "./DestinationActions";
import { PlaceList } from "./NearbyWaypoints";
import { NearbyStays } from "./NearbyStays";
import { DestinationMap } from "./DestinationMap";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { getDestinationById } from "../../data/destinations";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { buildFallbackHints } from "../../lib/icons";
import { fetchNearbyPlaces, type NearbyPlace, type StayPlace } from "../../lib/api";
import type { CardHintType, Destination } from "../../types/travel";
import "./destination-page.css";

const HINT_LABEL: Record<CardHintType, string> = {
  atmosphere: "분위기",
  place: "장소",
  experience: "경험",
};

type Nearby = {
  spots: NearbyPlace[];
  foods: NearbyPlace[];
  cafes: NearbyPlace[];
  stays: StayPlace[];
};
const EMPTY_NEARBY: Nearby = { spots: [], foods: [], cafes: [], stays: [] };

/** 이미 있는 소개문만 1~2줄로 줄인다. 새 특징은 만들지 않는다. */
function leadText(text: string): string {
  const plain = text
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const first = plain.split(/(?<=[.!?])\s/)[0] ?? plain;
  if (first.length <= 72) return first;
  const cut = first.slice(0, 72);
  const space = cut.lastIndexOf(" ");
  return `${space > 32 ? cut.slice(0, space) : cut}…`;
}

function pickThumb(p: NearbyPlace): string {
  return (p.image || p.thumbnailUrl || p.thumbnail || "").trim();
}

function withThumb(p: NearbyPlace): NearbyPlace {
  const image = pickThumb(p);
  return image && image !== p.image ? { ...p, image } : p;
}

/** 주변 장소는 지도·리스트·숙소가 같이 쓰므로 페이지에서 한 번만 가져온다 */
function useNearby(
  lat?: number | null,
  lng?: number | null,
  withStays = false,
  region = "",
): Nearby {
  const [nearby, setNearby] = useState<Nearby>(EMPTY_NEARBY);

  useEffect(() => {
    if (!lat || !lng) return;
    let alive = true;
    fetchNearbyPlaces(lat, lng, withStays, region)
      .then((data) => {
        if (!alive) return;
        setNearby({
          spots: (data.spots ?? []).map(withThumb),
          foods: (data.foods ?? []).map(withThumb),
          cafes: (data.cafes ?? []).map(withThumb),
          stays: data.stays ?? [],
        });
      })
      .catch(() => {
        /* 주변 장소·숙소는 실패해도 나머지 정보는 그대로 노출 */
      });
    return () => {
      alive = false;
    };
  }, [lat, lng, withStays, region]);

  return nearby;
}

function DestinationHeroPhoto({ destination }: { destination: Destination }) {
  const reduce = useReducedMotion();
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(destination.image) && !imgError;

  return (
    <motion.figure
      className="dossier-photo"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 0.8, 0.2, 1] }}
    >
      {showImage ? (
        <img
          src={destination.image}
          alt={`${destination.name} 대표 사진`}
          width={1280}
          height={800}
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="dossier-photo__fallback">
          <MapPin className="h-10 w-10 text-brass" strokeWidth={1.6} aria-hidden="true" />
        </div>
      )}
      {showImage && destination.imageCredit?.sitename ? (
        <figcaption className="dossier-photo__credit">
          <a href={destination.imageCredit.docUrl} target="_blank" rel="noreferrer">
            사진 {destination.imageCredit.sitename}
          </a>
        </figcaption>
      ) : null}
    </motion.figure>
  );
}

/** 탐험 결과 — 배경 원화 위 hero + ivory 시트(지도 · 가볼 곳 · 맛집/카페 · 코스 · 숙소) */
export function DestinationPage() {
  const { revealedDestinationId, restart, duration } = useTravel();
  const destination = revealedDestinationId ? getDestinationById(revealedDestinationId) : undefined;
  const reduce = useReducedMotion();
  /* 숙소는 조건에서 고른 duration이 1박 2일 이상일 때만 */
  const overnight = duration === "overnight";
  const nearby = useNearby(destination?.lat, destination?.lng, overnight, destination?.region);

  if (!destination) {
    return (
      <div className="dossier-page">
        <div className="dossier-empty mx-auto max-w-md text-center">
          <Compass className="mx-auto h-10 w-10 text-brass" strokeWidth={1.8} aria-hidden="true" />
          <h1 className="dossier-title !text-3xl">목적지를 찾을 수 없어요</h1>
          <p className="dossier-lead mx-auto">카드를 다시 골라 새로운 탐험지를 만나보세요.</p>
          <div className="mt-6">
            <Button onClick={restart} variant="primary" size="lg">
              카드 다시 고르기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* 카드 뒷면에서 본 힌트와 동일한 출처를 그대로 쓴다 */
  const hints = (destination.hints ?? buildFallbackHints(destination)).slice(0, 3);
  const mapPlaces = [...nearby.spots, ...nearby.foods, ...nearby.cafes].slice(0, 8);
  const hasMap = Boolean(destination.lat && destination.lng);
  const hasSpots = nearby.spots.length > 0 || destination.hiddenPlaces.length > 0;
  const eats = [...nearby.foods.slice(0, 2), ...nearby.cafes.slice(0, 1)];

  /* 1박 2일이면 가장 가까운 숙소를 Day 1 끝에, Day 2는 코스에 안 쓴 실제 주변 명소로 잇는다 */
  const stays = overnight ? nearby.stays : [];
  const stayName = stays[0]?.name;
  const stayDistance = stays[0]?.distance;
  const stayDistanceText =
    stayDistance == null
      ? ""
      : stayDistance < 1000
        ? `${stayDistance}m`
        : `${(stayDistance / 1000).toFixed(1)}km`;
  const used = new Set(destination.schedule.map((s) => s.title));
  const day2Name = stayName ? nearby.spots.find((p) => !used.has(p.name))?.name : undefined;

  return (
    <div className="dossier-page" data-overnight={overnight ? "true" : undefined}>
      <section className="dossier-hero">
        <div className="dossier-wrap dossier-hero__grid">
          <motion.div
            className="dossier-hero__copy"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34 }}
          >
            <p className="dossier-region">
              <MapPin className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              {destination.region}
            </p>
            <h1 className="dossier-title">{destination.name}</h1>
            <p className="dossier-lead">{leadText(destination.shortDescription)}</p>

            <ul className="dossier-hints">
              {hints.map((h) => (
                <li key={`${h.type}-${h.key}`} className="dossier-hint">
                  <span className="dossier-hint__emoji" aria-hidden="true">
                    {h.emoji}
                  </span>
                  {HINT_LABEL[h.type]}
                </li>
              ))}
            </ul>

            <DestinationActions destination={destination} />
          </motion.div>

          <DestinationHeroPhoto destination={destination} />
        </div>
      </section>

      <div className="dossier-body">
        <div className="dossier-wrap">
          <div className="dossier-sheet">
            <div className="dossier-top">
              {hasMap ? (
                <article className="panel">
                  <div className="panel__head">
                    <h2 className="panel__title">주변 지도</h2>
                    <a
                      className="panel__more"
                      href={kakaoMapUrl(destination)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      전체 보기
                    </a>
                  </div>
                  <DestinationMap destination={destination} places={mapPlaces} />
                  <DestinationMeta destination={destination} />
                </article>
              ) : null}

              {hasSpots ? (
                <article className="panel">
                  <div className="panel__head">
                    <h2 className="panel__title">함께 가볼 만한 곳</h2>
                  </div>
                  <PlaceList places={nearby.spots} fallback={destination.hiddenPlaces} limit={3} />
                </article>
              ) : null}

              {eats.length > 0 ? (
                <article className="panel">
                  <div className="panel__head">
                    <h2 className="panel__title">맛집 · 카페</h2>
                  </div>
                  <PlaceList places={eats} limit={3} />
                </article>
              ) : null}
            </div>

            <div className={stays.length > 0 ? "dossier-bottom" : "dossier-bottom dossier-bottom--solo"}>
              {destination.schedule.length > 0 ? (
                <article className="panel scroll-mt-20" id="schedule-timeline">
                  <div className="panel__head">
                    <h2 className="panel__title">추천 코스</h2>
                    <span className="panel__note">{stayName ? "1박 2일" : "당일치기"}</span>
                  </div>
                  <ScheduleTimeline
                    schedule={destination.schedule}
                    stayName={stayName}
                    day2Name={day2Name}
                  />
                </article>
              ) : null}

              {stays.length > 0 ? (
                <section className="panel stays">
                  <div className="panel__head">
                    <h2 className="stays__title">추천 숙소</h2>
                    <span className="panel__note">
                      {stayDistanceText ? `가장 가까운 곳 ${stayDistanceText}` : "한국관광공사 숙박"}
                    </span>
                  </div>
                  <NearbyStays stays={stays} />
                </section>
              ) : null}
            </div>

            <p className="dossier-source">
              관광지·숙박 정보 한국관광공사 TourAPI · 주변 장소 카카오 로컬
            </p>
          </div>
        </div>
      </div>

      <div className="dossier-cta-bar">
        <div className="dossier-wrap dossier-cta-bar__inner">
          <p className="dossier-cta-bar__copy">
            <strong>{destination.name}</strong>
            {destination.region ? ` · ${destination.region}` : ""}
          </p>
          <DestinationActions destination={destination} variant="bar" />
        </div>
      </div>
    </div>
  );
}
