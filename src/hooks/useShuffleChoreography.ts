import { useCallback, useEffect, useRef, useState } from "react";
import type { CardPhase } from "../types/travel";
import {
  SHUFFLE_TIMING_MS,
  SHUFFLE_TIMING_REDUCED_MS,
  shuffleWaitMs,
  wait,
} from "../lib/cardMotion";

/**
 * 셔플 타이밍과 phase 전환을 관리한다.
 * autoStart=false이면 ready에서 대기하고 startShuffle()로 시작한다.
 */
export function useShuffleChoreography(
  deckKey: number,
  reduce: boolean,
  autoStart = false,
) {
  const [phase, setPhase] = useState<CardPhase>("ready");
  const [mixStep, setMixStep] = useState<0 | 1>(0);
  const abortRef = useRef<AbortController | null>(null);

  const runShuffle = useCallback(
    async (signal: AbortSignal) => {
      try {
        if (reduce) {
          setPhase("gathering");
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.gathering, true), signal);
          setPhase("crossing");
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.crossing, true), signal);
          setPhase("restacking");
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.restacking, true), signal);
          setPhase("selectable");
          return;
        }

        setPhase("gathering");
        await wait(SHUFFLE_TIMING_MS.gathering, signal);

        setPhase("crossing");
        await wait(SHUFFLE_TIMING_MS.crossing, signal);

        setPhase("mixing");
        setMixStep(0);
        await wait(SHUFFLE_TIMING_MS.mixingHalf, signal);
        setMixStep(1);
        await wait(SHUFFLE_TIMING_MS.mixingHalf, signal);

        setPhase("restacking");
        await wait(SHUFFLE_TIMING_MS.restacking, signal);

        setPhase("fanOut");
        await wait(SHUFFLE_TIMING_MS.fanOut, signal);

        setPhase("selectable");
      } catch {
        /* aborted */
      }
    },
    [reduce],
  );

  const startShuffle = useCallback(() => {
    if (phase !== "ready") return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    void runShuffle(ac.signal);
  }, [phase, runShuffle]);

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setMixStep(0);
    setPhase("ready");

    if (autoStart) {
      void (async () => {
        try {
          await wait(SHUFFLE_TIMING_MS.ready, ac.signal);
          await runShuffle(ac.signal);
        } catch {
          /* aborted */
        }
      })();
    }

    return () => ac.abort();
  }, [deckKey, reduce, autoStart, runShuffle]);

  return { phase, mixStep, setPhase, startShuffle };
}
