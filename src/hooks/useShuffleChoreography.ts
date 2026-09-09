import { useCallback, useEffect, useRef, useState } from "react";
import type { MixStep } from "../lib/cardLayout";
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
  const [mixStep, setMixStep] = useState<MixStep>(0);
  const abortRef = useRef<AbortController | null>(null);

  const runShuffle = useCallback(
    async (signal: AbortSignal) => {
      try {
        if (reduce) {
          setPhase("gathering");
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.gathering, true), signal);
          setPhase("crossing");
          /* 컷 중간 상태를 건너뛰고 재결합한 stack만 보여준다 */
          setMixStep(3);
          await wait(shuffleWaitMs(SHUFFLE_TIMING_REDUCED_MS.crossing, true), signal);
          setPhase("selectable");
          return;
        }

        /* fan → 중앙 stack 220 → double-cut 500(125 × 4) → fan-out 400 */
        setPhase("gathering");
        await wait(SHUFFLE_TIMING_MS.gathering, signal);

        setPhase("crossing");
        for (const step of [0, 1, 2, 3] as const) {
          setMixStep(step);
          await wait(SHUFFLE_TIMING_MS.crossingStep, signal);
        }

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
