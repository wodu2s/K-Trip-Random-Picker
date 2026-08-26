import type { TourApiItem } from "../types/tourApi";
import type { ThemeKey } from "../types/travel";

/** 해안·섬 계열 cat3 (KorService2 서비스 분류) */
const SEA_CAT3 = new Set([
  "A01011100", // 해안절경
  "A01011200", // 해수욕장
  "A01011300", // 섬
  "A01011400", // 항구/포구
  "A01011500", // 등대
]);

const SEA_TITLE = /해수욕장|해변|해안|바닷가|섬\b|항구|포구|등대|바다/;
const NATURE_TITLE = /국립공원|도립공원|군립공원|휴양림|수목원|계곡|폭포|숲|산\b|공원/;
const HISTORY_TITLE = /사찰|유적|고궁|산성|향교|박물관|문화재|한옥|서원|릉|왕릉/;
const ACTIVITY_TITLE = /레포츠|스키|케이블카|래프팅|체험마을/;

function textOf(item: TourApiItem): string {
  return `${item.title ?? ""} ${item.addr1 ?? ""}`;
}

/**
 * TourAPI contenttypeid/cat1/cat2/cat3 → K-Trip ThemeKey.
 * vibe·local 은 공식 분류만으로 확정하기 어려워 이번 단계에서는 매핑하지 않는다.
 */
export function mapTourThemes(item: TourApiItem): ThemeKey[] {
  const themes = new Set<ThemeKey>();
  const contentType = (item.contenttypeid ?? "").trim();
  const cat1 = (item.cat1 ?? "").trim();
  const cat2 = (item.cat2 ?? "").trim();
  const cat3 = (item.cat3 ?? "").trim();
  const blob = textOf(item);

  if (contentType === "39" || cat1 === "A05") themes.add("food");
  if (contentType === "28" || cat1 === "A03") themes.add("activity");
  if (contentType === "14") themes.add("history");

  if (SEA_CAT3.has(cat3) || SEA_TITLE.test(blob)) themes.add("sea");

  if (cat1 === "A01") {
    if (!themes.has("sea")) themes.add("nature");
    else if (NATURE_TITLE.test(blob)) themes.add("nature");
  }

  if (cat1 === "A02" || cat2 === "A0201") themes.add("history");
  if (cat2 === "A0203") themes.add("activity");

  if (NATURE_TITLE.test(blob)) themes.add("nature");
  if (HISTORY_TITLE.test(blob)) themes.add("history");
  if (ACTIVITY_TITLE.test(blob)) themes.add("activity");

  if (themes.size === 0) themes.add("etc");
  return [...themes];
}
