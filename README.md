# K-Trip Random Picker

한국 여행지를 이모지 퀴즈 카드로 추천해 주는 웹 서비스입니다.  
React 프론트엔드와 FastAPI 백엔드로 분리되어 있으며, 한국관광공사 OpenAPI 연동 전에도 mock fallback으로 동작합니다.

## 프로젝트 구조

```
k-trip-random-picker/
├── frontend/          # React + Vite + TypeScript (UI)
├── backend/           # FastAPI (추천 API, OpenAPI 연동)
├── README.md
└── .gitignore
```

## 사전 요구사항

- **Node.js** 18+ (프론트엔드)
- **Python** 3.10+ (백엔드)

## 빠른 시작

### 1. 백엔드 실행

```bash
cd backend

# 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에서 KTO_API_KEY 등 필요 시 수정

# 서버 실행
uvicorn app.main:app --reload --port 8000
```

백엔드 헬스체크: http://localhost:8000/health  
추천 API: http://localhost:8000/api/recommendations?origin=서울&duration=day&maxDistanceKm=150&transportMode=local

### 2. 프론트엔드 실행

```bash
cd frontend

# 패키지 설치 (최초 1회)
npm install

# 환경변수 설정 (선택)
cp .env.example .env.local

# 개발 서버 실행 (포트 3000, /api 는 백엔드로 프록시)
npm run dev
```

브라우저: http://localhost:3000

### 3. 프로덕션 빌드

```bash
cd frontend
npm run build
```

빌드 결과물: `frontend/dist/`

## 환경변수

### backend/.env

| 변수 | 설명 | 필수 |
|---|---|---|
| `KTO_API_KEY` | 한국관광공사 OpenAPI 키 | 아니오 (없으면 mock fallback) |
| `CORS_ORIGINS` | 허용 origin (쉼표 구분) | 아니오 |
| `PORT` | 참고용 포트 (기본 8000) | 아니오 |

### frontend/.env.local

| 변수 | 설명 | 필수 |
|---|---|---|
| `VITE_API_BASE_URL` | API 서버 URL | 아니오 (개발 시 비워두면 Vite proxy 사용) |

> **주의:** `KTO_API_KEY`는 반드시 백엔드 `.env`에만 설정하세요. 프론트엔드 코드에 API 키를 넣지 마세요.

## API 설계

### `GET /api/recommendations`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `origin` | string | 출발지 (서울, 부산 등) |
| `duration` | string | `day` \| `overnight` |
| `maxDistanceKm` | number | 최대 이동 거리 (km) |
| `transportMode` | string | `local` \| `flightIncluded` |
| `themes` | string | 쉼표 구분 테마 (빈 값 = 전체) |

**응답 예시:**

```json
{
  "items": [
    {
      "id": "gangneung",
      "title": "강릉",
      "region": "강원도",
      "summary": "...",
      "themes": ["바다", "감성"],
      "emojiHints": ["🌊", "☕"],
      "reasonBadges": ["바다 감성"],
      "dataSource": "MOCK_FALLBACK",
      "detail": { "nearbySpots": [] }
    }
  ]
}
```

### transportMode 규칙

- `local`: `maxDistanceKm` 이내 + 항공 필요 지역(제주 등) **제외**
- `flightIncluded`: 거리 조건 충족 또는 항공 이동 지역 **허용**

## GitHub 협업

### Git에 올리는 것

- `frontend/package.json`, `frontend/package-lock.json`
- `backend/requirements.txt`
- `frontend/.env.example`, `backend/.env.example`
- 소스 코드

### Git에 올리지 않는 것

- `frontend/node_modules/`
- `backend/venv/`
- `.env`, `.env.local`
- `frontend/dist/`

### 새 팀원 온보딩

```bash
git clone <repo-url>
cd k-trip-random-picker

# 백엔드
cd backend && python -m venv venv && pip install -r requirements.txt
cp .env.example .env

# 프론트엔드
cd ../frontend && npm install
cp .env.example .env.local
```

## 배포 시 주의사항

1. **API 키**: `KTO_API_KEY`는 백엔드 서버 환경변수로만 주입
2. **CORS**: 프로덕션 프론트 URL을 `CORS_ORIGINS`에 추가
3. **프론트 API URL**: `VITE_API_BASE_URL`을 빌드 시점에 설정 (또는 리버스 프록시로 `/api` 통합)
4. **mock fallback**: OpenAPI 미연동/실패 시에도 `MOCK_FALLBACK` 데이터로 서비스 유지

## 라이선스

Apache-2.0
