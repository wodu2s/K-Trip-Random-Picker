# Pick&Go — 랜덤 국내여행 웹페이지

여행 기차를 출발시키면 3D 스타일의 대한민국 지도를 따라 기차가 랜덤 주행하며 여행 카드 5장을 모아오고,
사용자가 카드를 직접 섞고 한 장을 선택하면 오늘의 랜덤 여행지가 공개되는 반응형 웹 서비스입니다.

## 기술 스택

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- motion (`motion/react`), lucide-react
- Flask 백엔드 → 한국관광공사 TourAPI (`KorService2`)
- SVG + CSS 3D transform (Three.js 미사용)

## 로컬 실행

```bash
npm install
npm run setup:api
copy .env.example .env
```

`.env`의 `TOUR_API_SERVICE_KEY`에 [data.go.kr](https://www.data.go.kr/) 서비스키를 넣습니다. 키가 없어도 앱은 뜨고, 추천은 샘플 데이터로 동작합니다.

프론트만:

```bash
npm run dev          # http://localhost:5173
```

프론트 + TourAPI 프록시:

```bash
npm run dev:all      # Vite 5173 + Flask 5000
```

따로 띄울 때:

```bash
npm run dev:api      # Flask http://127.0.0.1:5000
npm run dev          # 다른 터미널
```

```bash
npm run build        # 타입체크 + 프로덕션 빌드
npm run preview
npm run lint
```

## 환경변수

| 변수 | 위치 | 설명 |
|---|---|---|
| `TOUR_API_SERVICE_KEY` | 루트 `.env` 또는 `backend/.env` | TourAPI 키. 프론트에 넣지 말 것 |
| `VITE_API_BASE_URL` | 루트 `.env` | 비우면 `/api` → `http://127.0.0.1:5000` |

배포(Vercel)에서는 대시보드 Environment Variable로 `TOUR_API_SERVICE_KEY`를 넣습니다.

## 폴더 구조

```
api/                # Vercel Python 엔트리 (Flask 앱 재사용)
backend/           # TourAPI 프록시
src/
  api/              # 프론트 → 백엔드 클라이언트
  components/       # landing / conditions / cards / destination / layout
  data/             # 테마 옵션 + 샘플 여행지 (API fallback)
  hooks/
  lib/              # 추천, 카드 모션
  state/            # TravelContext
  types/
  utils/
```

## 핵심 로직

- 추천: TourAPI 후보 → 테마/동행/분위기 필터 → contentid 중복 제거 → Fisher-Yates → 최대 5장
- API 실패 시 `src/data/destinations.ts` 샘플로 fallback
- 카드 선택 전에는 여행지명을 노출하지 않음
