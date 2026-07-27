import { create } from "zustand";
import type {
  Duration,
  MysteryCardData,
  ThemeKey,
  TravelTime,
} from "@/types/travel";

type TravelState = {
  // 조건
  location: string | null;
  travelTime: TravelTime | null;
  duration: Duration | null;
  themes: ThemeKey[];

  // 카드 & 결과
  cards: MysteryCardData[];
  selectedCardId: string | null;
  revealedDestinationId: string | null;

  // 액션
  setLocation: (location: string | null) => void;
  setTravelTime: (t: TravelTime | null) => void;
  setDuration: (d: Duration | null) => void;
  toggleTheme: (theme: ThemeKey) => void;
  setCards: (cards: MysteryCardData[]) => void;
  selectCard: (cardId: string) => void;
  reveal: (destinationId: string) => void;
  reset: () => void;
};

const initialState = {
  location: "서울특별시 강남구", // 기본값 (프로토타입, "현재 위치 사용하기")
  travelTime: null,
  duration: null,
  themes: [] as ThemeKey[],
  cards: [] as MysteryCardData[],
  selectedCardId: null,
  revealedDestinationId: null,
};

/**
 * 전역 여행 흐름 상태.
 * 조건 선택 → 카드 세팅 → 카드 선택 → 여행지 공개까지의 데이터를 보관한다.
 * (세부 로직 — 필터링/랜덤 뽑기 — 은 후속 단계에서 페이지와 함께 채운다.)
 */
export const useTravelStore = create<TravelState>((set) => ({
  ...initialState,

  setLocation: (location) => set({ location }),
  setTravelTime: (travelTime) => set({ travelTime }),
  setDuration: (duration) => set({ duration }),
  toggleTheme: (theme) =>
    set((s) => ({
      themes: s.themes.includes(theme)
        ? s.themes.filter((t) => t !== theme)
        : [...s.themes, theme],
    })),
  setCards: (cards) => set({ cards, selectedCardId: null }),
  selectCard: (selectedCardId) => set({ selectedCardId }),
  reveal: (revealedDestinationId) => set({ revealedDestinationId }),
  reset: () => set({ ...initialState }),
}));
