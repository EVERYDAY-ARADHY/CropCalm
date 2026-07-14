import React, { useEffect, useRef, useState } from 'react';

const RADIUS_OUTER = 38;
const RADIUS_MID   = 24;
const RADIUS_INNER = 10;
const CX = 50;
const CY = 50;

const THREAT_COLOR = { 0: '#157A26', 1: '#eab308', 2: '#f97316', 3: '#ef4444' };
const THREAT_LABEL = { 0: 'CLEAR', 1: 'FAR', 2: 'MID', 3: 'NEAR' };

function nodePos(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

// ── Radar sweep angle ───────────────────────────────────────────────
function useSweep() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let frame, last = performance.now();
    const tick = (now) => {
      setAngle(a => (a + (now - last) * 0.035) % 360);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return angle;
}

// ── Sonar beep: tracks when sweep crosses a node, fires a ping ─────
function usePingMap(nodes, sweepAngle) {
  const lastHit = useRef({});
  const [pings, setPings] = useState({});

  useEffect(() => {
    nodes.forEach(node => {
      const target = ((node.position_angle % 360) + 360) % 360;
      const diff = Math.abs(((sweepAngle - target + 360) % 360));
      const justHit = diff < 2.5;

      if (justHit && !lastHit.current[node.id]) {
        lastHit.current[node.id] = true;
        setPings(p => ({ ...p, [node.id]: Date.now() }));
      } else if (!justHit) {
        lastHit.current[node.id] = false;
      }
    });
  }, [sweepAngle, nodes]);

  return pings;
}

// ── Ping ring that expands and fades ───────────────────────────────
function PingRing({ cx, cy, color, triggerAt }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    let frame, start;
    const duration = 1200;
    const tick = (now) => {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [triggerAt]);

  if (!triggerAt) return null;
  const r = progress * 6;
  const op = (1 - progress) * 0.75;

  return (
    <circle
      cx={`${cx}%`} cy={`${cy}%`}
      r={`${r}%`}
      fill="none"
      stroke={color}
      strokeWidth="0.25%"
      opacity={op}
      style={{ pointerEvents: 'none' }}
    />
  );
}

// ── Single edge node ────────────────────────────────────────────────
function RadarNode({ device, onClick, isSelected, pingAt }) {
  const pos = nodePos(device.position_angle, RADIUS_OUTER - 2);
  const telemetry = device.telemetry?.[0];
  const threat = telemetry?.threat_level ?? 0;
  const color = THREAT_COLOR[threat];

  return (
    <g style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onClick(device); }}>
      {/* Persistent threat ring for alerts */}
      {threat >= 1 && (
        <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r="2%"
          fill="none" stroke={color} strokeWidth="0.12%"
          opacity={0.25 + (threat * 0.1)}
        />
      )}
      {/* Ping expansion ring */}
      <PingRing cx={pos.x} cy={pos.y} color={color} triggerAt={pingAt} />
      {/* Outer select ring */}
      {isSelected && (
        <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r="2.2%"
          fill="none" stroke={color} strokeWidth="0.3%" opacity="0.9"
        />
      )}
      {/* Node body */}
      <rect
        x={`${pos.x - 1.1}%`} y={`${pos.y - 1.1}%`}
        width="2.2%" height="2.2%" rx="0.3%"
        fill={color} opacity={isSelected ? 1 : 0.88}
        style={{ filter: `drop-shadow(0 0 ${4 + threat * 3}px ${color})` }}
      />
      {/* Connection line */}
      <line
        x1={`${CX}%`} y1={`${CY}%`} x2={`${pos.x}%`} y2={`${pos.y}%`}
        stroke={color} strokeWidth="0.08%" opacity="0.18"
        strokeDasharray="0.5% 0.4%"
      />
      {/* Label */}
      <text x={`${pos.x}%`} y={`${pos.y + 3.2}%`}
        textAnchor="middle" fill="#F4E7D5"
        fontSize="1.1%" fontFamily="Syne, sans-serif"
        letterSpacing="0.06em" opacity="0.6"
      >
        {device.name.toUpperCase()}
      </text>
      {/* Threat level badge for alerts */}
      {threat >= 1 && (
        <text x={`${pos.x + 1.5}%`} y={`${pos.y - 1.5}%`}
          textAnchor="start" fill={color}
          fontSize="1%" fontFamily="Syne, sans-serif"
          fontWeight="bold" opacity="0.9"
        >
          L{threat}
        </text>
      )}
    </g>
  );
}

