import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * 배경의 먼 산·바다 레이어에 아주 미세한 패럴랙스(2~6px)를 준다.
 * 데스크톱은 마우스 이동, 모바일은 스크롤 위치를 기준으로 계산하며
 * prefers-reduced-motion이면 항상 {x:0, y:0}을 반환한다.
 */
export function useParallax(range = 5): { x: number; y: number } {
  const reduce = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce) {
      setOffset({ x: 0, y: 0 });
      return undefined;
    }

    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setOffset({ x: nx * range * 2, y: ny * range * 2 });
    };
    const onScroll = () => {
      const ny = Math.min(1, window.scrollY / 600) - 0.5;
      setOffset((prev) => ({ x: prev.x, y: ny * range * 2 }));
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduce, range]);

  return offset;
}
