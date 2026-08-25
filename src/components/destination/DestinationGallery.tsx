import { useState } from "react";

/**
 * detailImage2로 받은 추가 사진.
 * 로드에 실패한 URL은 목록에서 빼서 깨진 이미지를 남기지 않는다.
 */
export function DestinationGallery({ images, name }: { images: string[]; name: string }) {
  const [broken, setBroken] = useState<string[]>([]);
  const usable = images.filter((src) => !broken.includes(src));
  if (usable.length === 0) return null;

  return (
    <section>
      <p className="font-expedition mb-1 text-[11px] font-bold tracking-[0.16em] text-brass">
        FIELD PHOTOS
      </p>
      <h2 className="font-expedition mb-1 text-lg font-bold text-ink">현장 사진</h2>
      <p className="mb-4 text-sm text-muted">한국관광공사가 제공한 {usable.length}장의 사진이에요.</p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {usable.map((src) => (
          <li
            key={src}
            className="overflow-hidden rounded-[12px] border border-brass/30 shadow-[0_8px_20px_rgba(22,40,31,0.08)]"
          >
            <img
              src={src}
              alt={`${name} 현장 사진`}
              loading="lazy"
              className="h-[140px] w-full object-cover"
              onError={() => setBroken((prev) => [...prev, src])}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
