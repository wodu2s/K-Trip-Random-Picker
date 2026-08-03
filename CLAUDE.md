# CLAUDE.md

## 1. 프로젝트 개요

### 프로젝트명
**RandomTrip**  
사용자가 여행지를 직접 검색하는 대신, 현재 위치·여유 시간·여행 취향을 바탕으로 **지금 떠날 수 있는 여행지 5곳을 랜덤 카드 형태로 추천받는 웹 서비스**다.

### 핵심 한 줄
> 여행지를 검색하지 말고, 오늘은 뽑아보세요.

### 서비스 목적
기존 여행 서비스는 사용자가 지역, 일정, 교통수단, 테마를 직접 비교하고 선택해야 한다. RandomTrip은 이 과정을 줄이고, 최소한의 조건만 입력하면 실제로 방문 가능한 장소를 랜덤으로 제안한다.

서비스의 핵심은 단순한 장소 검색이 아니라 다음 경험을 제공하는 것이다.

- 여행지를 고르는 과정에서 느끼는 **설렘**
- 목적지를 바로 공개하지 않는 **미스터리**
- 5장의 카드 중 하나를 선택하는 **게임성**
- 유명 관광지와 함께 숨겨진 로컬 장소를 발견하는 **새로움**
- 선택 후 바로 이동할 수 있는 **실행 가능성**

---

## 2. 핵심 사용자 경험

### 핵심 UX 문장
> 사용자는 조건을 선택하고, 카드가 섞이는 장면을 본 뒤, 이모지 힌트만 표시된 5장의 카드 중 마음이 가는 카드를 고른다. 선택한 카드가 뒤집히면 여행지가 강렬하게 공개된다.

### 사용자 흐름

```text
랜딩 페이지
↓
여행 조건 설정
↓
카드 셔플 애니메이션
↓
이모지 힌트 카드 5장
↓
카드 선택
↓
여행지 공개
↓
길찾기 또는 저장
```

### 핵심 원칙

1. **검색보다 발견**
   - 검색창 중심의 UI를 만들지 않는다.
   - 사용자가 예상하지 못한 장소를 발견하게 한다.

2. **정보보다 설렘**
   - 첫 화면부터 상세 정보를 과도하게 보여주지 않는다.
   - 목적지 공개 전에는 이모지 힌트와 분위기만 제공한다.

3. **랜덤이지만 현실적**
   - 사용자의 위치, 이동 가능 시간, 여행 기간, 테마를 기준으로 후보를 제한한 뒤 랜덤으로 추천한다.

4. **장소 중심**
   - 프로토타입에서는 여행 코스나 복잡한 일정표를 제공하지 않는다.
   - 하나의 장소가 멋지게 공개되도록 한다.

5. **숨은 장소 발견**
   - 유명 관광지뿐 아니라 덜 알려진 로컬 장소, 산책길, 골목길, 해변, 전망대 등을 함께 추천한다.

---

## 3. 프로토타입 범위

### 이번 단계에서 반드시 구현할 기능

- 3D 랜딩 히어로
- 여행 조건 선택
- 카드 셔플 애니메이션
- 이모지 힌트 카드 5장
- 카드 선택 및 뒤집기
- 최종 여행지 공개
- 길찾기 버튼
- 여행 저장 버튼

### 이번 단계에서 제외할 기능

- 실제 로그인 및 회원가입
- 실시간 교통 API
- 숙박 예약
- 막차 조회
- 후기 작성
- 마이페이지
- AI 여행 코스 생성
- 복잡한 추천 알고리즘
- 결제 기능

현재는 **작동하는 웹 프로토타입**이 목표다.  
샘플 관광지 데이터를 사용해도 된다.

---

## 4. 주요 화면

## PAGE 1. 랜딩 페이지

### 목적
서비스에 처음 진입한 사용자가 즉시 RandomTrip의 콘셉트를 이해하고, 시각적으로 “우와”라는 느낌을 받을 수 있도록 한다.

### 레이아웃
- 데스크톱: 왼쪽 텍스트, 오른쪽 3D 비주얼
- 모바일: 제목 → 3D 비주얼 → CTA 순서

### 왼쪽 영역
- 로고
- 메인 문구
- 서브 문구
- `여행지 뽑기` CTA
- 서비스 특징 3개

### 추천 문구
```text
당신의 다음 여행지는?
지금 갈 수 있는 여행지를 랜덤으로 뽑아드릴게요.
```

