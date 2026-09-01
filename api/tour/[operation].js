// Vercel Serverless Function — TourAPI 프록시
// 클라이언트 /api/tour/<operation>?... 요청에 serviceKey를 서버에서 주입한다.
const KTO_PATH = "/B551011/KorService2";

function tourBaseUrl() {
  const raw = (process.env.KTO_API_BASE_URL || "").replace(/\/$/, "");
  if (!raw) return `https://apis.data.go.kr${KTO_PATH}`;
  return raw.includes("/KorService") ? raw : `${raw}${KTO_PATH}`;
}

function tourApiKey() {
  return process.env.KTO_API_KEY || process.env.TOUR_API_KEY || "";
}

export default async function handler(req, res) {
  const key = tourApiKey();
  if (!key) {
    console.error("[tour] missing KTO_API_KEY");
    res.status(500).json({ error: "KTO_API_KEY 환경변수가 설정되지 않았습니다." });
    return;
  }

  const { operation, ...query } = req.query;
  if (!operation || Array.isArray(operation)) {
    res.status(400).json({ error: "operation 경로가 필요합니다." });
    return;
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    params.set(k, Array.isArray(v) ? v[0] : String(v));
  }

  // Encoding 키(%2B/%3D 포함)는 URLSearchParams를 거치지 않고 그대로 붙인다
  const url = `${tourBaseUrl()}/${operation}?${params.toString()}&serviceKey=${key}`;

  try {
    const upstream = await fetch(url);
    const text = await upstream.text();
    if (!upstream.ok) {
      console.error(
        "[tour]",
        operation,
        "upstream",
        upstream.status,
        text.slice(0, 500),
      );
      res.status(upstream.status).json({
        error: "TourAPI upstream error",
        status: upstream.status,
        body: text.slice(0, 500),
      });
      return;
    }
    res.setHeader("content-type", upstream.headers.get("content-type") || "application/json");
    res.setHeader("cache-control", "public, max-age=300");
    res.status(upstream.status).send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[tour]", operation, "fetch failed", message);
    res.status(502).json({ error: "TourAPI 요청 실패", message });
  }
}
