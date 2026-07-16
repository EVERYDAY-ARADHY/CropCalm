import React, { useEffect, useRef } from 'react';

const RingBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height;
    
    let gridSize = 40; 
    let cols, rows;
    let offsetX = 0, offsetY = 0;
    
    const cells = new Map();
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      if (width < 768) gridSize = 30;
      else gridSize = 40;

      cols = Math.ceil(width / gridSize);
      rows = Math.ceil(height / gridSize);
      
      offsetX = (width - (cols * gridSize)) / 2;
      offsetY = (height - (rows * gridSize)) / 2;
      
      cells.clear();
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const key = `${c},${r}`;
          // Calculate distance from center for ring effect
          const nx = c / cols;
          const ny = r / rows;
          
          // Adjust for aspect ratio so rings are circular, not elliptical
          const aspect = width / height;
          const dx = (nx - 0.5) * aspect;
          const dy = ny - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy); 

          cells.set(key, {
            c, r,
            dist,
            currentOpacity: 0
          });
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const rColor = 21, gColor = 122, bColor = 38;
      time += 0.04;

      for (const [key, cell] of cells.entries()) {
        const { c, r, dist } = cell;
        
        // Outward expanding ripple math
        // Multiply dist to get more rings (lower number = further apart), multiply time for speed
        const wave = Math.sin(dist * 12 - time * 1.5);
        
        // Only show the positive peaks of the sine wave to make distinct rings
        // Scale it down so it's subtle (max opacity 0.3)
        let targetOpacity = wave > 0 ? wave * 0.3 : 0;

        // Smoothly transition opacity to prevent harsh flickering on fast moving pixels
        cell.currentOpacity += (targetOpacity - cell.currentOpacity) * 0.2;
        
        if (cell.currentOpacity > 0.005) {
          ctx.fillStyle = `rgba(${rColor}, ${gColor}, ${bColor}, ${cell.currentOpacity})`;
          // Draw pixel exactly at grid size to keep it seamless like Onboarding
          ctx.fillRect(offsetX + c * gridSize, offsetY + r * gridSize, gridSize, gridSize);
        }
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); 

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 0 }}
    />
  );
};

export default RingBackground;
