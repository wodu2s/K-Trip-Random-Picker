import {
  detailImageUrl,
  recommendDestinations,
} from "../backend/src/kto.js";
import {
  buildSchedule,
  nearbyPlaces,
  regionWord,
  searchImage,
  toHiddenPlaces,
} from "../backend/src/kakao.js";

async function fillMainImage(destination) {
  if (destination.image) return;
  destination.image = await detailImageUrl(destination.contentId);
  if (destination.image) return;

  const hit = await searchImage(`${regionWord(destination.region)} ${destination.name}`);
  if (!hit) return;
  destination.image = hit.image;
  destination.imageCredit = hit.credit;
}

async function enrich(destination) {
  await fillMainImage(destination).catch(() => {});
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

/** backend/src/server.js POST /api/recommend 와 동일 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "POST만 허용됩니다." });
    return;
  }

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
    res.status(200).json({ destinations });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[recommend]", message);
    res.status(502).json({ error: message });
  }
}
