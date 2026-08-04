import { useEffect, useState } from "react";
import { preloadAdventureImage } from "../lib/adventureAssets";

/** 이미지 로드 상태 — 고정 aspect/fallback용 */
export function usePreloadedImage(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    setFailed(false);

    preloadAdventureImage(src).then(() => {
      if (!alive) return;
      // preload 성공해도 실제 decode 실패 가능 → probe
      const probe = new Image();
      probe.onload = () => {
        if (alive) setLoaded(true);
      };
      probe.onerror = () => {
        if (alive) setFailed(true);
      };
      probe.src = src;
    });

    return () => {
      alive = false;
    };
  }, [src]);

  return { loaded, failed, src };
}
