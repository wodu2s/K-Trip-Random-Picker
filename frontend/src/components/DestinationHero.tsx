import { useState } from 'react';
import type { ReactNode } from 'react';
import { Destination } from '../types/destination';
import { getDestinationImageUrl, getHeroGradient, hasDestinationImage } from '../utils/image';
import DataSourceBadge from './DataSourceBadge';

interface DestinationHeroProps {
  destination: Destination;
  children?: ReactNode;
}

function HeroFallback({ destination }: { destination: Destination }) {
  const gradient = getHeroGradient(destination);

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 text-5xl opacity-40 pointer-events-none">
        {destination.emojiHints.slice(0, 4).map((emoji, i) => (
          <span key={i}>{emoji}</span>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
        <p className="text-white/90 text-sm font-bold tracking-widest uppercase mb-2">
          {destination.region}
        </p>
        <p className="text-white text-lg font-black">이미지 준비 중</p>
        {destination.themes.length > 0 && (
          <p className="text-white/80 text-sm font-medium mt-2">
            {destination.themes.map((t) => `#${t}`).join(' ')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DestinationHero({ destination, children }: DestinationHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = hasDestinationImage(destination) && !imageFailed;
  const imageUrl = getDestinationImageUrl(destination);

  return (
    <section className="relative h-[min(50vh,420px)] min-h-[280px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
      {showImage && imageUrl ? (
        <img
          src={imageUrl}
          alt={`${destination.title} 대표 이미지`}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <HeroFallback destination={destination} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-slate-900/40 to-slate-900/10 pointer-events-none" />
      {children}
    </section>
  );
}

export function DestinationHeroMeta({
  destination,
  actions,
  selectedTheme,
}: {
  destination: Destination;
  actions?: ReactNode;
  selectedTheme?: string;
}) {
  let displayThemes = [...destination.themes];

  if (selectedTheme) {
    const text = (destination.title + ' ' + (destination.summary || '') + ' ' + (destination.detail?.overview || '')).toLowerCase();
    
    if (selectedTheme === '바다' && /해변|바다|해안|해수욕장|항구|섬/.test(text)) {
      displayThemes = ['바다', '해변'];
      if (/노을|일몰/.test(text)) displayThemes.push('노을');
      else if (/사진|풍경/.test(text)) displayThemes.push('사진명소');
    } else if (selectedTheme === '자연' && /자연|산책|숲|공원|수목원|계곡|휴양림/.test(text)) {
      displayThemes = ['자연', '산책'];
    } else if (selectedTheme === '감성' && /감성|사진|카페|골목|마을|벽화|야경/.test(text)) {
      displayThemes = ['감성'];
      if (/야경/.test(text)) displayThemes.push('야경명소');
      else displayThemes.push('사진명소');
    } else if (selectedTheme === '문화' && /역사|유적|박물관|미술관|전시|전통|마을|한옥/.test(text)) {
      displayThemes = ['문화', '역사'];
    } else if (selectedTheme === '액티비티' && /체험|레포츠|액티비티|캠핑|카라반|자전거|테마파크/.test(text)) {
      displayThemes = ['액티비티', '체험'];
    }
  }
  return (
    <>
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="px-4 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/20 w-fit max-w-full">
            <span className="text-white text-xs font-black uppercase tracking-widest truncate block">
              {destination.region}
            </span>
          </div>
          <DataSourceBadge source={destination.dataSource} variant="hero" />
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>

      <div className="absolute bottom-8 left-8 right-8 z-10 space-y-2">
        <div className="flex flex-wrap gap-2">
          {displayThemes.slice(0, 3).map((t) => (
            <span
              key={t}
              className="badge-theme"
            >
              # {t}
            </span>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-md">
          {destination.title}
        </h1>
        <p className="text-white/90 text-base sm:text-lg font-medium max-w-2xl line-clamp-2 drop-shadow-sm">
          {destination.summary}
        </p>
      </div>
    </>
  );
}
