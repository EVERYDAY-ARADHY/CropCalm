import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import './MagicBento.css';

const DEFAULT_GLOW_COLOR = '21, 122, 38';

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute; width: 3px; height: 3px; border-radius: 50%;
    background: rgba(${color}, 1); box-shadow: 0 0 5px rgba(${color}, 0.7);
    pointer-events: none; z-index: 10; left: ${x}px; top: ${y}px;
  `;
  return el;
};

// ── Particle card wrapper ────────────────────────────────────────────
export const ParticleCard = ({
  children, className = '', style, particleCount = 8,
  glowColor = DEFAULT_GLOW_COLOR, clickEffect = true, enableMagnetism = false
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach(p => {
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => p.parentNode?.removeChild(p) });
    });
    particlesRef.current = [];
  }, []);

  const spawnParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    Array.from({ length: particleCount }).forEach((_, i) => {
      const id = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const p = createParticleElement(Math.random() * width, Math.random() * height, glowColor);
        cardRef.current.appendChild(p);
        particlesRef.current.push(p);
        gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(p, { x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
      }, i * 80);
      timeoutsRef.current.push(id);
    });
  }, [particleCount, glowColor]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onEnter = () => { isHoveredRef.current = true; spawnParticles(); };
    const onLeave = () => {
      isHoveredRef.current = false;
      clearParticles();
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3 });
    };
    const onMove = (e) => {
      if (!enableMagnetism) return;
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: ((e.clientX - r.left) / r.width - 0.5) * 6, y: ((e.clientY - r.top) / r.height - 0.5) * 6, duration: 0.3 });
      el.style.setProperty('--glow-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--glow-y', `${((e.clientY - r.top) / r.height) * 100}%`);
      el.style.setProperty('--glow-intensity', '1');
    };
    const onClick = (e) => {
      if (!clickEffect) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const maxD = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height));
      const ripple = document.createElement('div');
      ripple.style.cssText = `position:absolute;width:${maxD*2}px;height:${maxD*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.35) 0%,transparent 65%);left:${x-maxD}px;top:${y-maxD}px;pointer-events:none;z-index:100;`;
      el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => ripple.remove() });
    };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('click', onClick);
      clearParticles();
    };
  }, [spawnParticles, clearParticles, enableMagnetism, clickEffect]);

  return (
    <div ref={cardRef} className={`${className} particle-container`} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

// ── Activity Rings — single fluid SVG that fills its container ──────
const ActivityRingGroup = ({ ringData }) => {
  const rings = [
    { ...ringData[0], r: 42, sw: 7 },
    { ...ringData[1], r: 30, sw: 6 },
    { ...ringData[2], r: 18, sw: 5 },
  ];
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%"
      style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
      {rings.map(ring => {
        const circ = 2 * Math.PI * ring.r;
        const offset = ((100 - Math.min(ring.value, 100)) / 100) * circ;
        return (
          <g key={ring.label}>
            <circle cx="50" cy="50" r={ring.r} fill="none" stroke={`${ring.color}20`} strokeWidth={ring.sw} />
            <circle cx="50" cy="50" r={ring.r} fill="none"
              stroke={ring.color} strokeWidth={ring.sw}
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
            />
          </g>
        );
      })}
    </svg>
  );
};

// ── Right Panel ──────────────────────────────────────────────────────
export function DefaultRightPanel({ devices, profile }) {
  const { t } = useLanguage();
  const gridRef = useRef(null);
  const nodes = devices.filter(d => d.type === 'node');
  const onlineNodes = nodes.filter(d => d.status !== 'offline').length;
  const alertNodes  = nodes.filter(d => d.status === 'alert').length;

  // Highest-threat node = ongoing alert
  const sorted = [...nodes].sort((a, b) =>
    (b.telemetry?.[0]?.threat_level ?? 0) - (a.telemetry?.[0]?.threat_level ?? 0)
  );
  const ongoing     = sorted[0]?.telemetry?.[0]?.threat_level > 0 ? sorted[0] : null;
  const ongoingThreat = ongoing?.telemetry?.[0]?.threat_level ?? 0;

  const sysStatusLabel = ongoingThreat === 3 ? 'CRITICAL' : (ongoingThreat > 0 ? 'ALERT' : 'SECURE');
  const sysStatusColor = ongoingThreat === 3 ? '#ef4444' : (ongoingThreat > 0 ? '#f97316' : 'rgba(var(--color-neo-cream-rgb),0.9)');
  const sysStatusGlow  = ongoingThreat === 3 ? 'rgba(239,68,68,0.55)' : (ongoingThreat > 0 ? 'rgba(249,115,22,0.55)' : 'transparent');

  const LEVEL_COLORS = { 1: '#eab308', 2: '#f97316', 3: '#ef4444' };
  const LEVEL_LABELS = { 1: 'LEVEL 1 — FAR', 2: 'LEVEL 2 — MID', 3: 'LEVEL 3 — NEAR' };
  const ongoingColor = LEVEL_COLORS[ongoingThreat] || '#157A26';

  const overallLevel = profile?.threat_profile?.overallLevel || 'LOW';
  const PROFILE_COLORS = { LOW: '#157A26', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };
  const levelColor = PROFILE_COLORS[overallLevel] || '#157A26';
  const GLOW = '21, 122, 38';

  const ringData = [
    { label: t('navNodes'),  color: 'var(--color-neo-cream)', textColor: onlineNodes === 5 ? '#10b981' : (onlineNodes > 0 ? '#f97316' : '#ef4444'), size: 154, value: (onlineNodes / 5) * 100, current: onlineNodes, target: 5,   unit: 'ONLINE' },
    { label: t('navAlerts'), color: 'var(--color-neo-cream)', textColor: levelColor, size: 110, value: { LOW:10, MEDIUM:45, HIGH:72, CRITICAL:100 }[overallLevel] ?? 10, current: alertNodes, target: nodes.length, unit: 'ALERTS' },
    { label: 'COVER',  color: 'var(--color-neo-cream)', textColor: '#157A26', size: 68,  value: 80, current: 80, target: 100, unit: '%' },
  ];

  return (
    <div
      className="bento-section"
      ref={gridRef}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px',
        boxSizing: 'border-box',
      }}
    >

      {/* ── Farmer header row ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, padding: '0 4px', marginBottom: '8px' }}>
        <div>
          <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/40 mb-1">Farmer</p>
          <p className="font-heading text-4xl uppercase leading-none" style={{ color: 'var(--color-neo-cream)' }}>
            {profile?.name || 'DEMO'}
          </p>
        </div>
      </div>

      {/* ── ONGOING ALERT ───────────────────────────────────────── */}
      {ongoing && (
        <ParticleCard
          className="magic-bento-card magic-bento-card--border-glow"
          glowColor={ongoingThreat === 3 ? '239, 68, 68' : '249, 115, 22'}
          particleCount={7}
          enableMagnetism={false}
          style={{
            '--glow-color': ongoingThreat === 3 ? '239, 68, 68' : '249, 115, 22',
            border: `2px solid ${ongoingColor}55`,
            animation: 'alertPulse 1.8s ease-in-out infinite',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-subheading text-[10px] uppercase tracking-widest" style={{ color: `${ongoingColor}99` }}>
              Ongoing Alert
            </p>
            <span className="font-subheading text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${ongoingColor}22`, color: ongoingColor, border: `1px solid ${ongoingColor}55` }}>
              LIVE
            </span>
          </div>
          <p className="font-heading text-3xl uppercase leading-none mb-1"
            style={{ color: ongoingColor, textShadow: `0 0 22px ${ongoingColor}88` }}>
            {ongoing.name.toUpperCase()}
          </p>
          <p className="font-subheading font-bold text-xs uppercase tracking-widest mb-3"
            style={{ color: ongoingColor }}>
            {LEVEL_LABELS[ongoingThreat]}
          </p>
          <div className="flex gap-2">
            {[
              { label: 'Distance', val: `${ongoing.telemetry?.[0]?.ultrasonic_cm ?? '—'} cm` },
              { label: 'PIR',      val: ongoing.telemetry?.[0]?.pir_triggered ? 'TRIGGERED' : 'CLEAR',  alert: ongoing.telemetry?.[0]?.pir_triggered },
              { label: 'Radar',    val: ongoing.telemetry?.[0]?.microwave_triggered ? 'ACTIVE' : 'CLEAR', alert: ongoing.telemetry?.[0]?.microwave_triggered },
            ].map(s => (
              <div key={s.label} className="flex-1 border border-neo-border rounded-lg p-2">
                <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/40 mb-0.5">{s.label}</p>
                <p className="font-subheading font-bold text-xs uppercase" style={{ color: s.alert != null ? (s.alert ? ongoingColor : '#157A26') : ongoingColor }}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>
        </ParticleCard>
      )}

      {/* ── BOTTOM SECTION: Left Stack (Last Alert + System Status) | Right Stack (Node Health) ── */}
      <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Stacked minor cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: 0 }}>
          
          {/* Last Alert */}
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow"
            glowColor={GLOW} particleCount={4} enableMagnetism={true}
            style={{ '--glow-color': GLOW, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40">Last Alert</p>
              <span className="font-subheading text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-neo-cream/5 text-neo-cream/40 border border-neo-border whitespace-nowrap">
                7 MIN AGO
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
              <p className="font-heading text-3xl uppercase leading-none" style={{ color: 'rgba(var(--color-neo-cream-rgb),0.9)' }}>NW Node</p>
              <span className="font-subheading text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full inline-block w-fit"
                style={{ background: 'rgba(var(--color-neo-cream-rgb),0.06)', color: 'rgba(var(--color-neo-cream-rgb),0.4)', border: '1px solid var(--color-neo-border)' }}>
                Resolved
              </span>
            </div>
          </ParticleCard>

          {/* System Status */}
          <ParticleCard
            className="magic-bento-card magic-bento-card--border-glow"
            glowColor={GLOW} particleCount={4} enableMagnetism={true}
            style={{ '--glow-color': GLOW, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/35">{t('systemStatus')}</p>
            <div>
              <p className="font-heading text-3xl uppercase leading-none mb-1"
                style={{ 
                  color: sysStatusColor, 
                  textShadow: ongoingThreat > 0 ? `0 0 18px ${sysStatusGlow}` : 'none' 
                }}>
                {sysStatusLabel}
              </p>
              <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/40">{onlineNodes}/5 active</p>
            </div>
          </ParticleCard>
        </div>

        {/* Right Column: Node Health (Big) */}
        <ParticleCard
          className="magic-bento-card magic-bento-card--border-glow"
          glowColor={GLOW} particleCount={6} enableMagnetism={true}
          style={{ '--glow-color': GLOW, flex: 1.5, minWidth: 0, display: 'flex', flexDirection: 'column' }}
        >
          <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/50" style={{ marginBottom: '16px' }}>Node Health</p>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '280px', aspectRatio: '1', flexShrink: 0 }}>
              <ActivityRingGroup ringData={ringData} />
            </div>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'flex-end', padding: '0 8px' }}>
              {ringData.map(r => (
                <div key={r.label} style={{ textAlign: 'center' }}>
                  <span className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1 block">{r.label}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                    <span className="font-heading text-5xl leading-none" style={{ color: r.textColor }}>
                      {r.current}
                    </span>
                    <span className="font-heading text-lg opacity-50 ml-1" style={{ color: r.textColor }}>
                      /{r.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ParticleCard>

      </div>

    </div>
  );
}

export default DefaultRightPanel;
