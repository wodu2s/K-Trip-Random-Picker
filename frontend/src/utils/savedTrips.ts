import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { getRecommendationType } from './recommendationType';
import { formatConditionSummary } from './conditionSummary';

const STORAGE_KEY = 'k_trip_saved_trips';
const LEGACY_FAVORITES_KEY = 'favorites';

export interface SavedTrip {
  id: string;
  destinationId: string;
  destination: Destination;
  prefs: TripFormState;
  savedAt: string;
  conditionSummary: string;
  recommendationType: string;
}

function readTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacyFavorites();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTrips(trips: SavedTrip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  localStorage.setItem(
    LEGACY_FAVORITES_KEY,
    JSON.stringify(trips.map((t) => t.destinationId)),
  );
}

function migrateLegacyFavorites(): SavedTrip[] {
  try {
    const legacy: string[] = JSON.parse(localStorage.getItem(LEGACY_FAVORITES_KEY) || '[]');
    return legacy.map((id) => ({
      id: `${id}-legacy`,
      destinationId: id,
      destination: {
        id,
        title: id,
        region: '저장된 여행지',
        themes: [],
        summary: '이전에 저장된 여행지입니다.',
        reasonBadges: [],
        emojiHints: ['🗺️'],
        dataSource: 'MOCK_FALLBACK',
      },
      prefs: {
        originMode: 'preset',
        origin: '서울',
        originCoords: { name: '서울', x: 28, y: 25 },
        duration: 'day',
        maxDistanceKm: 150,
        transportMode: 'local',
        theme: 'all',
      },
      savedAt: new Date().toLocaleDateString('ko-KR'),
      conditionSummary: '이전 저장 기록',
      recommendationType: '조용한 산책형',
    }));
  } catch {
    return [];
  }
}

export function formatSavedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR');
  } catch {
    return iso;
  }
}

export function getSavedTrips(): SavedTrip[] {
  return readTrips().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function isTripSaved(destinationId: string): boolean {
  return readTrips().some((t) => t.destinationId === destinationId);
}

export type SaveTripResult = 'saved' | 'already_exists' | 'removed';

export function saveTrip(destination: Destination, prefs: TripFormState): SaveTripResult {
  const trips = readTrips();
  const existing = trips.find((t) => t.destinationId === destination.id);
  if (existing) return 'already_exists';

  const entry: SavedTrip = {
    id: `${destination.id}-${Date.now()}`,
    destinationId: destination.id,
    destination,
    prefs,
    savedAt: new Date().toISOString(),
    conditionSummary: formatConditionSummary(prefs),
    recommendationType: getRecommendationType(destination),
  };

  writeTrips([entry, ...trips]);
  return 'saved';
}

export function removeTrip(destinationId: string): void {
  writeTrips(readTrips().filter((t) => t.destinationId !== destinationId));
}

export function toggleSavedTrip(
  destination: Destination,
  prefs: TripFormState,
): SaveTripResult {
  if (isTripSaved(destination.id)) {
    removeTrip(destination.id);
    return 'removed';
  }
  return saveTrip(destination, prefs);
}
