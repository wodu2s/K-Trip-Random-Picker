// Vercel Serverless Function — TourAPI 프록시
// 클라이언트 /api/tour/<operation>?... 요청에 serviceKey를 서버에서 주입한다.
// (dev의 Vite 프록시와 동일 역할, 배포 환경용)
export default async function handler(req, res) {
  const key = process.env.TOUR_API_KEY;
  if (!key) {
    res.status(500).json({ error: "TOUR_API_KEY 환경변수가 설정되지 않았습니다." });
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

  // TOUR_API_KEY는 Encoding 키(이미 %2B/%3D 인코딩됨)라 URLSearchParams를 거치지 않고 그대로 붙인다
  const base = `https://apis.data.go.kr/B551011/KorService2/${operation}`;
  const url = `${base}?${params.toString()}&serviceKey=${key}`;

  try {
    const upstream = await fetch(url);
    const text = await upstream.text();
    res.setHeader("content-type", upstream.headers.get("content-type") || "application/json");
    res.setHeader("cache-control", "public, max-age=300");
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(502).json({ error: "TourAPI 요청 실패", detail: String(err) });
  }
}
