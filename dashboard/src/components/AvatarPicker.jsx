import React, { useState } from 'react';
import './AvatarPicker.css';

const AVATARS = [
  {
    id: 1,
    label: 'Warrior',
    color: '#ef4444',
    svg: (
      <svg fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <mask id="av1" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#fff" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av1)">
          <rect fill="#ef4444" height="36" width="36" />
          <rect fill="#f97316" height="36" rx="6" transform="translate(9 -5) rotate(219 18 18) scale(1)" width="36" />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000" strokeLinecap="round" />
            <rect fill="#000" height="2" rx="1" width="1.5" x="10" y="14" />
            <rect fill="#000" height="2" rx="1" width="1.5" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 2,
    label: 'Guardian',
    color: '#f97316',
    svg: (
      <svg fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <mask id="av2" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#fff" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av2)">
          <rect fill="#1a0a00" height="36" width="36" />
          <rect fill="#f97316" height="36" rx="6" transform="translate(5 -1) rotate(55 18 18) scale(1.1)" width="36" />
          <g transform="translate(7 -6) rotate(-5 18 18)">
            <path d="M15 20c2 1 4 1 6 0" fill="none" stroke="#fff" strokeLinecap="round" />
            <rect fill="#fff" height="2" rx="1" width="1.5" x="14" y="14" />
            <rect fill="#fff" height="2" rx="1" width="1.5" x="20" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 3,
    label: 'Scout',
    color: '#157A26',
    svg: (
      <svg fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <mask id="av3" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#fff" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av3)">
          <rect fill="#030f05" height="36" width="36" />
          <rect fill="#157A26" height="36" rx="36" transform="translate(-3 7) rotate(227 18 18) scale(1.2)" width="36" />
          <g transform="translate(-3 3.5) rotate(7 18 18)">
            <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#F4E7D5" />
            <rect fill="#F4E7D5" height="2" rx="1" width="1.5" x="12" y="14" />
            <rect fill="#F4E7D5" height="2" rx="1" width="1.5" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 4,
    label: 'Elder',
    color: '#3b82f6',
    svg: (
      <svg fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <mask id="av4" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#fff" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av4)">
          <rect fill="#0f1f3d" height="36" width="36" />
          <rect fill="#3b82f6" height="36" rx="6" transform="translate(9 -5) rotate(219 18 18) scale(1)" width="36" />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#fff" strokeLinecap="round" />
            <rect fill="#fff" height="2" rx="1" width="1.5" x="10" y="14" />
            <rect fill="#fff" height="2" rx="1" width="1.5" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
];

export default function AvatarPicker({ value, onChange }) {
  const selected = AVATARS.find(a => a.id === value) || AVATARS[0];
  const [animKey, setAnimKey]   = useState(0);

  const handleSelect = (av) => {
    if (av.id === selected.id) return;
    onChange(av.id);
    setAnimKey(k => k + 1);
  };

  return (
    <div className="av-card">
      <div className="av-header">
        <h2 className="font-heading text-3xl uppercase tracking-widest">Pick Your Avatar</h2>
        <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mt-1">
          Choose one to get started
        </p>
      </div>

      {/* Stage */}
      <div className="av-stage-wrap">
        <div
          className="av-stage"
          style={{ boxShadow: `0 0 0 3px ${selected.color}80, 0 0 28px ${selected.color}40` }}
        >
          <div key={animKey} className="av-stage-inner">
            {selected.svg}
          </div>
        </div>
        <p className="font-subheading text-[10px] uppercase tracking-widest mt-3" style={{ color: selected.color }}>
          {selected.label}
        </p>
      </div>

      {/* Thumbnail strip */}
      <div className="av-strip">
        {AVATARS.map(av => {
          const isSel = av.id === selected.id;
          return (
            <button
              key={av.id}
              onClick={() => handleSelect(av)}
              aria-label={`Select ${av.label}`}
              className="av-thumb"
              style={{
                border: isSel ? `2px solid ${av.color}` : '2px solid rgba(244,231,213,0.15)',
                boxShadow: isSel ? `0 0 12px ${av.color}66` : 'none',
                opacity: isSel ? 1 : 0.5,
                transform: isSel ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <div className="av-thumb-inner">{av.svg}</div>
              {isSel && (
                <div className="av-check" style={{ backgroundColor: av.color }}>
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
