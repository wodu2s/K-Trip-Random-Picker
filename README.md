# Pick&Go — 랜덤 국내여행 웹페이지

여행 기차를 출발시키면 3D 스타일의 대한민국 지도를 따라 기차가 랜덤 주행하며 여행 카드 5장을 모아오고,
사용자가 카드를 직접 섞고 한 장을 선택하면 오늘의 랜덤 여행지가 공개되는 반응형 웹 서비스입니다.

## 기술 스택

- React 19 + Vite + TypeScript (strict, `any` 미사용)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- [motion](https://motion.dev/) (`motion/react`)
- lucide-react
- SVG `path` + CSS 3D transform 기반의 지도/카드 연출 (Three.js 미사용)

## 시작하기

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint
```

## 폴더 구조

```
src/
  components/
    hero/           # Hero 섹션과 3D 지도 데코 아트
    map/            # SVG 지도/선로/기차 렌더링 로직
    interaction/    # 조건 설정 ~ 카드 셔플/선택/결과 핵심 인터랙션
    sections/       # 이용 방법 / 공개된 여행지 / 서비스 특징
    layout/         # Header / Footer / Section / Modal / Toast
  data/             # 여행지 목데이터, 조건 옵션
  hooks/            # 핵심 상태머신 (useJourney)
  types/            # 도메인 타입 정의
  utils/            # Fisher-Yates 셔플, 경로 계산 등 유틸
```

## 핵심 로직 메모

- 여행지 후보 5개는 `pickUniqueCandidates`로 조건(테마)에 맞는 풀에서 중복 없이 선택하며,
  후보가 5개 미만이면 전체 데이터에서 중복 없이 보충합니다.
- 카드 셔플은 Fisher-Yates 알고리즘(`fisherYatesShuffle`)으로 순서를 결정하고,
  결과는 `gather → split → interleave → merge → fan` 단계로 시각화됩니다.
- 랜덤 선택/셔플은 모두 사용자 이벤트 핸들러 내부에서만 실행되며, `useEffect`는 타이머 정리(cleanup)를
  철저히 수행해 React StrictMode의 이중 실행에도 결과가 중복되지 않도록 설계했습니다.
- 카드 선택 전에는 여행지명·지역명이 화면에 노출되지 않으며(카드 뒷면은 모든 카드가 동일한 디자인),
  선택 후 Y축 3D 플립으로 앞면이 공개됩니다.
