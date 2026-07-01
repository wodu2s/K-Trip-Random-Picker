import { TripFormState, TripPreference } from '../types/trip';

export function toTripPreference(form: TripFormState): TripPreference {
  return {
    originMode: form.originMode,
    origin: form.origin,
    originLat: form.originLat,
    originLng: form.originLng,
    duration: form.duration,
    maxDistanceKm: form.maxDistanceKm,
    transportMode: form.transportMode,
    themes: form.theme === 'all' ? [] : [form.theme],
  };
}
