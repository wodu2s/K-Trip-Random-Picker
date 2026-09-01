import { ktoPlaceImagesNear, lodgingNearby } from "../../backend/src/kto.js";
import { attachThumbnails, nearbyPlaces, toHiddenPlaces } from "../../backend/src/kakao.js";

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

/** backend/src/server.js GET /api/places/nearby 와 동일 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "GET만 허용됩니다." });
    return;
  }

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
    ]).catch(() => {});

    res.status(200).json({
      ...places,
      stays,
      hiddenPlaces: toHiddenPlaces(places),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[nearby]", message);
    res.status(502).json({ error: message });
  }
}
