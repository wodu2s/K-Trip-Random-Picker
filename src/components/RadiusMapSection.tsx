/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

interface RadiusMapSectionProps {
  currentLocation: { name: string; x: number; y: number };
  maxDistance: number;
}

// A simplified South Korea SVG path for visual representation
const KOREA_SVG_PATH = "M 32 5 L 38 10 L 45 8 L 52 12 L 58 10 L 65 15 L 75 12 L 80 18 L 78 25 L 85 30 L 82 40 L 90 50 L 85 60 L 88 75 L 80 85 L 75 92 L 65 95 L 50 92 L 35 95 L 25 90 L 15 85 L 10 75 L 12 60 L 5 50 L 8 40 L 5 30 L 12 20 L 15 15 L 25 10 Z";

export default function RadiusMapSection({ currentLocation, maxDistance }: RadiusMapSectionProps) {
  // We'll normalize distance (50-500km) to map radius (roughly 5-50% of map size)
  const radiusPercent = (maxDistance / 500) * 45;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] bg-sky-50 rounded-[2rem] overflow-hidden border-2 border-sky-100 shadow-inner">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <svg viewBox="0 0 100 100" className="w-full h-full p-8">
          {/* Korea Landmass */}
          <path 
            d={KOREA_SVG_PATH} 
            className="fill-white stroke-sky-200 stroke-[0.5]"
          />
          
          {/* Radius Circle */}
          <motion.circle
            cx={currentLocation.x}
            cy={currentLocation.y}
            initial={{ r: 0 }}
            animate={{ r: radiusPercent }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="fill-sky-400/10 stroke-sky-400 stroke-[0.5] stroke-dasharray-1 shadow-2xl"
          />

          {/* Current Location Marker */}
          <g>
             <circle cx={currentLocation.x} cy={currentLocation.y} r="2" className="fill-sky-500 animate-pulse" />
             <circle cx={currentLocation.x} cy={currentLocation.y} r="0.5" className="fill-white" />
          </g>
          
          {/* Legend / Distance Tag */}
          <foreignObject x={currentLocation.x + 2} y={currentLocation.y - 8} width="40" height="20">
             <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-sky-100 shadow-sm inline-flex items-center gap-1">
                <MapPin size={8} className="text-sky-500" />
                <span className="text-[5px] font-black text-slate-700 leading-none">{currentLocation.name}</span>
             </div>
          </foreignObject>
        </svg>

        {/* UI Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
           <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl">
              <p className="text-xs font-bold text-slate-500 text-center leading-relaxed">
                 현재 위치 <span className="text-sky-600">[{currentLocation.name}]</span> 기준 <br />
                 약 <span className="text-sky-600 font-black">{maxDistance}km</span> 이내의 여행지를 추천합니다.
              </p>
           </div>
        </div>
      </div>
      
      {/* Visual Helper */}
      <div className="flex justify-between items-center px-4">
         <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Map Visualization</span>
         <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <div className="w-2 h-2 rounded-full bg-sky-200" />
            <div className="w-2 h-2 rounded-full bg-sky-100" />
         </div>
      </div>
    </div>
  );
}