### 오른쪽 3D 비주얼
- 여행 카드 5장
- 나침반
- 지도 핀
- 여행 가방
- 여행 티켓
- 구름과 작은 반짝이

### 인터랙션
- 마우스 이동에 따라 카드가 살짝 기울어진다.
- 카드가 천천히 떠 있는 느낌을 준다.
- CTA 클릭 시 다음 페이지로 부드럽게 전환한다.

---

## PAGE 2. 여행 조건 설정

### 목적
사용자가 최소한의 조건만 선택하도록 한다.

### 입력 항목
- 출발지
- 이동 가능 시간
- 여행 기간
- 여행 테마

### 기본 선택지

```text
이동 가능 시간
- 30분 이내
- 1시간 이내
- 반나절 이내

여행 기간
- 당일치기
- 1박 2일 이상

여행 테마
- 바다
- 자연
- 맛집
- 감성
- 역사/문화
- 로컬
- 액티비티
- 기타
```

### 레이아웃
- 왼쪽: 조건 선택 패널
- 오른쪽: 현실적인 한국 여행 풍경

### 오른쪽 이미지 방향
- 환상적인 판타지 장면은 사용하지 않는다.
- 실제 한국의 한옥 골목, 바다, 산책길, 기차역, 소도시 풍경을 사용한다.
- 따뜻한 아침빛이나 골든아워로 여행 전의 기대감을 표현한다.
- 사진은 현실적이어야 하지만, 사용자가 떠나고 싶다는 감정을 느껴야 한다.

### CTA
```text
카드 뽑기 시작
```

---

## PAGE 3. 카드 셔플

### 목적
일반적인 로딩 화면이 아니라, 여행지가 만들어지고 있다는 기대감을 제공한다.

### 구성
- 왼쪽 조건 패널은 제거한다.
- 화면 중앙에 5장의 카드가 섞이는 장면을 크게 배치한다.
- 한국적인 배경을 사용한다.
- 카드 뒷면은 전통 문양을 단순화한 패턴을 사용할 수 있다.

### 추천 문구
```text
카드를 섞고 있어요!
설렘 가득한 여행지를 준비 중이에요.
```

### 상태 메시지
- 출발지 확인 중
- 이동 가능 시간 계산 중
- 취향과 테마 분석 중
- 랜덤 카드 준비 중

### 애니메이션
- 5장의 카드가 원형으로 회전한다.
- 카드 순서가 섞인다.
- 작은 빛과 입자가 주변을 돈다.
- 2~3초 후 카드 선택 화면으로 전환한다.

---

## PAGE 4. 카드 선택

### 목적
사용자가 여행지 이름을 보지 않고 이모지 힌트만으로 마음이 끌리는 카드를 선택하게 한다.

### 화면 구성
- 상단: 진행 단계
- 중앙: 카드 5장
- 카드마다 이모지 힌트 3개
- 하단: 힌트 설명 및 다시 뽑기 버튼

### 추천 문구
```text
마음이 이끄는 카드를 골라보세요!
여행지 이름은 아직 비밀이에요.
```

### 이모지 힌트 예시

| 장소 유형 | 힌트 |
|---|---|
| 바다와 카페 | 🌊 ☕ 🌅 |
| 숲길 산책 | 🌲 🚶 🍃 |
| 전통 마을 | 🏮 🏠 🍜 |
| 산악 액티비티 | ⛰️ 🪂 🦅 |
| 조용한 해변 | 🏖️ 🐚 ☀️ |

### 카드 디자인
- 흰색 바탕
- 파란색과 노란색의 얇은 테두리
- 둥근 모서리
- 은은한 전통 문양 패턴
- 중앙에 이모지 3개
- 아래에 큰 물음표

### 인터랙션
- Hover: 카드가 살짝 위로 올라오고 확대된다.
- Click: 선택 카드가 중앙으로 이동한다.
- 선택 카드가 뒤집히며 PAGE 5로 전환된다.
- 나머지 카드는 흐려지거나 바깥으로 밀려난다.

### 다시 뽑기
- 프로토타입에서는 횟수 제한을 시각적으로만 표시할 수 있다.
- 예: `다시 뽑기 2/3회`

---

## PAGE 5. 여행지 공개

### 목적
사용자가 선택한 장소가 한 번에 강렬하게 공개되도록 한다.

