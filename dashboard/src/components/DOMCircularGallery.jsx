import React, { useRef, useEffect, Children, useCallback, useState, forwardRef, useImperativeHandle } from 'react';

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function playTickSound(audioCtxRef) {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Short mechanical ratchet/click tick
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      // Decaying noise burst
      data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / data.length, 3);
    }
    const source = ctx.createBufferSource();
    source.buffer = buf;

    // Band-pass filter to give it a "wooden click" character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch (e) {
    // Ignore audio errors silently
  }
}

const DOMCircularGallery = forwardRef(({
  children,
  scrollSpeed = 2,
  scrollEase = 0.08,
  itemWidth = 380,
  itemHeight = 460,
  gap = 180,
  topOffset = 40,       // px from top so cards aren't clipped
  bendStrength = 160,   // how much side cards dip down
  onIndexChange,
}, ref) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const scroll = useRef({ current: 0, target: 0, position: 0 });
  const isDown = useRef(false);
  const start = useRef(0);
  const itemRefs = useRef([]);
  const overlayRefs = useRef([]);
  const activeIdxRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const audioCtxRef = useRef(null);

  const numItems = Children.count(children);
  const stride = itemWidth + gap;
  const widthTotal = stride * numItems;

  useImperativeHandle(ref, () => ({
    scrollTo: (index) => {
      scroll.current.target = index * stride;
    }
  }), [stride]);

  const update = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    scroll.current.current = lerp(scroll.current.current, scroll.current.target, scrollEase);
    const W = container.offsetWidth;
    const H = W / 2;

    const R = H > 0 ? (H * H + bendStrength * bendStrength) / (2 * bendStrength) : 1000;

    let closestDist = Infinity;
    let closestIdx = 0;

    for (let i = 0; i < numItems; i++) {
      let x = stride * i - scroll.current.current;

      // Infinite wrap
      if (widthTotal > 0) {
        const halfTotal = widthTotal / 2;
        x = ((x + halfTotal) % widthTotal + widthTotal) % widthTotal - halfTotal;
      }

      // Arch: center at top (y=topOffset), sides dip DOWN
      const effectiveX = Math.min(Math.abs(x), H);
      const disc = R * R - effectiveX * effectiveX;
      const arc = disc > 0 ? R - Math.sqrt(disc) : bendStrength;
      const y = arc; // positive y = dips downward = arch visible from top
      const rot = disc > 0 ? Math.sign(x) * Math.asin(Math.min(effectiveX / R, 1)) : 0;

      if (Math.abs(x) < closestDist) {
        closestDist = Math.abs(x);
        closestIdx = i;
      }

      // Scale: center = 1.0, far sides = 0.85
      const normalizedDist = Math.min(Math.abs(x) / (stride * 1.5), 1);
      const scale = 1 - normalizedDist * 0.15;

      // Dim overlay: 0 for center card, up to 0.82 for far edges
      // Card is "active" if within half a stride from center
      const isActive = Math.abs(x) < stride * 0.5;
      const dimOpacity = isActive ? 0 : Math.min((Math.abs(x) - stride * 0.45) / (stride * 0.8), 1) * 0.82;

      const el = itemRefs.current[i];
      if (el) {
        el.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotateZ(${rot}rad)`;
        el.style.scale = String(scale);
      }

      const overlay = overlayRefs.current[i];
      if (overlay) {
        overlay.style.opacity = String(dimOpacity);
      }
    }

    if (closestIdx !== activeIdxRef.current) {
      activeIdxRef.current = closestIdx;
      setActiveIndex(closestIdx);
      if (onIndexChange) onIndexChange(closestIdx);
      playTickSound(audioCtxRef);
    }

    rafRef.current = requestAnimationFrame(update);
  }, [scrollEase, numItems, stride, widthTotal, bendStrength]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [update]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const snapToNearest = () => {
      const itemIndex = Math.round(scroll.current.target / stride);
      scroll.current.target = stride * itemIndex;
    };

    let timeout;
    const debouncedSnap = () => {
      clearTimeout(timeout);
      timeout = setTimeout(snapToNearest, 120);
    };

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      scroll.current.target += delta * (scrollSpeed * 0.25);
      debouncedSnap();
    };

    const onMouseDown = (e) => {
      isDown.current = true;
      scroll.current.position = scroll.current.current;
      start.current = e.clientX;
      container.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
      if (!isDown.current) return;
      const distance = (start.current - e.clientX) * 1.5;
      scroll.current.target = scroll.current.position + distance;
    };

    const onMouseUp = () => {
      if (!isDown.current) return;
      isDown.current = false;
      container.style.cursor = 'grab';
      snapToNearest();
    };

    const onTouchStart = (e) => {
      isDown.current = true;
      scroll.current.position = scroll.current.current;
      start.current = e.touches[0].clientX;
    };

    const onTouchMove = (e) => {
      if (!isDown.current) return;
      const distance = (start.current - e.touches[0].clientX) * 1.5;
      scroll.current.target = scroll.current.position + distance;
    };

    const onTouchEnd = () => {
      isDown.current = false;
      snapToNearest();
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      clearTimeout(timeout);
    };
  }, [stride, scrollSpeed]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'grab',
      }}
    >
      {Children.map(children, (child, i) => (
        <div
          key={i}
          ref={el => (itemRefs.current[i] = el)}
          style={{
            position: 'absolute',
            left: '50%',
            top: `${topOffset}px`,
            width: `${itemWidth}px`,
            height: `${itemHeight}px`,
            willChange: 'transform, scale',
            transformOrigin: 'center center',
          }}
        >
          {child}
          {/* Dark dim overlay for unfocused cards */}
          <div
            ref={el => (overlayRefs.current[i] = el)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.88)',
              borderRadius: '16px',
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.25s ease',
              zIndex: 20,
            }}
          />
        </div>
      ))}
      {/* Radial dark fade at left and right bottom corners */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
        background: `
          radial-gradient(ellipse 38% 85% at 0% 100%,   #010101 0%, rgba(1,1,1,0.92) 18%, rgba(1,1,1,0.65) 40%, rgba(1,1,1,0.25) 65%, transparent 88%),
          radial-gradient(ellipse 38% 85% at 100% 100%, #010101 0%, rgba(1,1,1,0.92) 18%, rgba(1,1,1,0.65) 40%, rgba(1,1,1,0.25) 65%, transparent 88%)
        `,
      }} />
    </div>
  );
});

export default DOMCircularGallery;
