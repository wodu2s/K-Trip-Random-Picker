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
import {
  clearRecommendCache,
  hasApiCandidateCache,
  recommendCardsAsync,
  reshuffleCachedCards,
} from "../lib/recommend";
import { clearRecommendedDestinations } from "../data/destinations";
import { preloadConditionsAssets } from "../lib/adventureAssets";
import { useGeolocation } from "../hooks/useGeolocation";
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
  recommendationLoading: boolean;
  recommendationError: string | null;
  usedSampleFallback: boolean;
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
  recommendationLoading: false,
  recommendationError: null,
  usedSampleFallback: false,
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
  stateRef.current = state;

  const geo = useGeolocation(true);

  useEffect(() => {
    scrollTop();
  }, [state.page]);

  const geoCoords = useCallback(() => {
    if (geo.status !== "success" || geo.latitude == null || geo.longitude == null) return null;
    return { latitude: geo.latitude, longitude: geo.longitude };
  }, [geo.latitude, geo.longitude, geo.status]);

  const goToLanding = useCallback(() => {
    shuffleLock.current = false;
    clearRecommendCache();
    clearRecommendedDestinations();
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
      recommendationError: null,
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

  /** 조건 → TourAPI 후보 → 카드 드로우. 중복 진입 잠금. */
  const startShuffle = useCallback(() => {
    if (shuffleLock.current) return;
    const snapshot = stateRef.current;
    if (!snapshot.duration || snapshot.themes.length === 0) return;

    shuffleLock.current = true;
    setState((s) => ({
      ...s,
      recommendationLoading: true,
      recommendationError: null,
    }));

    const recommendOptions = {
      companion: snapshot.companion,
      mood: snapshot.mood,
      discovery: snapshot.discovery,
    };

    void recommendCardsAsync(snapshot.themes, recommendOptions, geoCoords(), {
      reuseCache: hasApiCandidateCache(),
    })
      .then((result) => {
        if (result.cards.length === 0) {
          shuffleLock.current = false;
          setState((s) => ({
            ...s,
            recommendationLoading: false,
            recommendationError: result.errorMessage ?? "추천 후보를 만들지 못했습니다.",
          }));
          return;
        }
        setState((s) => ({
          ...s,
          page: "cards",
          cards: result.cards,
          selectedCardId: null,
          revealedDestinationId: null,
          deckGeneration: s.deckGeneration + 1,
          recommendationLoading: false,
          recommendationError: null,
          usedSampleFallback: !result.fromApi,
        }));
        shuffleLock.current = false;
      })
      .catch(() => {
        shuffleLock.current = false;
        setState((s) => ({
          ...s,
          recommendationLoading: false,
          recommendationError: "추천 요청 중 오류가 발생했습니다.",
        }));
      });
  }, [geoCoords]);

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
    if (shuffleLock.current) return;
    const snapshot = stateRef.current;
    shuffleLock.current = true;
    setState((s) => ({ ...s, recommendationLoading: true, recommendationError: null }));

    const recommendOptions = {
      companion: snapshot.companion,
      mood: snapshot.mood,
      discovery: snapshot.discovery,
    };
    const prevKey = snapshot.cards.map((c) => c.destinationId).join(",");

    const cached = reshuffleCachedCards(snapshot.themes, recommendOptions, prevKey);
    if (cached && cached.cards.length > 0) {
      setState((s) => ({
        ...s,
        page: "cards",
        cards: cached.cards,
        selectedCardId: null,
        revealedDestinationId: null,
        deckGeneration: s.deckGeneration + 1,
        recommendationLoading: false,
        recommendationError: null,
        usedSampleFallback: !cached.fromApi,
      }));
      shuffleLock.current = false;
      return;
    }

    void recommendCardsAsync(snapshot.themes, recommendOptions, geoCoords())
      .then((result) => {
        if (result.cards.length === 0) {
          shuffleLock.current = false;
          setState((s) => ({
            ...s,
            recommendationLoading: false,
            recommendationError: result.errorMessage ?? "다시 뽑기에 실패했습니다.",
          }));
          return;
        }
        setState((s) => ({
          ...s,
          page: "cards",
          cards: result.cards,
          selectedCardId: null,
          revealedDestinationId: null,
          deckGeneration: s.deckGeneration + 1,
          recommendationLoading: false,
          recommendationError: null,
          usedSampleFallback: !result.fromApi,
        }));
        shuffleLock.current = false;
      })
      .catch(() => {
        shuffleLock.current = false;
        setState((s) => ({
          ...s,
          recommendationLoading: false,
          recommendationError: "다시 뽑기에 실패했습니다.",
        }));
      });
  }, [geoCoords]);

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