// ── Hub ─────────────────────────────────────────────────────────────
function HubCenter({ pingAt, hasAlert }) {
  const [pulse, setPulse] = useState(1);
  useEffect(() => {
    let frame, start;
    const tick = (now) => {
      if (!start) start = now;
      setPulse(1 + 0.25 * Math.abs(Math.sin((now - start) * 0.001)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const color = hasAlert ? '#ef4444' : '#157A26';

  return (
    <g>
      <circle cx={`${CX}%`} cy={`${CY}%`} r={`${RADIUS_INNER * 0.5 * pulse}%`}
        fill="none" stroke={color} strokeWidth="0.06%" opacity="0.18" />
      <circle cx={`${CX}%`} cy={`${CY}%`} r={`${RADIUS_INNER * 0.35}%`}
        fill={color} opacity="0.92"
        style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      <circle cx={`${CX}%`} cy={`${CY}%`} r={`${RADIUS_INNER * 0.35}%`}
        fill="none" stroke="var(--color-neo-cream)" strokeWidth="0.12%" opacity="0.55" />
      <text x={`${CX}%`} y={`${CY + 0.4}%`} textAnchor="middle"
        fill="var(--color-neo-cream)" fontSize="0.95%" fontFamily="Syne, sans-serif"
        letterSpacing="0.18em" dominantBaseline="middle" opacity="0.85">
        HUB
      </text>
    </g>
  );
}

// ── Sweep arc (sonar) ───────────────────────────────────────────────
function SweepArc({ angle, hasAlert }) {
  const spread = 28;
  const toXY = (deg, r) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };
  const tip  = toXY(angle, RADIUS_OUTER);
  const tail = toXY(angle - spread, RADIUS_OUTER);
  
  const color = hasAlert ? '#ef4444' : '#157A26';

  // The sweep line itself
  return (
    <>
      {/* Gradient fill arc */}
      <path
        d={`M ${CX}% ${CY}% L ${tip.x}% ${tip.y}% A ${RADIUS_OUTER}% ${RADIUS_OUTER}% 0 0 0 ${tail.x}% ${tail.y}% Z`}
        fill="url(#sweepGrad)" opacity="0.22"
      />
      {/* Bright leading edge line */}
      <line
        x1={`${CX}%`} y1={`${CY}%`}
        x2={`${tip.x}%`} y2={`${tip.y}%`}
        stroke={color} strokeWidth="0.2%"
        opacity="0.7"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </>
  );
}

// ── Main export ─────────────────────────────────────────────────────
export default function FarmScene({ devices, onNodeClick, selectedNode }) {
  const sweep = useSweep();
  const nodes = devices.filter(d => d.type === 'node');
  const hub   = devices.find(d => d.type === 'hub');
  const pings = usePingMap(nodes, sweep);

  const hasAlert = nodes.some(n => (n.telemetry?.[0]?.threat_level ?? 0) > 0);
  const baseColor = hasAlert ? '#ef4444' : '#157A26';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
        onClick={() => onNodeClick(null)}
      >
        <defs>
          <radialGradient id="sweepGrad" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor={baseColor} stopOpacity="0" />
            <stop offset="100%" stopColor={baseColor} stopOpacity="1" />
          </radialGradient>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-neo-surface-2)" />
            <stop offset="100%" stopColor="var(--color-neo-surface)" />
          </radialGradient>
        </defs>

        {/* Background disc */}
        <circle cx={`${CX}%`} cy={`${CY}%`} r={`${RADIUS_OUTER + 5}%`} fill="url(#bgGrad)" stroke="var(--color-neo-border-faint)" strokeWidth="0.1%" />

        {/* Radar rings */}
        {[RADIUS_OUTER, RADIUS_MID, RADIUS_INNER].map(r => (
          <circle key={r} cx={`${CX}%`} cy={`${CY}%`} r={`${r}%`}
            fill="none" stroke="var(--color-neo-border-faint)" strokeWidth="0.1%" />
        ))}

        {/* Cross-hairs */}
        <line x1={`${CX - RADIUS_OUTER}%`} y1={`${CY}%`} x2={`${CX + RADIUS_OUTER}%`} y2={`${CY}%`}
          stroke="var(--color-neo-border-faint)" strokeWidth="0.1%" />
        <line x1={`${CX}%`} y1={`${CY - RADIUS_OUTER}%`} x2={`${CX}%`} y2={`${CY + RADIUS_OUTER}%`}
          stroke="var(--color-neo-border-faint)" strokeWidth="0.1%" />

        {/* Compass */}
        {[['N', CX, CY - RADIUS_OUTER - 2.8], ['S', CX, CY + RADIUS_OUTER + 4],
          ['E', CX + RADIUS_OUTER + 2.8, CY + 0.5], ['W', CX - RADIUS_OUTER - 2.8, CY + 0.5]
        ].map(([l, x, y]) => (
          <text key={l} x={`${x}%`} y={`${y}%`} textAnchor="middle"
            fill="var(--color-neo-cream)" fontSize="1.6%" fontFamily="Syne, sans-serif"
            letterSpacing="0.08em" opacity="0.3">{l}</text>
        ))}

        {/* Sweep */}
        <SweepArc angle={sweep} hasAlert={hasAlert} />

        {/* Nodes */}
        {nodes.map(device => (
          <RadarNode
            key={device.id} device={device}
            onClick={onNodeClick}
            isSelected={selectedNode?.id === device.id}
            pingAt={pings[device.id]}
          />
        ))}

        {/* Hub */}
        {hub && <HubCenter hasAlert={hasAlert} />}
      </svg>
    </div>
  );
}
