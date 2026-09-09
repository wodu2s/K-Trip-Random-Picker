import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  detailImageUrl,
  ktoPlaceImagesNear,
  lodgingNearby,
  recommendDestinations,
} from "./kto.js";
import {
  attachThumbnails,
  buildSchedule,
  nearbyPlaces,
  regionWord,
  searchImage,
  toHiddenPlaces,
} from "./kakao.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const origins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    kto: Boolean(process.env.KTO_API_KEY),
    kakao: Boolean(process.env.KAKAO_REST_API_KEY),
  });
});

/** 메인 사진 — KTO firstimage → detailImage2 → 다음 이미지 검색 순으로만 채운다 */
async function fillMainImage(destination) {
  if (destination.image) return;
  destination.image = await detailImageUrl(destination.contentId);
  if (destination.image) return;

  const hit = await searchImage(`${regionWord(destination.region)} ${destination.name}`);
  if (!hit) return;
  destination.image = hit.image;
  destination.imageCredit = hit.credit;
}

/** 목적지 하나에 주변 장소·하루 코스를 채운다 (실패해도 목적지는 그대로 반환) */
async function enrich(destination) {
  await fillMainImage(destination).catch(() => {
    /* 이미지가 없으면 프런트에서 사진 영역을 생략한다 */
  });
  if (!destination.lat || !destination.lng) return destination;
  try {
    const places = await nearbyPlaces(destination.lat, destination.lng);
    destination.hiddenPlaces = toHiddenPlaces(places);
    destination.schedule = buildSchedule(places, destination.name);
  } catch {
    /* 카카오 실패 시 주변 정보 없이 진행 */
  }
  return destination;
}

/** KTO 숙박(contentTypeId=32) 후보 — 반경을 넓혀가며 거리순 8곳까지 */
async function collectStays(lat, lng) {
  for (const radius of [10000, 20000]) {
    const stays = await lodgingNearby(lat, lng, radius);
    if (stays.length) {
      const seen = new Set();
      return stays
        .filter((s) => !seen.has(s.contentId) && seen.add(s.contentId))
        .sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9))
        .slice(0, 8);
    }
  }
  return [];
}

/** 조건 설정값 → 실제 여행지 후보 5개 */
app.post("/api/recommend", async (req, res) => {
  const { duration, themes, companion, mood, discovery } = req.body ?? {};

  if (!Array.isArray(themes) || themes.length === 0) {
    res.status(400).json({ error: "themes가 필요합니다." });
    return;
  }

  try {
    const destinations = await recommendDestinations({
      duration,
      themes,
      companion,
      mood,
      discovery,
    });
    await Promise.all(destinations.map(enrich));
    res.json({ destinations });
  } catch (err) {
    console.error("[recommend]", err);
    res.status(502).json({ error: String(err.message ?? err) });
  }
});

/** 결과 페이지 지도 마커·주변 장소 */
app.get("/api/places/nearby", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: "lat, lng가 필요합니다." });
    return;
  }

  try {
    const region = String(req.query.region ?? "");
    const [places, stays, ktoPool] = await Promise.all([
      nearbyPlaces(lat, lng),
      req.query.stay === "1" ? collectStays(lat, lng).catch(() => []) : Promise.resolve([]),
      ktoPlaceImagesNear(lat, lng).catch(() => []),
    ]);

    await Promise.all([
      attachThumbnails(places.spots, region, 3, "관광", ktoPool),
      attachThumbnails(places.foods, region, 2, "음식점", ktoPool),
      attachThumbnails(places.cafes, region, 1, "카페", ktoPool),
    ]).catch(() => {
      /* 썸네일은 없어도 리스트는 그대로 노출 */
    });
    res.json({
      ...places,
      stays,
      hiddenPlaces: toHiddenPlaces(places),
    });
  } catch (err) {
    console.error("[nearby]", err);
    res.status(502).json({ error: String(err.message ?? err) });
  }
});

app.listen(PORT, () => {
  console.log(`Pick&Go API listening on http://localhost:${PORT}`);
});
