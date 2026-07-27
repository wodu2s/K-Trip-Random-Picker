# 🧭 Pick&Go

> 여행지를 검색하지 말고, 오늘은 뽑아보세요.

현재 상황(여행 기간·취향)만 고르면, **지금 떠날 수 있는 여행지 5곳을 랜덤 카드**로 추천해주는 웹 프로토타입입니다. 목적지를 바로 공개하지 않고 이모지 힌트가 담긴 카드 중 하나를 고르는 **게임 같은 발견 경험**에 집중했습니다.

**🔗 라이브 데모: https://deepbot-liart.vercel.app**

---

## ✨ 핵심 경험

- **검색보다 발견** — 검색창 대신, 카드를 뽑아 예상 못 한 장소를 만나요.
- **정보보다 설렘** — 목적지 공개 전에는 이모지 힌트와 분위기만.
- **게임성** — 5장의 카드가 섞이고, 마음이 가는 한 장을 골라 뒤집어요.
- **숨은 장소 발견** — 유명 관광지뿐 아니라 로컬 명소도 함께 추천.

---

## 🗺️ 화면 구성

| 단계 | 경로 | 내용 |
|---|---|---|
| PAGE 1 | `/` | 랜딩 — 3D 히어로 비주얼 + "여행지 뽑기" CTA |
| PAGE 2 | `/conditions` | 조건 설정 — 여행 기간 · 여행 테마 선택 |
| PAGE 3 | `/shuffle` | 카드 셔플 — 5장이 원형으로 섞이는 애니메이션 (자동 전환) |
| PAGE 4 | `/cards` | 카드 선택 — 이모지 힌트 카드 5장 (이름·사진 숨김) |
| PAGE 5 | `/destination/[id]` | 여행지 공개 — 대표 비주얼 · 리뷰 별점 · 숨은 명소 · 길찾기/저장 |

사용자 흐름: `랜딩 → 조건 설정 → 카드 셔플 → 카드 선택 → 여행지 공개`

---

## 🛠️ 기술 스택

- **[Next.js](https://nextjs.org) 15** (App Router) · **React 19** · **TypeScript**
- **[Tailwind CSS](https://tailwindcss.com) 3.4** — 디자인 토큰 기반 스타일
- **[Framer Motion](https://www.framer.com/motion/)** — 카드 셔플/뒤집기·페이지 전환 애니메이션
- **[Zustand](https://zustand-demo.pmnd.rs/)** — 여행 조건·카드·결과 상태 관리
- 폰트: **Pretendard** / 3D·풍경은 CSS 3D·인라인 SVG로 구현

> 프로토타입 단계라 로그인·실시간 교통 API·예약 등은 포함하지 않으며, 여행지·리뷰 평점은 로컬 **샘플 데이터**입니다.

---

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:3000)
npm run dev

# 프로덕션 빌드 / 타입 검사
npm run build
```

---

## 📁 프로젝트 구조

```text
src/
├─ app/                      # 라우트 (App Router)
│  ├─ page.tsx               # PAGE 1 랜딩
│  ├─ conditions/            # PAGE 2 조건 설정
│  ├─ shuffle/               # PAGE 3 카드 셔플
│  ├─ cards/                 # PAGE 4 카드 선택
│  └─ destination/[id]/      # PAGE 5 여행지 공개
├─ components/
│  ├─ layout/                # Header · StepProgress · PageContainer
│  ├─ ui/                    # Button · Card
│  ├─ landing/               # 랜딩 히어로 · 특징
│  ├─ conditions/            # 조건 컨트롤
│  ├─ cards/                 # 셔플 씬 · 미스터리 카드 · 카드 덱
│  └─ destination/           # 히어로 · 메타(별점) · 숨은 장소 · 액션
├─ stores/travelStore.ts     # Zustand 상태
├─ data/destinations.ts      # 샘플 여행지 데이터
├─ lib/recommend.ts          # 테마 필터 + 랜덤 5장 추천
└─ types/travel.ts
```

프로젝트 상세 스펙과 구현 현황은 [`CLAUDE.md`](./CLAUDE.md)에 정리되어 있습니다.

---

## 📌 참고

- 배경 이미지(`public/p1.png`, `p2.png`)는 **텍스트·버튼이 없는 배경**으로만 사용하고, 그 위에 실제 HTML 요소를 오버레이해 접근성·반응형을 확보했습니다.
- 여행지 대표 이미지·리뷰 평점은 실사 사진/리뷰 API 연동 시 교체할 수 있는 구조입니다.