### 핵심 방향
- 코스표나 일정표를 넣지 않는다.
- 장소 자체를 멋있고 크게 보여준다.
- 숨겨진 장소를 함께 발견할 수 있게 한다.

### 화면 구성
- 대형 여행지 대표 이미지 또는 영상
- 여행지 이름
- 한 줄 감성 문구
- 예상 이동 시간
- 테마 태그
- 숨은 장소 여부
- 길찾기 버튼
- 저장 버튼

### 추천 구조

```text
이번 여행지는...
[장소명]

한 줄 감성 설명
예상 이동 시간
테마 태그

[지금 길찾기 시작하기]
[이 여행 저장하기]
```

### 대표 이미지
- 16:9 비율
- 장소를 넓고 시원하게 보여준다.
- 실제 사진 기반
- 골든아워, 맑은 날, 노을, 아침 안개 등의 분위기를 활용한다.
- 이미지 위에 과도한 텍스트를 덮지 않는다.

### 숨은 장소 영역
메인 장소 아래에 3~5개의 숨은 장소 카드를 제공한다.

```text
숨겨진 장소 추천
- 관광객이 적은 산책길
- 현지인들이 찾는 전망대
- 조용한 골목
- 작은 해변
- 로컬 카페
```

### CTA
- `지금 길찾기 시작하기`
- `이 여행 저장하기`

---

## 5. 디자인 시스템

## 전체 스타일

### 핵심 분위기
- 밝음
- 설렘
- 여행
- 가벼움
- 깨끗함
- 현대적인 한국 감성

### 피해야 할 분위기
- 과도한 판타지
- 어두운 사이버펑크
- 지나치게 유아적인 장난감 느낌
- 복잡한 대시보드
- 정보가 너무 많은 화면
- 실제 기능 없이 이미지 전체를 배경으로 사용하는 구현

---

## 색상

```css
--color-primary: #2F73F6;
--color-primary-dark: #12305C;
--color-accent: #FFD166;
--color-background: #F4FAFF;
--color-surface: #FFFFFF;
--color-text: #17345F;
--color-text-muted: #667085;
--color-border: #DCEBFA;
--color-success: #42B883;
```

### 색상 사용 규칙
- 파란색: 주요 CTA, 선택 상태, 진행 단계
- 노란색: 설렘, 랜덤, 강조 버튼
- 흰색: 카드와 입력 패널
- 네이비: 제목과 본문
- 민트/연두: 자연 및 로컬 태그

---

## 타이포그래피

### 권장 폰트
- Pretendard
- Noto Sans KR

### 제목
- 데스크톱: 52~64px
- 태블릿: 42~52px
- 모바일: 32~40px
- 굵기: 700~800

### 본문
- 데스크톱: 17~20px
- 모바일: 15~17px
- 줄 간격: 1.6

### 버튼
- 16~20px
- 굵기: 600~700

---

## 카드 스타일

```css
border-radius: 24px;
background: rgba(255, 255, 255, 0.92);
border: 1px solid rgba(47, 115, 246, 0.14);
box-shadow: 0 20px 50px rgba(47, 115, 246, 0.14);
backdrop-filter: blur(16px);
```

### 카드 원칙
- 둥근 모서리
- 부드러운 그림자
- 선택 시 테두리와 그림자 강화
- Hover 시 4~10px 위로 이동
- 애니메이션은 빠르지만 부드럽게

---

## 버튼 스타일

### Primary
- 파란색 또는 노란색 배경
- 둥근 모서리
- 큰 클릭 영역
- 명확한 텍스트

### Secondary
- 흰색 배경
- 파란색 테두리
- 강조를 줄인 스타일

### 인터랙션
- Hover 시 1.02~1.04배 확대
- Click 시 0.98배 축소
- 키보드 포커스 링 제공

---

## 6. 3D 사용 원칙

### 3D를 사용하는 화면
- PAGE 1 랜딩
- PAGE 3 카드 셔플
- PAGE 4 카드 선택 일부

### 3D를 사용하지 않거나 최소화할 화면
- PAGE 2 조건 설정
- PAGE 5 여행지 공개

### 역할 분리

```text
Spline / 3D
- 카드 덱
- 카드 셔플
- 나침반
- 지도 핀
- 여행 가방
- 장식 요소

React / HTML
- 제목
- 설명
- 버튼
- 입력 폼
- 이모지 힌트
- 여행지 정보
```

