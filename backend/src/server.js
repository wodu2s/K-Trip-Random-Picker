import "dotenv/config";
import express from "express";
import cors from "cors";
import { fetchDestinationDetail, recommendDestinations } from "./kto.js";
import { buildSchedule, nearbyPlaces, toHiddenPlaces } from "./kakao.js";

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

/** 목적지 하나에 주변 장소·하루 코스를 채운다 (실패해도 목적지는 그대로 반환) */
async function enrich(destination) {
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

/**
 * 선택한 여행지 한 곳의 이용 정보·추가 사진.
 * 카드 5장 전부가 아니라 사용자가 고른 뒤 1건만 호출해 TourAPI 호출량을 아낀다.
 */
app.get("/api/destination/detail", async (req, res) => {
  const contentId = String(req.query.contentId ?? "").trim();
  const contentTypeId = String(req.query.contentTypeId ?? "").trim();
  if (!contentId || !contentTypeId) {
    res.status(400).json({ error: "contentId, contentTypeId가 필요합니다." });
    return;
  }

  try {
    res.json(await fetchDestinationDetail(contentId, contentTypeId));
  } catch (err) {
    console.error("[detail]", err);
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
    const places = await nearbyPlaces(lat, lng);
    res.json({
      ...places,
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
