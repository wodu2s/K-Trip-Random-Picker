import { useId } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

import mapImage from "../../assets/korea-expedition-map.png";
import "./KoreaExpeditionMap.css";

export type KoreaMapCityId = "seoul" | "gangneung" | "busan" | "jeju";

type CityImportance = "primary" | "secondary";

type City = {
  id: KoreaMapCityId;
  name: string;
  englishName: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  labelAnchor: "start" | "middle" | "end";
  importance: CityImportance;
  delay: number;
};

type RouteImportance = "primary" | "secondary";

type Route = {
  id: string;
  from: KoreaMapCityId;
  to: KoreaMapCityId;
  path: string;
  importance: RouteImportance;
  duration: number;
  delay: number;
  showSignal: boolean;
};

type Orbit = {
  id: string;
  path: string;
  duration: number;
  delay: number;
};

export type KoreaExpeditionMapProps = {
  activeCityId?: KoreaMapCityId;
  interactive?: boolean;
  showLabels?: boolean;
  showAnimatedRoutes?: boolean;
  showOrbitLines?: boolean;
  onCitySelect?: (cityId: KoreaMapCityId) => void;
  className?: string;
  /**
   * softEdge — map image + edge fades (legacy landing helper).
   * overlayOnly — SVG routes/nodes only (used with LandingHeroMap plates).
   */
  variant?: "default" | "softEdge" | "overlayOnly";
  /** Optional high-res plate for softEdge */
  imageSrc?: string;
};

const CITIES: City[] = [
  {
    id: "seoul",
    name: "서울",
    englishName: "SEOUL",
    x: 546,
    y: 240,
    labelX: 574,
    labelY: 204,
    labelAnchor: "start",
    importance: "primary",
    delay: 0,
  },
  {
    id: "gangneung",
    name: "강릉",
    englishName: "GANGNEUNG",
    x: 864,
    y: 221,
    labelX: 904,
    labelY: 219,
    labelAnchor: "start",
    importance: "primary",
    delay: 0.9,
  },
  {
    id: "busan",
    name: "부산",
    englishName: "BUSAN",
    x: 829,
    y: 648,
    labelX: 884,
    labelY: 635,
    labelAnchor: "start",
    importance: "primary",
    delay: 1.8,
  },
  {
    id: "jeju",
    name: "제주",
    englishName: "JEJU",
    x: 456,
    y: 870,
    labelX: 507,
    labelY: 906,
    labelAnchor: "start",
    importance: "primary",
    delay: 2.7,
  },
];

const ROUTES: Route[] = [
  {
    id: "seoul-gangneung",
    from: "seoul",
    to: "gangneung",
    path: "M 546 240 C 650 215, 766 190, 864 221",
    importance: "primary",
    duration: 5.8,
    delay: 0,
    showSignal: true,
  },
  {
    id: "seoul-busan",
    from: "seoul",
    to: "busan",
    path: "M 546 240 C 673 315, 777 467, 829 648",
    importance: "primary",
    duration: 7.5,
    delay: 1.3,
    showSignal: true,
  },
  {
    id: "seoul-jeju",
    from: "seoul",
    to: "jeju",
    path: "M 546 240 C 748 410, 690 742, 456 870",
    importance: "secondary",
    duration: 10,
    delay: 3,
    showSignal: false,
  },
  {
    id: "gangneung-busan",
    from: "gangneung",
    to: "busan",
    path: "M 864 221 C 932 346, 909 521, 829 648",
    importance: "secondary",
    duration: 7.5,
    delay: 2.1,
    showSignal: false,
  },
  {
    id: "gangneung-jeju",
    from: "gangneung",
    to: "jeju",
    path: "M 864 221 C 868 485, 706 764, 456 870",
    importance: "secondary",
    duration: 11,
    delay: 4.5,
    showSignal: false,
  },
  {
    id: "busan-jeju",
    from: "busan",
    to: "jeju",
    path: "M 829 648 C 748 770, 620 848, 456 870",
    importance: "primary",
    duration: 7.2,
    delay: 0.8,
    showSignal: true,
  },
];