### 중요
- 전체 화면을 이미지 한 장으로 구현하지 않는다.
- 텍스트와 버튼은 실제 HTML 요소로 작성한다.
- 3D 장면은 독립된 컴포넌트로 분리한다.
- Spline을 아직 사용하지 않는 경우 CSS 3D 또는 임시 이미지로 대체 가능하게 한다.

---

## 7. 반응형 설계

### Desktop
- 기준 화면: 1440×900
- 최대 콘텐츠 너비: 1280~1360px
- 좌우 2열 레이아웃 사용
- 상단 내비게이션 표시

### Tablet
- 2열 구조를 유지하되 비주얼 크기를 줄인다.
- 여백과 폰트 크기를 단계적으로 축소한다.

### Mobile
- 단일 열
- 제목 → 비주얼 → 버튼 → 보조 정보 순서
- 상단 내비게이션은 햄버거 메뉴로 변경
- 장식용 3D 오브젝트 일부 숨김
- 카드 선택 화면은 가로 스와이프 또는 2열 배치
- 버튼은 화면 너비에 가깝게 표시

### 필수 기준
- 가로 스크롤 금지
- 터치 영역 최소 44px
- 텍스트가 이미지에 포함되지 않도록 구현
- `prefers-reduced-motion` 지원

---

## 8. 권장 기술 스택

```text
Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand

3D
- Spline Embed
- 추후 React Three Fiber로 대체 가능

Prototype Data
- 로컬 TypeScript 데이터
- public 폴더의 샘플 이미지

Later
- Supabase
- TourAPI
- Kakao Map
- TMAP / ODsay
```

---

## 9. 권장 파일 구조

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ conditions/
│  │  └─ page.tsx
│  ├─ shuffle/
│  │  └─ page.tsx
│  ├─ cards/
│  │  └─ page.tsx
│  └─ destination/
│     └─ [id]/
│        └─ page.tsx
│
├─ components/
│  ├─ layout/
│  │  ├─ Header.tsx
│  │  ├─ PageContainer.tsx
│  │  └─ StepProgress.tsx
│  │
│  ├─ landing/
│  │  ├─ HeroCopy.tsx
│  │  ├─ TravelHero3D.tsx
│  │  └─ FeatureItems.tsx
│  │
│  ├─ conditions/
│  │  ├─ LocationSelector.tsx
│  │  ├─ TimeSelector.tsx
│  │  ├─ DurationSelector.tsx
│  │  └─ ThemeSelector.tsx
│  │
│  ├─ cards/
│  │  ├─ ShuffleScene.tsx
│  │  ├─ MysteryCard.tsx
│  │  └─ CardDeck.tsx
│  │
│  └─ destination/
│     ├─ DestinationHero.tsx
│     ├─ DestinationMeta.tsx
│     └─ HiddenPlaceCards.tsx
│
├─ stores/
│  └─ travelStore.ts
│
├─ data/
│  └─ destinations.ts
│
└─ types/
   └─ travel.ts

public/
├─ references/
│  ├─ page-1-landing.png
│  ├─ page-2-conditions.png
│  ├─ page-3-shuffle.png
│  ├─ page-4-cards.png
│  └─ page-5-destination.png
│
└─ images/
   └─ destinations/
