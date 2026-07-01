import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { isTripSaved, toggleSavedTrip } from './savedTrips';

export function isFavoriteDestination(id: string): boolean {
  return isTripSaved(id);
}

export function toggleFavoriteDestination(
  destination: Destination,
  prefs: TripFormState,
): boolean {
  return toggleSavedTrip(destination, prefs) !== 'removed';
}
