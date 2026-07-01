import { useState, useCallback, useMemo } from 'react';
import LandingSection from '../components/LandingSection';
import CardList from '../components/CardList';
import ResultSection from '../components/ResultSection';
import MyTripsPanel from '../components/MyTripsPanel';
import { AppState } from '../types/ui';
import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { fetchRecommendations } from '../services/api';
import { toTripPreference } from '../utils/tripPreference';
import {
  getSavedTrips,
  removeTrip,
  SavedTrip,
} from '../utils/savedTrips';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Heart, AlertCircle } from 'lucide-react';
import { assignDiverseRecommendationTypes } from '../utils/recommendationType';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentPool, setCurrentPool] = useState<Destination[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<TripFormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showMyTrips, setShowMyTrips] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(() => getSavedTrips());
  const [resultInitialTab, setResultInitialTab] = useState<'info' | 'course' | 'reviews'>('info');

  const refreshSavedTrips = useCallback(() => {
    setSavedTrips(getSavedTrips());
  }, []);

  const loadRecommendations = useCallback(async (formPrefs: TripFormState) => {
    setIsLoading(true);
    setApiError(null);

    const tripPreference = toTripPreference(formPrefs);
    const { items, error, resolvedOrigin } = await fetchRecommendations(tripPreference);

    if (error) {
      setApiError(error);
      setCurrentPool([]);
    } else {
      setApiError(null);
      setCurrentPool(items);
      if (resolvedOrigin && formPrefs.originMode === 'current') {
        setPrefs({ ...formPrefs, origin: resolvedOrigin });
      }
    }

    setSelectedId(null);
    setIsLoading(false);
  }, []);

  const handleStart = async (formPrefs: TripFormState) => {
    setPrefs(formPrefs);
    setAppState('picking');
    setResultInitialTab('info');
    await loadRecommendations(formPrefs);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleViewDetail = () => {
    if (selectedId) {
      setResultInitialTab('info');
      setAppState('result');
    }
  };

  const handleRetry = async () => {
    if (prefs) {
      setAppState('picking');
      setResultInitialTab('info');
      await loadRecommendations(prefs);
    }
  };

  const openSavedTrip = (trip: SavedTrip, tab: 'info' | 'reviews' = 'info') => {
    setPrefs(trip.prefs);
    setCurrentPool([trip.destination]);
    setSelectedId(trip.destination.id);
    setResultInitialTab(tab);
    setAppState('result');
    setShowMyTrips(false);
  };

  const handleRetryWithPrefs = async (trip: SavedTrip) => {
    setPrefs(trip.prefs);
    setShowMyTrips(false);
    setAppState('picking');
    setResultInitialTab('info');
    await loadRecommendations(trip.prefs);
  };

  const handleRemoveTrip = (destinationId: string) => {
    removeTrip(destinationId);
    refreshSavedTrips();
  };

  const handleEditPrefs = () => {
    setAppState('landing');
  };

  const handleExpandDistance = async () => {
    if (!prefs) return;
    const currentDist = prefs.maxDistanceKm;
    let nextDist = currentDist;
    if (currentDist <= 50) nextDist = 100;
    else if (currentDist <= 100) nextDist = 150;
    else nextDist = 300;
    
    if (nextDist > 300) nextDist = 300;
    
    const newPrefs = { ...prefs, maxDistanceKm: nextDist };
    setPrefs(newPrefs);
    await loadRecommendations(newPrefs);
  };

  const handleResetTheme = async () => {
    if (!prefs) return;
    const newPrefs: TripFormState = { ...prefs, theme: 'all' };
    setPrefs(newPrefs);
    await loadRecommendations(newPrefs);
  };

  const selectedDestination = useMemo(() => {
    return currentPool.find((d) => d.id === selectedId) ?? null;
  }, [selectedId, currentPool]);

  const selectedRecommendationType = useMemo(() => {
    if (!selectedDestination || !prefs) return undefined;
    const types = assignDiverseRecommendationTypes(currentPool, prefs);
    const index = currentPool.findIndex((d) => d.id === selectedDestination.id);
    return index !== -1 ? types[index] : undefined;
  }, [selectedDestination, currentPool, prefs]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <header className="page-container py-6 flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 shrink"
          onClick={() => setAppState('landing')}
        >
          <div className="p-2.5 sm:p-3 bg-sky-500 rounded-2xl shadow-xl shadow-sky-100 group-hover:scale-110 transition-transform shrink-0">
            <Map className="text-white" size={22} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter leading-none truncate">
              K-Trip
            </span>
            <span className="text-[0.55rem] sm:text-[0.6rem] font-black text-sky-400 uppercase tracking-widest">
              Emoji Explorer
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            refreshSavedTrips();
            setShowMyTrips(true);
          }}
          className="shrink-0 px-3 sm:px-5 py-2 bg-white text-slate-400 hover:text-yellow-500 transition-all rounded-full border-2 border-slate-50 font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
        >
          <Heart size={16} className="shrink-0" />
          <span>My Trips</span>
          {savedTrips.length > 0 && (
            <span className="bg-yellow-400 text-slate-900 text-[0.6rem] font-black px-1.5 py-0.5 rounded-full">
              {savedTrips.length}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {appState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
            >
              <LandingSection onStart={handleStart} initialPrefs={prefs} />
            </motion.div>
          )}

          {appState === 'picking' && (
            <motion.div
              key="picking"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
            >
              {apiError && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
                  <div className="flex items-center gap-3 bg-yellow-50 border-2 border-yellow-100 text-yellow-800 px-5 py-4 rounded-2xl font-medium">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>{apiError}</p>
                  </div>
                </div>
              )}
              {isLoading ? (
                <div className="page-container py-24 text-center">
                  <p className="text-slate-500 font-bold text-lg animate-pulse">
                    {prefs?.originMode === 'current'
                      ? '현재 위치를 기준으로 여행 후보를 찾고 있어요... ✨'
                      : '여행지 카드를 준비하고 있어요... ✨'}
                  </p>
                </div>
              ) : (
                <CardList
                  destinations={currentPool}
                  selectedId={selectedId}
                  prefs={prefs!}
                  onSelect={handleSelect}
                  onViewDetail={handleViewDetail}
                  onRetry={handleRetry}
                  onTripSaved={refreshSavedTrips}
                  onEditPrefs={handleEditPrefs}
                  onExpandDistance={handleExpandDistance}
                  onResetTheme={handleResetTheme}
                />
              )}
            </motion.div>
          )}

          {appState === 'result' && selectedDestination && prefs && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5, type: 'spring', damping: 20 }}
            >
              <ResultSection
                destination={selectedDestination}
                duration={prefs.duration}
                prefs={prefs}
                onBack={() => setAppState('picking')}
                onRetry={handleRetry}
                initialTab={resultInitialTab}
                onTripSaved={refreshSavedTrips}
                recommendationType={selectedRecommendationType}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MyTripsPanel
        open={showMyTrips}
        trips={savedTrips}
        onClose={() => setShowMyTrips(false)}
        onOpenTrip={(trip) => openSavedTrip(trip, 'info')}
        onRetryWithPrefs={handleRetryWithPrefs}
        onWriteReview={(trip) => openSavedTrip(trip, 'reviews')}
        onRemove={handleRemoveTrip}
      />

      <footer className="py-12 px-6 text-center border-t border-slate-100 bg-white mt-20">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-center gap-4 text-slate-300">
            <Map size={24} />
            <Heart size={24} />
          </div>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            K-Trip Random Picker는 당신의 발견되지 않은 취향을 찾아가는 여정을 응원합니다. <br />
            © 2026 K-Trip. 모든 권한은 여행자들에게 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
