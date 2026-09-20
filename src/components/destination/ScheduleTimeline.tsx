import { motion } from "motion/react";
import type { ScheduleItem } from "../../types/travel";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type Stop = { key: string; day?: string; time: string; kind: string; title: string; stay?: boolean };

const PERIOD_CLOCK: Record<string, string> = {
  오전: "10:00",
  점심: "12:00",
  오후: "14:00",
  저녁: "16:00",
};

/** 시간대로 짧은 유형만 붙인다 (데이터는 그대로) */
function kindOf(period: string): string {
  if (period === "점심" || period === "저녁") return "식사";
  return "관광";
}

/**
 * 추천 코스 — 당일치기는 가로, 1박 2일은 세로 waypoint timeline.
 * 1박 2일이면 Day 1 관광 → 저녁 → 숙박 → Day 2 관광 순으로 잇는다.
 * 1박 여부는 조건에서 고른 기간(overnight)으로만 정한다 —
 * 주변 숙소를 못 찾았다고 해서 당일치기로 바뀌면 안 된다.
 */
export function ScheduleTimeline({
  schedule,
  overnight,
  stayName,
  day2Name,
}: {
  schedule: ScheduleItem[];
  overnight: boolean;
  stayName?: string;
  day2Name?: string;
}) {
  const reduce = useReducedMotion();

  /* 1박이면 Day 1은 오전·점심·저녁만 남겨 숙박/Day 2 자리를 만든다 */
  const evening = schedule.find((s) => s.period === "저녁");
  const day1 = overnight
    ? [schedule[0], schedule[1], evening ?? schedule[2]].filter(Boolean)
    : schedule.slice(0, 5);

  const stops: Stop[] = day1.map((item) => ({
    key: item.period,
    day: overnight ? "Day 1" : undefined,
    time: PERIOD_CLOCK[item.period] ?? item.period,
    kind: kindOf(item.period),
    title: item.title,
  }));

  if (overnight) {
    /* 숙소·Day 2 장소를 아직 못 받았어도 자리는 남긴다 (실제 장소명은 들어오면 채워진다) */
    stops.push({
      key: "stay",
      day: "숙박",
      time: "18:00",
      kind: "숙소",
      title: stayName ?? "근처 숙소에서 1박",
      stay: true,
    });
    stops.push({
      key: "day2",
      day: "Day 2",
      time: "10:00",
      kind: "관광",
      title: day2Name ?? "다음 날 주변 둘러보기",
    });
  }

  const visible = stops.slice(0, 5);

  return (
    <ol className={overnight ? "route-line" : "route-line route-line--row"}>
      {visible.map((stop, i) => (
        <motion.li
          key={stop.key}
          className={stop.stay ? "route-stop route-stop--stay" : "route-stop"}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
        >
          <span className="route-stop__node" aria-hidden="true">
            <span className="route-stop__dot" />
          </span>
          <div className="route-stop__body">
            {stop.day && stop.day !== visible[i - 1]?.day ? (
              <p className="route-stop__day">{stop.day}</p>
            ) : null}
            <p className="route-stop__meta">
              <span className="route-stop__time">{stop.time}</span>
              <span className="route-stop__kind">{stop.kind}</span>
            </p>
            <p className="route-stop__title">{stop.title}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
