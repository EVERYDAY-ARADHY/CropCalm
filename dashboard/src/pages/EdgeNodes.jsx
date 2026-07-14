import React, { useState, useEffect, useRef } from 'react';
import { ParticleCard } from '../components/MagicBento';
import DOMCircularGallery from '../components/DOMCircularGallery';
import { DEMO_DEVICES } from './Dashboard';
import { useLanguage } from '../context/LanguageContext';

export default function EdgeNodes() {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const nodesOnly = DEMO_DEVICES.filter(d => d.type === 'node');
    setNodes(nodesOnly);
    setLoading(false);
  }, []);

  const scrollTo = (i) => {
    setActiveIndex(i);
    if (trackRef.current) {
      trackRef.current.scrollTo(i);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center font-heading text-2xl text-neo-cream uppercase tracking-widest animate-pulse">
        {t('fetchingEdgeNodes')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8" style={{ minHeight: 0 }}>
      {/* Header / Dot Nav */}
      <div className="mb-8 flex-shrink-0 flex items-end justify-end">
        {/* Dot nav */}
        <div className="flex gap-2 items-center pb-1">
          {nodes.map((_, i) => {
            const telemetry = nodes[i]?.telemetry?.[0];
            const threat = telemetry?.threat_level ?? 0;
            const colors = { 0: '#157A26', 1: '#eab308', 2: '#f97316', 3: '#ef4444' };
            return (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className="transition-all duration-300"
                style={{
                  width: i === activeIndex ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === activeIndex ? colors[threat] : 'rgba(244,231,213,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Circular gallery track — break out of p-8 parent padding */}
      <div style={{ height: 'calc(100vh - 180px)', width: 'calc(100% + 4rem)', marginLeft: '-2rem', marginRight: '-2rem', flexShrink: 0 }}>
        <DOMCircularGallery ref={trackRef} onIndexChange={setActiveIndex} scrollSpeed={1} itemWidth={420} itemHeight={480} gap={160} topOffset={30} bendStrength={120}>
          {nodes.map((node) => {
          const telemetry = node.telemetry?.[0];
          const threat = telemetry?.threat_level ?? 0;
          const colors = { 0: '#157A26', 1: '#eab308', 2: '#f97316', 3: '#ef4444' };
          const labels = { 0: t('secure').toUpperCase(), 1: 'FAR', 2: 'MID', 3: 'NEAR' };
          const color = colors[threat] || colors[0];
          const glow = threat > 0 ? (threat === 3 ? '239,68,68' : '249,115,22') : '21,122,38';

          return (
            <div
              key={node.id}
              style={{ width: '100%', height: '100%' }}
            >
              <ParticleCard
                className="magic-bento-card magic-bento-card--border-glow w-full h-full flex flex-col justify-between"
                glowColor={glow}
                particleCount={threat > 0 ? 8 : 3}
                enableMagnetism={true}
                style={{
                  '--glow-color': glow,
                  border: threat > 0 ? `2px solid ${color}44` : '2px solid rgba(244,231,213,0.1)',
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                      <div className="h-24 flex items-end">
                        <h2 className="font-heading text-5xl uppercase leading-[0.9]" style={{ color, textShadow: `0 0 20px ${color}55` }}>
                          {node.name}
                        </h2>
                      </div>
                      <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/40 mt-2">ID: {node.id.split('-')[0]}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full font-subheading text-[10px] uppercase tracking-widest"
                      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}>
                      {node.status === 'offline' ? 'OFFLINE' : (threat === 3 ? 'CRITICAL' : (threat > 0 ? 'ALERT' : 'ONLINE'))}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-neo-border-faint rounded-xl p-3 bg-neo-border-faint">
                      <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/40 mb-1">{t('position')}</p>
                      <p className="font-heading text-2xl text-neo-cream">{node.position_angle}°</p>
                    </div>
                    <div className="border border-neo-border-faint rounded-xl p-3 bg-neo-border-faint">
                      <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/40 mb-1">{t('threatLevel')}</p>
                      <p className="font-heading text-2xl" style={{ color }}>{labels[threat]}</p>
                    </div>
                  </div>
                </div>

                {telemetry && (
                  <div className="border-t border-neo-border-faint pt-4 mt-auto">
                    <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/40 mb-3">{t('liveTelemetry')}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-subheading text-[10px] uppercase text-neo-cream/60">{t('ultrasonic')}</span>
                      <span className={`font-subheading text-sm ${threat === 3 ? 'text-red-500' : 'text-neo-cream'}`}>
                        {telemetry.ultrasonic_cm || '—'} cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-subheading text-[10px] uppercase text-neo-cream/60">{t('pirMotion')}</span>
                      <span className="font-subheading text-[10px] uppercase px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: (telemetry.pir_triggered || threat === 3) ? '#ef444433' : '#157A2633', color: (telemetry.pir_triggered || threat === 3) ? '#ef4444' : '#157A26' }}>
                        {(telemetry.pir_triggered || threat === 3) ? t('detected') : t('clear')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-subheading text-[10px] uppercase text-neo-cream/60">{t('microwaveRadar')}</span>
                      <span className="font-subheading text-[10px] uppercase px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: (telemetry.microwave_triggered || threat === 3) ? '#ef444433' : '#157A2633', color: (telemetry.microwave_triggered || threat === 3) ? '#ef4444' : '#157A26' }}>
                        {(telemetry.microwave_triggered || threat === 3) ? t('detected') : t('clear')}
                      </span>
                    </div>
                  </div>
                )}
              </ParticleCard>
            </div>
          );
        })}
        </DOMCircularGallery>
      </div>
    </div>
  );
}
