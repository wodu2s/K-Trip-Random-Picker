import { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

export interface ValidatedImage {
  /** 메인 표시용 URL (고화질 우선) */
  mainUrl: string;
  /** 썸네일 표시용 URL */
  thumbUrl: string;
  width: number;
  height: number;
}

export interface DestinationImageGalleryProps {
  validImages: ValidatedImage[];
  title: string;
}

export default function DestinationImageGallery({ validImages, title }: DestinationImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [validImages]);

  // 배열 범위 보정
  const safeIndex = activeIndex >= validImages.length ? 0 : activeIndex;

  // 2장 미만이면 숨김
  if (validImages.length < 2) return null;

  const activeImage = validImages[safeIndex] ?? validImages[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <ImageIcon size={18} className="text-sky-500" />
          사진으로 미리 보기
        </h3>
        <span className="text-[0.6rem] text-slate-400 font-medium">관광공사 제공 이미지</span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-sky-100 bg-slate-50 aspect-[16/7] max-h-[320px]">
        <img
          src={activeImage.mainUrl}
          alt={`${title} 관광 이미지 ${safeIndex + 1}`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {validImages.map((img, index) => (
            <button
              key={`${img.thumbUrl}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                safeIndex === index
                  ? 'border-sky-400 ring-2 ring-sky-100'
                  : 'border-slate-100 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={img.thumbUrl}
                alt={`${title} 썸네일 ${index + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
