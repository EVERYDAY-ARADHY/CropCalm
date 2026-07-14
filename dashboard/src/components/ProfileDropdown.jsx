import React, { useState, useRef, useEffect } from 'react';

const AVATAR_SVG = {
  1: { bg: '#ef4444', accent: '#f97316' },
  2: { bg: '#1a0a00', accent: '#f97316' },
  3: { bg: '#030f05', accent: '#157A26' },
  4: { bg: '#0f1f3d', accent: '#3b82f6' },
};

function MiniAvatar({ avatarId, size = 36 }) {
  const c = AVATAR_SVG[avatarId] || AVATAR_SVG[1];
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect fill={c.bg} height="36" width="36" rx="18" />
      <rect fill={c.accent} height="36" rx="6"
        transform="translate(9 -5) rotate(219 18 18) scale(1)" width="36" />
      <g transform="translate(4.5 -4) rotate(9 18 18)">
        <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#fff" strokeLinecap="round" />
        <rect fill="#fff" height="2" rx="1" width="1.5" x="10" y="14" />
        <rect fill="#fff" height="2" rx="1" width="1.5" x="24" y="14" />
      </g>
    </svg>
  );
}

export default function ProfileDropdown({ profile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarId = profile?.avatar_id || 1;
  const name     = profile?.name || 'Farmer';
  const email    = profile?.phone || '—';
  const level    = profile?.threat_profile?.overallLevel || 'ACTIVE';

  const menuItems = [
    { icon: '⊙', label: 'Profile', action: null },
    { icon: '⚙', label: 'Settings', action: null },
    { icon: '◎', label: 'Threat Level', value: level },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 10px 6px 6px',
          borderRadius: '16px',
          border: `2px solid ${open ? 'rgba(244,231,213,0.5)' : 'rgba(244,231,213,0.2)'}`,
          background: 'var(--color-neo-surface)',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: open ? '0 0 16px rgba(244,231,213,0.08)' : 'none',
        }}
      >
        {/* Avatar ring */}
        <div style={{
          borderRadius: '50%',
          padding: '2px',
          background: `linear-gradient(135deg, ${AVATAR_SVG[avatarId]?.accent || '#157A26'}, #157A26)`,
          flexShrink: 0,
        }}>
          <div style={{ borderRadius: '50%', overflow: 'hidden', lineHeight: 0 }}>
            <MiniAvatar avatarId={avatarId} size={32} />
          </div>
        </div>
        {/* Name + email */}
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <div className="font-subheading font-bold" style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neo-cream)', lineHeight: 1.2 }}>
            {name.length > 12 ? name.slice(0, 12) + '…' : name}
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'rgba(244,231,213,0.35)', lineHeight: 1.2, marginTop: '1px' }}>
            {email}
          </div>
        </div>
        {/* Chevron */}
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="rgba(244,231,213,0.4)" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '220px',
          background: 'var(--color-neo-surface)',
          border: '2px solid rgba(244,231,213,0.15)',
          borderRadius: '18px',
          padding: '10px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,231,213,0.05)',
          zIndex: 100,
          animation: 'ddFadeIn 0.18s ease-out both',
        }}>
          <style>{`@keyframes ddFadeIn { from { opacity:0; transform: translateY(-6px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }`}</style>

          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '6px', borderRadius: '12px', background: 'rgba(244,231,213,0.04)' }}>
            <div style={{ borderRadius: '50%', overflow: 'hidden', flexShrink: 0, lineHeight: 0 }}>
              <MiniAvatar avatarId={avatarId} size={36} />
            </div>
            <div>
              <div className="font-heading" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-neo-cream)' }}>{name}</div>
              <div style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'rgba(244,231,213,0.3)', textTransform: 'uppercase' }}>{email}</div>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
            {menuItems.map((item) => (
              <button key={item.label}
                onClick={() => { if (item.action) item.action(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '9px 12px', borderRadius: '11px', border: 'none',
                  background: 'transparent', color: 'rgba(244,231,213,0.7)', cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,231,213,0.07)'; e.currentTarget.style.color = 'var(--color-neo-cream)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(244,231,213,0.7)'; }}
              >
                <span className="font-subheading" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {item.label}
                </span>
                {item.value && (
                  <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '8px', background: 'rgba(21,122,38,0.2)', color: '#157A26', border: '1px solid rgba(21,122,38,0.3)', letterSpacing: '0.05em' }}>
                    {item.value}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(244,231,213,0.08)', margin: '4px 0 8px' }} />

          {/* Sign Out */}
          <button
            onClick={() => { setOpen(false); if (onLogout) onLogout(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px', borderRadius: '11px', border: 'none',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="font-subheading" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
