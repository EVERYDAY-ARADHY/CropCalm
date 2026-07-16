import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ParticleCard } from '../components/MagicBento';
import FarmMap from '../components/FarmMap';
import { weeklyAlertData, alertMetrics } from '../lib/mockAlertData';
import { useLanguage } from '../context/LanguageContext';

const getGreenShade = (count) => {
  if (count <= 5) return '#2bd966'; // Bright vibrant green (Left of spectrum)
  if (count <= 10) return '#22a34f'; // Medium-bright green
  if (count <= 15) return '#187339'; // Medium-dark green
  return '#0f4524'; // Deep dark green (Right of spectrum)
};

const CustomBarShape = (props) => {
  const { x, y, width, height, payload, index, activeIndex, t } = props;
  const isActive = index === activeIndex;
  const color = getGreenShade(payload.alerts);
  
  // Determine a safe position for the text. If the bar is tall enough, put it inside near the top. Otherwise, put it above the bar.
  const isInside = height >= 60;
  const textY = isInside ? y + 30 : Math.max(y - 20, 20);

  // Intelligent contrast: 
  // If inside the bright green bar, use a dark color by default, and switch to bright cream when the bar darkens on hover.
  // If outside (on dark background), always use bright cream.
  const mainTextColor = isInside ? (isActive ? "#FEF9F2" : "rgba(0,0,0,0.6)") : "#FEF9F2";
  const subTextColor = isInside ? (isActive ? "#10b981" : "rgba(0,0,0,0.4)") : (isActive ? "#10b981" : "rgba(16, 185, 129, 0.6)");

  return (
    <g style={{ cursor: 'pointer' }}>
      <rect 
        x={x} y={y} width={width} height={height} 
        fill={color} 
        rx={8} ry={8}
        style={{
          filter: isActive ? `drop-shadow(0 0 12px ${color}) brightness(0.6)` : `drop-shadow(0 0 8px ${color}66) brightness(1)`,
          transition: 'all 0.2s ease',
          transformOrigin: `${x + width/2}px ${y + height}px`,
          transform: isActive ? 'scaleY(1.02) scaleX(1.02)' : 'scale(1)'
        }}
      />
      <text
        x={x + width / 2}
        y={textY}
        textAnchor="middle"
        fill={mainTextColor}
        fontSize="24px"
        fontFamily="'Alfa Slab One', cursive"
        pointerEvents="none"
        style={{ transition: 'fill 0.2s ease' }}
      >
        {payload.alerts}
      </text>
      <text
        x={x + width / 2}
        y={textY + 16}
        textAnchor="middle"
        fill={subTextColor}
        fontSize="10px"
        fontWeight="bold"
        fontFamily="'Syne', sans-serif"
        letterSpacing="0.2em"
        pointerEvents="none"
        style={{ transition: 'fill 0.2s ease' }}
      >
        {t ? t('navAlerts').toUpperCase() : 'ALERTS'}
      </text>
    </g>
  );
};

export default function Alerts() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);
  const GLOW = '16, 185, 129'; // Emerald green glow

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 h-full gap-4 md:gap-6 lg:max-h-screen lg:overflow-hidden overflow-y-auto no-scrollbar">
      
      {/* Main Layout 60/40 */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 pb-4">
        
        {/* Left Column - 60% */}
        <div className="flex-[6] flex flex-col gap-6 min-w-0">
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow w-full flex-1 min-h-0"
            glowColor={GLOW} particleCount={0} enableMagnetism={false}
            style={{ '--glow-color': GLOW, display: 'flex', flexDirection: 'column' }}
          >
          <div className="mb-6 flex justify-between items-end">
            <div>
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1">{t('weeklyVolume')}</p>
              <h2 className="font-heading text-3xl uppercase">{t('alertsInAWeek')}</h2>
            </div>
            <div className="text-right">
              <p className="font-heading text-5xl text-[#10b981] drop-shadow-[0_0_16px_rgba(16,185,129,0.6)] leading-none">
                {weeklyAlertData.reduce((acc, curr) => acc + curr.alerts, 0)}
              </p>
              <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/40 mt-1">{t('totalThreats')}</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 w-full relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAlertData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}
                onMouseMove={(state) => {
                  if (state.isTooltipActive) {
                    setActiveIndex(state.activeTooltipIndex);
                  } else {
                    setActiveIndex(null);
                  }
                }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-neo-cream)', opacity: 0.4, fontSize: 10, fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-neo-cream)', opacity: 0.4, fontSize: 10, fontFamily: 'Syne, sans-serif' }} 
                />
                <Bar 
                  dataKey="alerts" 
                  isAnimationActive={false}
                  shape={(props) => <CustomBarShape {...props} activeIndex={activeIndex} t={t} />} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ParticleCard>

        {/* The Live Telemetry Map inserted below the bar chart */}
        <FarmMap />
      </div>

      {/* Right Column - 40% */}
      <div className="flex-[4] flex flex-col gap-6 min-w-0">
          
          {/* Averages Row */}
          <div className="flex gap-6 h-[140px]">
            <ParticleCard
              className="magic-bento-card magic-bento-card--border-glow flex-1"
              glowColor="16, 185, 129" particleCount={0} enableMagnetism={true}
              style={{ '--glow-color': '16, 185, 129', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-2">{t('avgDuration')}</p>
              <p className="font-heading text-4xl text-[#10b981] drop-shadow-[0_0_16px_rgba(16,185,129,0.4)] leading-none">{alertMetrics.averageDuration}</p>
            </ParticleCard>

            <ParticleCard
              className="magic-bento-card magic-bento-card--border-glow flex-1"
              glowColor="234, 179, 8" particleCount={0} enableMagnetism={true}
              style={{ '--glow-color': '234, 179, 8', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-2">{t('timeBwAlerts')}</p>
              <p className="font-heading text-4xl text-[#eab308] drop-shadow-[0_0_16px_rgba(234,179,8,0.4)] leading-none">{alertMetrics.timeBetween}</p>
            </ParticleCard>
          </div>

          {/* Ranking Card */}
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow flex-1 min-h-0"
            glowColor="239, 68, 68" particleCount={0} enableMagnetism={false}
            style={{ '--glow-color': '239, 68, 68', display: 'flex', flexDirection: 'column' }}
          >
            <div className="mb-4">
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1">{t('vulnerability')}</p>
              <h2 className="font-heading text-2xl uppercase">{t('mostAlertedNodes')}</h2>
            </div>
            
            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alertMetrics.topNodes.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border" 
                     style={{ 
                       background: i === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(var(--color-neo-cream-rgb), 0.02)', 
                       borderColor: i === 0 ? 'rgba(239,68,68,0.4)' : 'var(--color-neo-border)' 
                     }}>
                  <div className="flex items-center gap-5">
                    <span className="font-heading text-2xl opacity-20 w-8">0{i+1}</span>
                    <span className="font-subheading font-bold text-sm uppercase tracking-widest" style={{ color: i === 0 ? '#ef4444' : 'var(--color-neo-cream)' }}>
                      {item.node}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-3xl" style={{ color: i === 0 ? '#ef4444' : 'var(--color-neo-cream)' }}>
                      {item.count}
                    </span>
                    <span className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/30">{t('hits')}</span>
                  </div>
                </div>
              ))}
            </div>
          </ParticleCard>

        </div>
      </div>
    </div>
  );
}
