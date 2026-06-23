/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import LandingSection from './components/LandingSection';
import CardList from './components/CardList';
import ResultSection from './components/ResultSection';
import { AppState, Destination, TravelPreferences } from './types';
import { DESTINATIONS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Heart } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentPool, setCurrentPool] = useState<Destination[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<TravelPreferences | null>(null);

  // Pick 5 filtered destinations
  const pickSmartFive = useCallback((userPrefs: TravelPreferences) => {
    let filtered = DESTINATIONS.filter(d => {
      // Calculate distance based on coordinate system (mock Haversine)
      // x units ~ 3km each, y units ~ 5km each
      const dx = (d.coords.x - userPrefs.currentLocation.x) * 3;
      const dy = (d.coords.y - userPrefs.currentLocation.y) * 5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Filter by travel time
      const timeMatch = d.travelType.includes(userPrefs.travelTime);
      // Filter by distance
      const distanceMatch = dist <= userPrefs.maxDistance;
      // Filter by theme
      const themeMatch = userPrefs.theme === 'all' || d.themes.includes(userPrefs.theme);
      
      return timeMatch && distanceMatch && themeMatch;
    });

    // If we have less than 5, add some random ones that at least match the travel time
    if (filtered.length < 5) {
      const remaining = DESTINATIONS.filter(d => 
        !filtered.find(f => f.id === d.id) && 
        d.travelType.includes(userPrefs.travelTime)
      );
      filtered = [...filtered, ...remaining.slice(0, 5 - filtered.length)];
    }

    const shuffled = filtered.sort(() => 0.5 - Math.random());
    setCurrentPool(shuffled.slice(0, 5));
    setSelectedId(null);
  }, []);

  const handleStart = (userPrefs: TravelPreferences) => {
    setPrefs(userPrefs);
    pickSmartFive(userPrefs);
    setAppState('picking');
  };

  const handleSelect = (id: string) => {
    if (selectedId === id) {
      setAppState('result');
    } else {
      setSelectedId(id);
    }
  };

  const handleRetry = () => {
    if (prefs) {
      pickSmartFive(prefs);
      setAppState('picking');
    }
  };

  const selectedDestination = useMemo(() => {
    return DESTINATIONS.find(d => d.id === selectedId) || null;
  }, [selectedId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="px-6 py-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setAppState('landing')}
        >
          <div className="p-3 bg-sky-500 rounded-2xl shadow-xl shadow-sky-100 group-hover:scale-110 transition-transform">
             <Map className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
             <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none">K-Trip</span>
             <span className="text-[0.6rem] font-black text-sky-400 uppercase tracking-widest">Emoji Explorer</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="px-5 py-2 bg-white text-slate-400 hover:text-yellow-500 transition-all rounded-full border-2 border-slate-50 font-bold text-sm flex items-center gap-2">
              <Heart size={18} />
              My Trips
           </button>
        </div>
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
              <LandingSection onStart={handleStart} />
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
              <CardList 
                destinations={currentPool}
                selectedId={selectedId}
                onSelect={handleSelect}
                onRetry={handleRetry}
              />
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
                travelTime={prefs.travelTime}
                onBack={() => setAppState('picking')}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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

