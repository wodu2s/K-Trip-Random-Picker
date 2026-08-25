/**
 * TourAPI addr1(전체 주소) → 표시용 지역명("시도 시군구") 정규화.
 *
 * addr1은 "강원특별자치도 강릉시 창해로14번길 20-1"처럼 도로명까지 담고 있어
 * 카드·결과 화면에 그대로 쓰면 잘린다. 앞 두 토큰만 남기고 행정구역
 * 개편으로 길어진 명칭을 짧은 표기로 되돌린다.
 */

/** 특별자치도/광역시 등 긴 공식 명칭 → 표시용 짧은 명칭 */
const SIDO_ALIAS = {
  서울특별시: "서울시",
  부산광역시: "부산시",
  대구광역시: "대구시",
  인천광역시: "인천시",
  광주광역시: "광주시",
  대전광역시: "대전시",
  울산광역시: "울산시",
  세종특별자치시: "세종시",
  강원특별자치도: "강원도",
  전북특별자치도: "전라북도",
  제주특별자치도: "제주도",
  // 축약형으로 들어오는 경우도 정식 표기로 통일한다
  강원: "강원도",
  경기: "경기도",
  충북: "충청북도",
  충남: "충청남도",
  전북: "전라북도",
  전남: "전라남도",
  경북: "경상북도",
  경남: "경상남도",
  제주: "제주도",
  서울: "서울시",
  부산: "부산시",
  대구: "대구시",
  인천: "인천시",
  광주: "광주시",
  대전: "대전시",
  울산: "울산시",
  세종: "세종시",
};

/** 시군구가 따로 없어 시도 한 토큰으로 끝나는 지역 */
const SINGLE_TOKEN_SIDO = new Set(["세종시"]);

/** 두 번째 토큰이 시군구인지 (동/읍/면/리나 도로명이 따라오는 것을 걸러낸다) */
function isSigungu(token) {
  return /(시|군|구)$/.test(token);
}

/**
 * addr1을 "시도 시군구"로 줄인다.
 * @param {string} addr1 TourAPI addr1 (없거나 형식이 어긋나면 fallback 사용)
 * @param {string} fallback addr1을 못 쓸 때 사용할 지역명 (보통 areacode 기준 시도명)
 * @returns {string}
 */
export function normalizeRegion(addr1, fallback = "전국") {
  const tokens = String(addr1 ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // addr1을 못 쓰면 폴백(보통 areacode 기준 축약 시도명)도 같은 표기로 맞춘다
  if (tokens.length === 0) return SIDO_ALIAS[fallback] ?? fallback;

  const sido = SIDO_ALIAS[tokens[0]] ?? tokens[0];

  // 세종시처럼 하위 시군구가 없는 경우
  if (SINGLE_TOKEN_SIDO.has(sido)) return sido;

  const second = tokens[1];
  if (!second || !isSigungu(second)) return sido;

  return `${sido} ${second}`;
}
