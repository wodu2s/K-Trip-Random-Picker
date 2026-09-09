import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_ 접두사 없는 키까지 읽기 위해 prefix "" 로 로드 (클라이언트 번들에는 노출되지 않음)
  const env = loadEnv(mode, process.cwd(), '')
  const tourKey = env.KTO_API_KEY ?? env.TOUR_API_KEY ?? ''
  const kakaoKey = env.KAKAO_REST_API_KEY ?? env.KAKAO_REST_KEY ?? ''

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Reference-only design asset; avoid watcher EBUSY when the file is locked by OS/viewer
      watch: {
        ignored: ["**/public/assets/adventure/landing-classic-target.png"],
      },
      // TourAPI 프록시 — serviceKey를 서버 측에서 주입해 키 노출·CORS 회피
      proxy: {
        "/api/tour": {
          target: "https://apis.data.go.kr",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const p = path.replace(/^\/api\/tour/, "/B551011/KorService2")
            const sep = p.includes("?") ? "&" : "?"
            // .env의 TOUR_API_KEY는 Encoding 키(이미 %2B/%3D 인코딩됨)라 그대로 붙인다
            return `${p}${sep}serviceKey=${tourKey}`
          },
        },
        // Kakao Mobility 길찾기 프록시 — REST 키를 Authorization 헤더로 서버 측 주입
        "/api/kakao-navi": {
          target: "https://apis-navi.kakaomobility.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/kakao-navi/, "/v1/directions"),
          headers: {
            Authorization: `KakaoAK ${kakaoKey}`,
          },
        },
      },
    },
  }
})
