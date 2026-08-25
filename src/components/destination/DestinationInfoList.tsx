import { CalendarX, CircleDollarSign, Clock3, Phone, SquareParking } from "lucide-react";
import type { DestinationInfo } from "../../types/travel";

/** 관광공사 detailIntro2 항목 → 표시 순서·라벨·아이콘 */
const ROWS = [
  { key: "usetime", label: "운영 시간", Icon: Clock3 },
  { key: "restdate", label: "휴무일", Icon: CalendarX },
  { key: "fee", label: "이용 요금", Icon: CircleDollarSign },
  { key: "parking", label: "주차", Icon: SquareParking },
  { key: "infocenter", label: "문의", Icon: Phone },
] as const satisfies readonly { key: keyof DestinationInfo; label: string; Icon: unknown }[];

/**
 * 이용 정보 — KTO에는 평점·리뷰가 없어 실제 방문에 필요한 값으로 대체한다.
 * 값이 없는 항목은 줄 자체를 렌더하지 않는다.
 */
export function DestinationInfoList({ info }: { info: DestinationInfo }) {
  const rows = ROWS.filter((r) => info[r.key]);
  if (rows.length === 0) return null;

  return (
    <section>
      <p className="font-expedition mb-1 text-[11px] font-bold tracking-[0.16em] text-brass">
        FIELD NOTES
      </p>
      <h2 className="font-expedition mb-1 text-lg font-bold text-ink">이용 정보</h2>
      <p className="mb-4 text-sm text-muted">한국관광공사 제공 정보예요.</p>

      <dl className="divide-y divide-brass/20 overflow-hidden rounded-[12px] border border-brass/30 bg-[var(--color-parchment-100)]">
        {rows.map(({ key, label, Icon }) => (
          <div key={key} className="flex gap-3 px-4 py-3">
            <dt className="flex w-[92px] shrink-0 items-start gap-1.5 text-xs font-semibold text-muted">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" strokeWidth={2.2} aria-hidden="true" />
              {label}
            </dt>
            <dd className="text-sm leading-relaxed text-ink">{info[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