```

---

## 10. 상태 관리

Zustand로 다음 상태를 관리한다.

```ts
type TravelState = {
  location: string | null;
  travelTime: "30m" | "1h" | "half-day" | null;
  duration: "day-trip" | "overnight" | null;
  themes: string[];
  cards: MysteryCardData[];
  selectedCardId: string | null;
  revealedDestinationId: string | null;
};
```

### 흐름
```text
조건 선택
↓
조건 저장
↓
샘플 장소 필터링
↓
5장 랜덤 선택
↓
카드 선택
↓
장소 공개
```

---

## 11. 샘플 데이터 구조

```ts
export type Destination = {
  id: string;
  name: string;
  region: string;
  image: string;
  emojiHints: string[];
  themes: string[];
  shortDescription: string;
  travelTimeText: string;
  isHiddenGem: boolean;
};
```

---

## 12. 구현 규칙

### 반드시 지켜야 할 것

1. 레퍼런스 이미지는 디자인 참고용이다.
2. 이미지를 페이지 전체 배경으로 사용하지 않는다.
3. 텍스트와 버튼을 이미지 안에 포함하지 않는다.
4. 모든 텍스트는 실제 HTML 요소로 작성한다.
5. 버튼은 실제 클릭 가능한 요소로 구현한다.
6. 페이지를 재사용 가능한 컴포넌트로 분리한다.
7. 데스크톱, 태블릿, 모바일 반응형을 구현한다.
8. 카드 선택과 페이지 전환에는 자연스러운 애니메이션을 적용한다.
9. 접근성을 위해 키보드 포커스와 `aria-label`을 제공한다.
10. 불필요한 라이브러리를 추가하지 않는다.

### 하지 말아야 할 것

- 스크린샷을 그대로 `<img>` 또는 배경 이미지로 깔기
- 한 컴포넌트에 전체 페이지 코드 작성
- 모든 요소를 absolute positioning으로 고정
- 모바일만 고려한 고정 크기
- 여행 코스와 복잡한 타임라인을 추가
- 프로토타입 단계에서 백엔드 구축
- 존재하지 않는 실제 API 데이터를 사실처럼 표현

---

## 13. Claude Code 작업 방식

### 첫 요청
레퍼런스 이미지를 분석한 뒤 다음 내용을 먼저 제안한다.

1. 레이아웃 분석
2. 컴포넌트 구조
3. 반응형 전략
4. 필요한 파일
5. 구현 순서

계획 확인 전에는 코드를 작성하지 않는다.

### 페이지 구현 순서

```text
1. 공통 Header와 디자인 토큰
2. PAGE 1 랜딩
3. PAGE 2 조건 설정
4. PAGE 3 카드 셔플
5. PAGE 4 카드 선택
6. PAGE 5 여행지 공개
7. 페이지 전환 및 Zustand 연결
8. 반응형 테스트
9. 접근성 및 애니메이션 검토
```

### 각 페이지 구현 후 확인 사항
- 스크린샷과 전체 분위기가 유사한가
- 웹 UI로 자연스럽게 재구성되었는가
- 텍스트가 실제 HTML인가
- 버튼이 동작하는가
- 모바일에서 레이아웃이 무너지지 않는가
- 3D가 콘텐츠를 방해하지 않는가

---

## 14. 완료 기준

프로토타입은 다음 조건을 만족하면 완료된 것으로 본다.

- 랜딩에서 여행지 뽑기 버튼을 클릭할 수 있다.
- 조건을 선택하고 다음 단계로 이동할 수 있다.
- 카드 셔플 애니메이션이 실행된다.
- 이모지 힌트 카드 5장이 표시된다.
- 카드를 선택하면 장소가 공개된다.
- 길찾기 및 저장 버튼이 표시된다.
- 모든 페이지가 데스크톱과 모바일에서 정상 표시된다.
- 사용자가 서비스 핵심인 “설렘, 랜덤, 숨은 장소 발견”을 이해할 수 있다.

---

## 15. 구현 현황 (Implementation Status)

> 실제로 구현·설치된 내용을 기록한다. (문서 상단의 스펙과 실제 코드의 차이를 반영)

### 15.0 서비스명 & 배포

- **서비스명: `Pick&Go`** (기존 RandomTrip에서 변경). 로고·메타데이터·alt 텍스트 모두 반영.
- **Vercel 배포 중**: https://deepbot-liart.vercel.app (프로덕션 별칭, 항상 최신)
  - 재배포: `npx vercel --prod --yes` (git 없이 폴더 직접 업로드)

### 15.1 설치된 기술 스택

```text
next            15.5.20  (App Router, 보안 패치본)
react / react-dom  19.0.0
typescript      5.7.3
tailwindcss     3.4.17   (postcss + autoprefixer)
framer-motion   11.18.x  (애니메이션)
zustand         5.0.3    (상태)
```

- 폰트: Pretendard (jsdelivr CDN `@import`)
- 3D: Spline 미사용. CSS 3D / 이모지 / 인라인 SVG로 대체.
- Supabase·TourAPI·Kakao Map 등 백엔드/외부 API 미연동 (프로토타입).

### 15.2 페이지별 구현 상태 (전 페이지 완료)

| 페이지 | URL | 상태 | 핵심 구현 |
|---|---|---|---|
| PAGE 1 랜딩 | `/` | ✅ | **`public/p1.png`**(3D 히어로 배경)를 뷰포트 가득 채우고(object-cover) 왼쪽에 실제 텍스트/버튼 오버레이. 데스크톱 **스크롤 없음** |
| PAGE 2 조건 | `/conditions` | ✅ | **`public/p2.png`** 배경 하얀 박스 위에 컨트롤 오버레이(lg+). **여행 기간 + 여행 테마만** (출발지·이동시간 제외). 데스크톱 한 화면(스크롤 없음) |
| PAGE 3 셔플 | `/shuffle` | ✅ | 5장 원형 셔플(framer-motion) + 빛 입자 + 상태 메시지 4개, 2.8초 후 `/cards` 자동 이동. `duration` 없으면 `/conditions`로 가드 |
| PAGE 4 카드 | `/cards` | ✅ | 이모지 힌트 카드 5장(이름/사진 숨김) + 뒤집기 → `/destination/[id]`. 다시 뽑기 3회. cards 없으면 `/conditions` |
| PAGE 5 공개 | `/destination/[id]` | ✅ | 테마별 SVG 히어로 + **리뷰 별점(★) 메타** + 숨은 장소 가로 스크롤 + 길찾기(카카오맵 링크)·저장(로컬). 잘못된 id는 안내 화면. **유일하게 스크롤 허용** |

**최근 반영(수정 요청)**
- **레이아웃**: 마지막(공개) 페이지 제외 전부 **한 화면(뷰포트) 안에 배치 → 스크롤 제거**. `min-h-[calc(100vh-4rem)]` 기준.
- **조건 입력 축소**: `출발지(현재 위치)`·`이동 가능 시간` 제거. 남은 필수 조건 = `여행 기간 + 테마 1개 이상`.
- **평점**: 임의 "지수(힐링/맛집)" → **여행자 리뷰 별점(★ + 리뷰 수 + 추천 만족도)**. `rating`/`reviewCount`는 샘플(추후 리뷰 API 연동 지점).

### 15.3 레퍼런스 이미지 사용 방식 (중요 결정)

원 스펙은 "레퍼런스 이미지를 배경으로 쓰지 말 것"이지만, 사용자 요청에 따라 **PAGE 1·2는 사용자가 제공한 배경 이미지(`p1.png`, `p2.png`)를 사용**한다. 단, 두 이미지는 **텍스트·버튼이 없는 깨끗한 배경**이며, 그 위에 **실제 HTML 텍스트/버튼을 오버레이**한다. (이미지에 텍스트가 박히지 않아 접근성/반응형 확보)

- `public/references/page-*.png` : 최초 5장 시안 (개발 참고용, 화면 미사용)
- `public/p1.png` : PAGE 1 히어로 배경 (오른쪽 3D 비주얼 + 왼쪽 빈 하늘)
- `public/p2.png` : PAGE 2 배경 (왼쪽 빈 하얀 박스 + 오른쪽 창문 풍경 + 하단 흰 TIP 바)
- PAGE 3·5의 배경은 CSS/SVG로 구현(교체용 실사 이미지 미제공). 실사 사진을 주면 각 Scene/HeroArt만 교체 가능한 구조.

### 15.4 실제 파일 구조

```text
src/
├─ app/
│  ├─ layout.tsx                    # 폰트·토큰·Header
│  ├─ globals.css                   # 디자인 토큰(CSS 변수)·Pretendard·reduced-motion
│  ├─ page.tsx                      # PAGE1 (p1.png + 오버레이)
│  ├─ conditions/page.tsx           # PAGE2 (p2.png + 오버레이)
│  ├─ shuffle/page.tsx              # PAGE3
│  ├─ cards/page.tsx                # PAGE4
│  └─ destination/[id]/page.tsx     # PAGE5 (SSG)
├─ components/
│  ├─ layout/    Header · Logo · PageContainer · StepProgress
│  ├─ ui/        Button · Card
│  ├─ landing/   FeatureItems · TravelHero3D(미사용, CSS 3D 원본 보관)
│  ├─ conditions/ ConditionsControls · ConditionsForm(구버전) · ConditionsScene(SVG)
│  ├─ cards/     ShuffleScene · MysteryCard · CardDeck(PC 그리드/모바일 스와이프)
│  ├─ destination/ DestinationHero · DestinationMeta · HiddenPlaceCards · DestinationActions(이미지저장·카카오공유)
│  └─ system/    DeviceProvider(useDevice·DeviceSwitch)
├─ stores/travelStore.ts            # Zustand (duration·themes·cards·selectedCardId·revealedDestinationId / location·travelTime는 미사용 잔존)
├─ data/destinations.ts             # 샘플 여행지 6곳 + THEME_META (+ tagline·story·hiddenPlaces·rating·reviewCount)
├─ lib/
│  ├─ recommend.ts                  # 테마 필터 + 랜덤 5장 뽑기
│  └─ device.ts                     # 서버 User-Agent 기기 판별(getDeviceType)
└─ types/travel.ts
```

### 15.5 실행 방법

```bash
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드/타입검사
```

### 15.6 남은 작업 / 미세조정 포인트

- PAGE 2: 컨트롤을 p2.png 하얀 박스에 % 좌표(실측 `left 1.9% / top 11.5% / w 38% / h 83.3%`)로 맞춤 → 아주 작은 화면에선 미세조정 필요할 수 있음.
- 별점 평점(`rating`/`reviewCount`)은 샘플 → 실제 **리뷰 API**로 교체 예정.
- 랜딩 "서비스 둘러보기" 버튼: 인트로 섹션 제거로 현재 `/conditions`로 연결(placeholder).
- 실사 이미지(한옥/여행지 사진) 제공 시 PAGE 3·5 배경 및 PAGE 5 히어로 교체 가능.
- `travelTime`/`location` 필드는 store/type에 잔존하지만 UI에서 제거됨(미사용). 완전 정리 시 삭제 가능.
- 로그인/회원가입, 실시간 API 등은 스펙상 프로토타입 범위 밖(미구현).

### 15.7 PC/모바일 분리 렌더 + 카카오톡 공유 (신규)

**(1) 접속 기기 감지 후 분리 렌더**
- `src/lib/device.ts` : 서버에서 요청 `User-Agent`로 `"mobile" | "desktop"` 판별(`getDeviceType()`). 이 호출로 `/`·`/conditions`는 **동적 렌더링**으로 전환됨(의도된 트레이드오프).
- `src/components/system/DeviceProvider.tsx` :
  - `DeviceProvider` — 서버 판별값(initial)을 전역 공급 + 마운트 후 `matchMedia(max-width:767px)`로 보정(데스크톱 좁은 창·화면 회전·태블릿 대응).
  - `useDevice()` — 클라이언트에서 현재 기기 읽기.
  - `DeviceSwitch mobile/desktop` — 서버 컴포넌트 페이지에서 기기별 전용 서브트리를 **하나만** 렌더.
- `layout.tsx` : `<html data-device=...>` + `DeviceProvider`로 앱 감쌈.
- 적용:
  - **PAGE 1 랜딩** : `LandingDesktop`(뷰포트 꽉 채운 히어로) / `LandingMobile`(이미지 위 세로 스택·전체폭 버튼) — `DeviceSwitch`.
  - **PAGE 2 조건** : `ConditionsDesktop`(p2.png 오버레이) / `ConditionsMobile`(흰 카드 스택) — `DeviceSwitch`.
  - **PAGE 4 카드** : `CardDeck`이 `useDevice()`로 분기 — 데스크톱 5열 그리드 / 모바일 **가로 스와이프 캐러셀(스냅+인디케이터)**.
- 검증: 동일 URL에 데스크톱/모바일 UA로 요청 시 **DOM 트리가 실제로 달라짐**(각 1개 히어로 이미지만 렌더). 두 트리 클래스가 원시 HTML에 함께 보이는 것은 RSC 페이로드(리사이즈 시 클라 전환용)일 뿐 visible DOM은 한쪽만.

**(2) 카카오톡 공유** (`DestinationActions.tsx`)
- 기존 "🔗 공유하기" → **"💬 카카오톡 공유"** 로 변경. 3단계 폴백:
  1. `NEXT_PUBLIC_KAKAO_JS_KEY` 설정 시 → Kakao JS SDK(2.7.4) 동적 로드 → `Kakao.Share.sendDefault({objectType:"feed"})`. 대표 이미지는 `origin/p1.png`.
  2. 미설정/실패 시 → **Web Share API**(모바일 네이티브 공유 시트에 카카오톡 포함).
  3. 그것도 없으면 → **링크 클립보드 복사**("✅ 링크 복사됨").
- **키 설정**: `.env.local`에 `NEXT_PUBLIC_KAKAO_JS_KEY=발급받은_JS키`. Kakao Developers → [플랫폼 > Web]에 배포 도메인(`https://deepbot-liart.vercel.app`) 등록 필수. Vercel은 프로젝트 Environment Variables에 동일 키 추가. (`.env.local.example` 참고)
- 이미지 저장(1080×1080 Canvas 공유 카드)은 그대로 유지.
