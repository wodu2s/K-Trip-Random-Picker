import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { recommendCards } from "../lib/recommend";
import { preloadConditionsAssets } from "../lib/adventureAssets";
import type { Duration, FlowPage, MysteryCardData, ThemeKey } from "../types/travel";

type TravelState = {
  page: FlowPage;
  duration: Duration | null;
  themes: ThemeKey[];
  cards: MysteryCardData[];
  selectedCardId: string | null;
  revealedDestinationId: string | null;
  /** 다시 뽑기·재시작 시 카드 스테이지를 완전 리마운트하기 위한 세대 */
  deckGeneration: number;
};

type TravelActions = {
  goToLanding: () => void;
  goToConditions: () => void;
  setDuration: (d: Duration) => void;
  toggleTheme: (theme: ThemeKey) => void;
  startShuffle: () => void;
  finishShuffle: () => void;
  reorderCards: (cards: MysteryCardData[]) => void;
  selectCard: (cardId: string, destinationId: string) => void;
  clearSelection: () => void;
  goToDestination: () => void;
  redraw: () => void;
  restart: () => void;
};

type TravelContextValue = TravelState & TravelActions;

const initialState: TravelState = {
  page: "landing",
  duration: null,
  themes: [],
  cards: [],
  selectedCardId: null,
  revealedDestinationId: null,
  deckGeneration: 0,
};

const TravelContext = createContext<TravelContextValue | null>(null);

function scrollTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function TravelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TravelState>(initialState);
  const shuffleLock = useRef(false);

  useEffect(() => {
    scrollTop();
  }, [state.page]);

  const goToLanding = useCallback(() => {
    shuffleLock.current = false;
    setState(initialState);
  }, []);

  const goToConditions = useCallback(() => {
    shuffleLock.current = false;
    preloadConditionsAssets();
    setState((s) => ({
      ...s,
      page: "conditions",
      selectedCardId: null,
      revealedDestinationId: null,
    }));
  }, []);

  const setDuration = useCallback((duration: Duration) => {
    setState((s) => ({ ...s, duration }));
  }, []);

  const toggleTheme = useCallback((theme: ThemeKey) => {
    setState((s) => ({
      ...s,
      themes: s.themes.includes(theme) ? s.themes.filter((t) => t !== theme) : [...s.themes, theme],
    }));
  }, []);

  /** 조건 → 카드 드로우(셔플+선택 통합). 중복 진입 잠금. */
  const startShuffle = useCallback(() => {
    if (shuffleLock.current) return;
    shuffleLock.current = true;
    setState((s) => {
      if (!s.duration || s.themes.length === 0) {
        shuffleLock.current = false;
        return s;
      }
      return {
        ...s,
        page: "cards",
        cards: recommendCards(s.themes),
        selectedCardId: null,
        revealedDestinationId: null,
        deckGeneration: s.deckGeneration + 1,
      };
    });
  }, []);

  const finishShuffle = useCallback(() => {
    shuffleLock.current = false;
    setState((s) => ({ ...s, page: "cards" }));
  }, []);

  const reorderCards = useCallback((cards: MysteryCardData[]) => {
    setState((s) => ({ ...s, cards }));
  }, []);

  const selectCard = useCallback((cardId: string, destinationId: string) => {
    setState((s) => {
      if (s.selectedCardId) return s;
      return { ...s, selectedCardId: cardId, revealedDestinationId: destinationId };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((s) => ({ ...s, selectedCardId: null, revealedDestinationId: null }));
  }, []);

  const goToDestination = useCallback(() => {
    shuffleLock.current = false;
    setState((s) => (s.revealedDestinationId ? { ...s, page: "destination" } : s));
  }, []);

  const redraw = useCallback(() => {
    shuffleLock.current = false;
    setState((s) => {
      const prevKey = s.cards.map((c) => c.destinationId).join(",");
      let next = recommendCards(s.themes);
      for (let i = 0; i < 6 && next.map((c) => c.destinationId).join(",") === prevKey; i++) {
        next = recommendCards(s.themes);
      }
      return {
        ...s,
        page: "cards",
        cards: next,
        selectedCardId: null,
        revealedDestinationId: null,
        deckGeneration: s.deckGeneration + 1,
      };
    });
  }, []);

  const restart = useCallback(() => {
    shuffleLock.current = false;
    setState((s) => ({
      ...initialState,
      page: "conditions",
      duration: s.duration,
      themes: s.themes,
    }));
  }, []);

  const value = useMemo<TravelContextValue>(
    () => ({
      ...state,
      goToLanding,
      goToConditions,
      setDuration,
      toggleTheme,
      startShuffle,
      finishShuffle,
      reorderCards,
      selectCard,
      clearSelection,
      goToDestination,
      redraw,
      restart,
    }),
    [
      state,
      goToLanding,
      goToConditions,
      setDuration,
      toggleTheme,
      startShuffle,
      finishShuffle,
      reorderCards,
      selectCard,
      clearSelection,
      goToDestination,
      redraw,
      restart,
    ],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}

export function useTravel(): TravelContextValue {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error("useTravel은 TravelProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
