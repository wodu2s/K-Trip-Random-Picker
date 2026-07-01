import { Destination } from '../types/destination';
import { TripPreference } from '../types/trip';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface FetchRecommendationsResult {
  items: Destination[];
  error?: string;
  resolvedOrigin?: string;
}

function safeParseDest(raw: unknown): Destination | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  return {
    id: String(d.id ?? ''),
    title: String(d.title ?? ''),
    region: String(d.region ?? ''),
    address: d.address != null ? String(d.address) : undefined,
    latitude: typeof d.latitude === 'number' ? d.latitude : undefined,
    longitude: typeof d.longitude === 'number' ? d.longitude : undefined,
    imageUrl: d.imageUrl != null ? String(d.imageUrl) : undefined,
    themes: Array.isArray(d.themes) ? d.themes.map(String) : [],
    distanceKm: typeof d.distanceKm === 'number' ? d.distanceKm : undefined,
    summary: String(d.summary ?? ''),
    reasonBadges: Array.isArray(d.reasonBadges) ? d.reasonBadges.map(String) : [],
    emojiHints: Array.isArray(d.emojiHints) ? d.emojiHints.map(String) : [],
    dataSource: d.dataSource === 'MOCK_FALLBACK' ? 'MOCK_FALLBACK' : 'KTO_OPEN_API',
    detail: d.detail && typeof d.detail === 'object' ? (d.detail as Destination['detail']) : undefined,
  };
}

export async function fetchRecommendations(
  prefs: TripPreference,
): Promise<FetchRecommendationsResult> {
  const params = new URLSearchParams({
    originMode: prefs.originMode,
    origin: prefs.origin,
    duration: prefs.duration,
    maxDistanceKm: String(prefs.maxDistanceKm),
    transportMode: prefs.transportMode,
  });

  if (prefs.originLat !== undefined) {
    params.set('originLat', String(prefs.originLat));
  }
  if (prefs.originLng !== undefined) {
    params.set('originLng', String(prefs.originLng));
  }

  if (prefs.themes.length === 1) {
    params.set('theme', prefs.themes[0]);
  } else if (prefs.themes.length > 1) {
    prefs.themes.forEach(t => params.append('themes', t));
  }

  try {
    const response = await fetch(`${API_BASE}/api/recommendations?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Support both { items: [...] } and plain array responses
    let rawItems: unknown[];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && Array.isArray(data.items)) {
      rawItems = data.items;
    } else {
      rawItems = [];
    }

    const items = rawItems
      .map(safeParseDest)
      .filter((d): d is Destination => d !== null && d.id !== '');

    const resolvedOrigin = data && typeof data.resolvedOrigin === 'string' ? data.resolvedOrigin : undefined;
    
    if (prefs.originMode === 'current') {
      console.log('[DEBUG] Current Location Request:', {
        originMode: prefs.originMode,
        originLat: prefs.originLat,
        originLng: prefs.originLng,
        resolvedAddress: resolvedOrigin,
        // Accuracy isn't passed to api.ts, so we'll log what we have
      });
      if (data && data.debugLogs) {
        console.log('[DEBUG] Backend KTO Coverage info:', data.debugLogs);
      }
    }

    return { items, resolvedOrigin };
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return {
      items: [],
      error: '여행지를 불러오지 못했어요. 서버 연결을 확인한 뒤 다시 시도해 주세요.',
    };
  }
}
