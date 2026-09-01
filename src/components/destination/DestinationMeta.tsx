import { Clock, MapPin } from "lucide-react";
import type { Destination } from "../../types/travel";

/** 지도 아래 — 주소·이동 시간만 compact. 없는 값은 빼다. */
export function DestinationMeta({ destination }: { destination: Destination }) {
  const { travelTimeText, address, region } = destination;
  const rows = [
    { title: "주소", value: address || region, icon: MapPin },
    { title: "이동 시간", value: travelTimeText, icon: Clock },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <dl className="plan__facts">
      {rows.map((r) => (
        <div key={r.title} className="plan__fact">
          <r.icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
          <div>
            <dt>{r.title}</dt>
            <dd>{r.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
