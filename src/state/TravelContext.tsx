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
import { fetchRecommendations } from "../lib/api";
import { registerDestinations } from "../data/destinations";
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
  startShuffle: () => Promise<void>;
  finishShuffle: () => void;
  reorderCards: (cards: MysteryCardData[]) => void;
  selectCard: (cardId: string, destinationId: string) => void;
  clearSelection: () => void;
  goToDestination: () => void;
  redraw: () => Promise<void>;
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
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    scrollTop();
  }, [state.page]);

  /**
   * 조건값으로 카드 5장을 만든다.
   * 백엔드(KTO) 추천을 우선 사용하고, 호출이 실패할 때만 로컬 mock으로 대체한다.
   */
  const drawCards = useCallback(async (s: TravelState): Promise<MysteryCardData[]> => {
    try {
      const destinations = await fetchRecommendations({
        duration: s.duration,
        themes: s.themes,
        companion: s.companion,
        mood: s.mood,
        discovery: s.discovery,
      });
      registerDestinations(destinations);
      return destinations.slice(0, 5).map((d, i) => ({
        id: `card-${i + 1}-${d.id}`,
        destinationId: d.id,
      }));
    } catch (err) {
      console.warn("[recommend] API 실패 — 로컬 데이터로 대체합니다.", err);
      return recommendCards(s.themes, {
        companion: s.companion,
        mood: s.mood,
        discovery: s.discovery,
      });
    }
  }, []);

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
  const startShuffle = useCallback(async () => {
    if (shuffleLock.current) return;
    const s = stateRef.current;
    if (!s.duration || s.themes.length === 0) return;

    shuffleLock.current = true;
    const cards = await drawCards(s);
    setState((prev) => ({
      ...prev,
      page: "cards",
      cards,
      selectedCardId: null,
      revealedDestinationId: null,
      deckGeneration: prev.deckGeneration + 1,
    }));
  }, [drawCards]);

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

  const redraw = useCallback(async () => {
    shuffleLock.current = false;
    const s = stateRef.current;
    const prevKey = s.cards.map((c) => c.destinationId).join(",");

    let next = await drawCards(s);
    if (next.map((c) => c.destinationId).join(",") === prevKey) {
      next = await drawCards(s);
    }

    setState((prev) => ({
      ...prev,
      page: "cards",
      cards: next,
      selectedCardId: null,
      revealedDestinationId: null,
      deckGeneration: prev.deckGeneration + 1,
    }));
  }, [drawCards]);

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
