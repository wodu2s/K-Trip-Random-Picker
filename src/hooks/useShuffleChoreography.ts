import { useEffect, useRef, useState } from "react";
import type { CardPhase } from "../types/travel";
import {
  SHUFFLE_TIMING_MS,
  SHUFFLE_TIMING_REDUCED_MS,
  shuffleWaitMs,
  wait,
} from "../lib/cardMotion";

/**
 * 셔플 타이밍과 phase 전환을 관리한다.
 * CardsPage / CardDrawStage는 반환된 phase를 단일 상태 원천으로 사용한다.
 */
export function useShuffleChoreography(deckKey: number, reduce: boolean) {
  const [phase, setPhase] = useState<CardPhase>("ready");
  const [mixStep, setMixStep] = useState<0 | 1>(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setMixStep(0);
    setPhase("ready");

    const run = async () => {
      try {
        if (reduce) {
          setPhase("gathering");
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.gathering, true), ac.signal);
          setPhase("crossing");
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.crossing, true), ac.signal);
          setPhase("restacking");
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.restacking, true), ac.signal);
          setPhase("selectable");
          return;
        }

        await wait(SHUFFLE_TIMING_MS.ready, ac.signal);

        setPhase("gathering");
        await wait(SHUFFLE_TIMING_MS.gathering, ac.signal);

        setPhase("fanOut");
        await wait(SHUFFLE_TIMING_MS.fanOut, ac.signal);

        setPhase("crossing");
        await wait(SHUFFLE_TIMING_MS.crossing, ac.signal);

        setPhase("mixing");
        setMixStep(0);
        await wait(SHUFFLE_TIMING_MS.mixingHalf, ac.signal);
        setMixStep(1);
        await wait(SHUFFLE_TIMING_MS.mixingHalf, ac.signal);

        setPhase("restacking");
        await wait(SHUFFLE_TIMING_MS.restacking, ac.signal);

        setPhase("selectable");
      } catch {
        /* aborted */
      }
    };

    void run();
    return () => ac.abort();
  }, [deckKey, reduce]);

  return { phase, mixStep, setPhase };
}
