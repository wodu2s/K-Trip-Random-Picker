// Vercel Serverless Function — Kakao Mobility 길찾기 프록시
// 클라이언트 /api/kakao-navi?origin=..&destination=.. 에 REST 키를 Authorization 헤더로 주입한다.
export default async function handler(req, res) {
  const key = process.env.KAKAO_REST_KEY;
  if (!key) {
    res.status(500).json({ error: "KAKAO_REST_KEY 환경변수가 설정되지 않았습니다." });
    return;
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    params.set(k, Array.isArray(v) ? v[0] : String(v));
  }

  const url = `https://apis-navi.kakaomobility.com/v1/directions?${params.toString()}`;

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
    });
    const text = await upstream.text();
    res.setHeader("content-type", upstream.headers.get("content-type") || "application/json");
    res.setHeader("cache-control", "public, max-age=300");
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(502).json({ error: "Kakao 길찾기 요청 실패", detail: String(err) });
  }
}
