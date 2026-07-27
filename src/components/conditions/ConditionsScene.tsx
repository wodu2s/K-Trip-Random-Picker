/**
 * PAGE 2 오른쪽 비주얼.
 * 레퍼런스의 판타지 창문 이미지 대신, 브리프 요구대로
 * "현실적인 한국 소도시 / 한옥 마을 · 골든아워" 분위기를
 * 인라인 SVG 일러스트로 재구현한다. (이미지 파일 미사용)
 */
export function ConditionsScene({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-card shadow-card ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a9c8ec" />
            <stop offset="45%" stopColor="#f5d7ad" />
            <stop offset="78%" stopColor="#f6bd8a" />
            <stop offset="100%" stopColor="#f3a978" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff4d6" />
            <stop offset="55%" stopColor="#ffd98f" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffd98f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 하늘 */}
        <rect width="400" height="300" fill="url(#sky)" />

        {/* 해 + 글로우 */}
        <circle cx="278" cy="150" r="90" fill="url(#sunGlow)" />
        <circle cx="278" cy="150" r="30" fill="#ffe9b8" />

        {/* 먼 산 능선 (골든아워 실루엣, 뒤→앞) */}
        <path
          d="M0,170 Q70,128 140,158 T280,150 Q340,132 400,160 L400,300 L0,300 Z"
          fill="#c8afd0"
          opacity="0.55"
        />
        <path
          d="M0,192 Q90,150 170,182 T330,176 Q370,166 400,184 L400,300 L0,300 Z"
          fill="#b195bf"
          opacity="0.6"
        />

        {/* 강/수면 (햇빛 반사) */}
        <path
          d="M150,300 L205,205 Q212,200 219,205 L262,300 Z"
          fill="#f7e2b8"
          opacity="0.7"
        />

        {/* 근경 언덕 */}
        <path
          d="M0,222 Q120,196 240,220 T400,214 L400,300 L0,300 Z"
          fill="#8f6f8a"
          opacity="0.85"
        />

        {/* 한옥 마을 실루엣 (기와 곡선 처마) */}
        <g fill="#3f2f2a">
          {/* 뒤쪽 작은 지붕 2채 */}
          <RoofSilhouette cx={70} baseY={236} w={54} h={20} />
          <RoofSilhouette cx={128} baseY={240} w={48} h={17} />
          {/* 앞쪽 큰 지붕 */}
          <RoofSilhouette cx={100} baseY={266} w={92} h={30} />
          <RoofSilhouette cx={196} baseY={270} w={80} h={27} />
          {/* 3층 석탑(파고다) 실루엣 */}
          <g transform="translate(300,214)">
            <RoofSilhouette cx={0} baseY={20} w={40} h={12} />
            <RoofSilhouette cx={0} baseY={38} w={52} h={13} />
            <RoofSilhouette cx={0} baseY={58} w={64} h={15} />
            <rect x={-6} y={58} width={12} height={20} />
          </g>
        </g>

        {/* 골목 바닥 (따뜻한 빛) */}
        <rect x="0" y="288" width="400" height="12" fill="#5a4340" />

        {/* 새 두 마리 */}
        <path
          d="M320,70 q6,-6 12,0 q6,-6 12,0"
          fill="none"
          stroke="#5a4a63"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M345,88 q4,-4 8,0 q4,-4 8,0"
          fill="none"
          stroke="#5a4a63"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

/** 기와 곡선 처마 지붕 하나 (양끝이 살짝 들린 전통 지붕 실루엣) */
function RoofSilhouette({
  cx,
  baseY,
  w,
  h,
}: {
  cx: number;
  baseY: number;
  w: number;
  h: number;
}) {
  const half = w / 2;
  return (
    <path
      d={`M${cx - half},${baseY}
          Q${cx - half - 4},${baseY - 5} ${cx - half + 10},${baseY - h * 0.4}
          Q${cx},${baseY - h} ${cx + half - 10},${baseY - h * 0.4}
          Q${cx + half + 4},${baseY - 5} ${cx + half},${baseY}
          Z`}
    />
  );
}