const ORBITS: Orbit[] = [
  {
    id: "orbit-upper",
    path: "M 52 440 C 348 105, 1015 48, 1387 398",
    duration: 20,
    delay: 0,
  },
  {
    id: "orbit-lower",
    path: "M 90 765 C 418 1086, 1112 1048, 1392 676",
    duration: 25,
    delay: 1.5,
  },
];

const getNodeStyle = (delay: number): CSSProperties =>
  ({ "--node-delay": `${delay}s` }) as CSSProperties;

const getRouteStyle = (delay: number): CSSProperties =>
  ({ "--route-delay": `${delay}s` }) as CSSProperties;

const getOrbitStyle = (duration: number, delay: number): CSSProperties =>
  ({
    "--orbit-duration": `${duration}s`,
    "--orbit-delay": `${delay}s`,
  }) as CSSProperties;

export default function KoreaExpeditionMap({
  activeCityId,
  interactive = true,
  showLabels = true,
  showAnimatedRoutes = true,
  showOrbitLines = true,
  onCitySelect,
  className = "",
  variant = "default",
  imageSrc,
}: KoreaExpeditionMapProps) {
  const rawId = useId();
  const instanceId = rawId.replace(/:/g, "");
  const softEdge = variant === "softEdge";
  const overlayOnly = variant === "overlayOnly";
  const plateSrc = imageSrc ?? mapImage;

  const handleCitySelect = (cityId: KoreaMapCityId) => {
    if (!interactive) return;
    onCitySelect?.(cityId);
  };

  const handleCityKeyDown = (event: KeyboardEvent<SVGGElement>, cityId: KoreaMapCityId) => {
    if (!interactive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCitySelect(cityId);
    }
  };

  const isConnectedToActiveCity = (route: Route) => {
    if (!activeCityId) return false;
    return route.from === activeCityId || route.to === activeCityId;
  };

  return (
    <div
      className={[
        "korea-expedition-map",
        softEdge ? "korea-expedition-map--soft-edge" : "",
        overlayOnly ? "korea-expedition-map--overlay-only" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="대한민국 여행 네트워크 지도"
    >
      {!overlayOnly ? (
        <img
          src={plateSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="korea-expedition-map__image"
        />
      ) : null}

      {softEdge ? (
        <>
          <div aria-hidden="true" className="korea-expedition-map__edge korea-expedition-map__edge--l" />
          <div aria-hidden="true" className="korea-expedition-map__edge korea-expedition-map__edge--r" />
          <div aria-hidden="true" className="korea-expedition-map__edge korea-expedition-map__edge--t" />
          <div aria-hidden="true" className="korea-expedition-map__edge korea-expedition-map__edge--b" />
        </>
      ) : null}

      {!softEdge && !overlayOnly ? (
        <div aria-hidden="true" className="korea-expedition-map__vignette" />
      ) : null}

      <svg
        className="korea-expedition-map__overlay"
        viewBox="0 0 1448 1086"
        preserveAspectRatio={overlayOnly || softEdge ? "xMidYMid slice" : "xMidYMid meet"}
        role="img"
        aria-label="서울, 강릉, 부산, 제주를 연결하는 여행 경로"
      >
        <defs>
          <filter id={`${instanceId}-route-glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={`${instanceId}-node-glow`} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="nodeBlur" />
            <feMerge>
              <feMergeNode in="nodeBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id={`${instanceId}-node-gradient`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbed" />
            <stop offset="34%" stopColor="#e9d29a" />
            <stop offset="72%" stopColor="#b99152" />
            <stop offset="100%" stopColor="#76552f" />
          </radialGradient>
        </defs>

        {showOrbitLines ? (
          <g className="korea-expedition-map__orbits" aria-hidden="true">
            {ORBITS.map((orbit, index) => (
              <path
                key={orbit.id}
                d={orbit.path}
                pathLength={1}
                vectorEffect="non-scaling-stroke"
                className={[
                  "korea-expedition-map__orbit",
                  index === 1 ? "korea-expedition-map__orbit--secondary" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={getOrbitStyle(orbit.duration, orbit.delay)}
              />
            ))}
          </g>
        ) : null}

        <g className="korea-expedition-map__routes" aria-hidden="true">
          {ROUTES.map((route, index) => {
            const connected = isConnectedToActiveCity(route);
            const dimmed = Boolean(activeCityId) && !connected;
            const pathId = `${instanceId}-${route.id}`;

            return (
              <path
                id={pathId}
                key={route.id}
                d={route.path}
                pathLength={1}
                vectorEffect="non-scaling-stroke"
                style={getRouteStyle(0.25 + index * 0.16)}
                className={[
                  "korea-expedition-map__route",
                  `korea-expedition-map__route--${route.importance}`,
                  connected ? "is-active" : "",
                  dimmed ? "is-dimmed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          })}
        </g>

        {showAnimatedRoutes ? (
          <g className="korea-expedition-map__signals" aria-hidden="true">
            {ROUTES.filter((route) => route.showSignal).map((route) => {
              const pathId = `${instanceId}-${route.id}`;

              return (
                <circle
                  key={`signal-${route.id}`}
                  r={route.importance === "primary" ? 3.3 : 2.4}
                  className={[
                    "korea-expedition-map__signal",
                    `korea-expedition-map__signal--${route.importance}`,
                  ].join(" ")}
                  filter={`url(#${instanceId}-route-glow)`}
                >
                  <animateMotion
                    dur={`${route.duration}s`}
                    begin={`${route.delay}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                    calcMode="spline"
                    keyTimes="0;1"
                    keySplines="0.45 0 0.55 1"
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              );
            })}
          </g>
        ) : null}

        <g className="korea-expedition-map__nodes">
          {CITIES.map((city) => {
            const active = activeCityId === city.id;
            const dimmed = Boolean(activeCityId) && !active;
            const primary = city.importance === "primary";

            return (
              <g
                key={city.id}
                transform={`translate(${city.x} ${city.y})`}
                style={getNodeStyle(city.delay)}
                className={[
                  "korea-expedition-map__node",
                  primary
                    ? "korea-expedition-map__node--primary"
                    : "korea-expedition-map__node--secondary",
                  active ? "is-active" : "",
                  dimmed ? "is-dimmed" : "",
                  interactive ? "is-interactive" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={`${city.name} 여행지 선택`}
                aria-pressed={interactive ? active : undefined}
                onClick={() => handleCitySelect(city.id)}
                onKeyDown={(event) => handleCityKeyDown(event, city.id)}
              >
                <circle
                  r="19"
                  className={[
                    "korea-expedition-map__node-wave",
                    "korea-expedition-map__node-wave--outer",
                  ].join(" ")}
                />
                <circle
                  r="13"
                  className={[
                    "korea-expedition-map__node-wave",
                    "korea-expedition-map__node-wave--inner",
                  ].join(" ")}
                />
                <circle r="16" className="korea-expedition-map__node-ring" />
                <circle
                  r="10"
                  className={[
                    "korea-expedition-map__node-ring",
                    "korea-expedition-map__node-ring--small",
                  ].join(" ")}
                />
                <circle
                  r="5.8"
                  fill={`url(#${instanceId}-node-gradient)`}
                  filter={`url(#${instanceId}-node-glow)`}
                  className="korea-expedition-map__node-core"
                />
                <circle r="2" className="korea-expedition-map__node-highlight" />
                <circle r="25" fill="transparent" className="korea-expedition-map__node-hit-area" />
              </g>
            );
          })}
        </g>

        {showLabels ? (
          <g className="korea-expedition-map__labels" aria-hidden="true">
            {CITIES.map((city) => (
              <text
                key={`label-${city.id}`}
                x={city.labelX}
                y={city.labelY}
                textAnchor={city.labelAnchor}
                className={[
                  "korea-expedition-map__label",
                  activeCityId === city.id ? "is-active" : "",
                  activeCityId && activeCityId !== city.id ? "is-dimmed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {city.name}
              </text>
            ))}
          </g>
        ) : null}
      </svg>

      {!softEdge ? (
        <>
          <div aria-hidden="true" className="korea-expedition-map__tone" />
          <div aria-hidden="true" className="korea-expedition-map__grain" />
        </>
      ) : null}
    </div>
  );
}
