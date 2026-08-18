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
import { prefetchPool, fetchDestinationPool } from "../api/tour";
import { preloadConditionsAssets } from "../lib/adventureAssets";
import type {
  CompanionKey,
  DiscoveryKey,
  Duration,
  FlowPage,
  MoodKey,
  MysteryCardData,
  ThemeKey,
} from "../types/travel";

type TravelState = {
  page: FlowPage;
  duration: Duration | null;
  themes: ThemeKey[];
  companion: CompanionKey | null;
  mood: MoodKey | null;
  discovery: DiscoveryKey | null;
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
  setCompanion: (c: CompanionKey) => void;
  setMood: (m: MoodKey) => void;
  setDiscovery: (d: DiscoveryKey) => void;
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
  companion: null,
  mood: null,
  discovery: null,
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
    // 조건 선택 동안 실데이터 여행지 풀을 미리 채운다 (실패 시 mock 폴백)
    void prefetchPool();
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

  const setCompanion = useCallback((companion: CompanionKey) => {
    setState((s) => ({ ...s, companion }));
  }, []);

  const setMood = useCallback((mood: MoodKey) => {
    setState((s) => ({ ...s, mood }));
  }, []);

  const setDiscovery = useCallback((discovery: DiscoveryKey) => {
    setState((s) => ({ ...s, discovery }));
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
        cards: recommendCards(s.themes, {
          companion: s.companion,
          mood: s.mood,
          discovery: s.discovery,
        }),
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
    // 다시 뽑기 때마다 풀을 조금씩 키워 변화를 준다 (비차단)
    void fetchDestinationPool();
    setState((s) => {
      const recommendOptions = { companion: s.companion, mood: s.mood, discovery: s.discovery };
      const prevKey = s.cards.map((c) => c.destinationId).join(",");
      let next = recommendCards(s.themes, recommendOptions);
      for (let i = 0; i < 6 && next.map((c) => c.destinationId).join(",") === prevKey; i++) {
        next = recommendCards(s.themes, recommendOptions);
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
      companion: s.companion,
      mood: s.mood,
      discovery: s.discovery,
    }));
  }, []);

  const value = useMemo<TravelContextValue>(
    () => ({
      ...state,
      goToLanding,
      goToConditions,
      setDuration,
      toggleTheme,
      setCompanion,
      setMood,
      setDiscovery,
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
      setCompanion,
      setMood,
      setDiscovery,
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
