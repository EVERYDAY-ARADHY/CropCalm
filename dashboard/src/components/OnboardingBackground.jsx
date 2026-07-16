import React, { useEffect, useRef } from 'react';

const OnboardingBackground = ({ step = 1, isSaving = false }) => {
  const canvasRef = useRef(null);
  const stepRef = useRef(step);
  const isSavingRef = useRef(isSaving);

  // Sync refs so animation loop uses latest without remounting
  useEffect(() => {
    stepRef.current = step;
    isSavingRef.current = isSaving;
  }, [step, isSaving]);

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
          // Diagonally left-to-right top-to-bottom
          const nx = c / cols;
          const ny = r / rows;
          const pos = nx + ny; 
          
          let sliceIndex = Math.floor((pos / 2.0) * 5);
          if (sliceIndex > 4) sliceIndex = 4;

          cells.set(key, {
            c, r,
            sliceIndex,
            currentOpacity: 0,
            delayOffset: Math.random() * Math.PI * 2, 
          });
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const rColor = 21, gColor = 122, bColor = 38;
      time += 0.03;

      for (const [key, cell] of cells.entries()) {
        const { c, r, sliceIndex, delayOffset } = cell;
        
        let targetOpacity = 0;
        
        if (isSavingRef.current) {
          const wave = (Math.sin(c * 0.15 + time) + Math.cos(r * 0.15 + time) + 2) / 4; 
          targetOpacity = wave * 0.7; // Much brighter loading wave
        } else {
          if (stepRef.current - 1 >= sliceIndex) {
            targetOpacity = 0.1 + Math.abs(Math.sin(time * 0.5 + delayOffset)) * 0.45; // Max opacity ~0.55
          } else {
            targetOpacity = 0;
          }
        }

        cell.currentOpacity += (targetOpacity - cell.currentOpacity) * 0.1;
        
        if (cell.currentOpacity > 0.005) {
          ctx.fillStyle = `rgba(${rColor}, ${gColor}, ${bColor}, ${cell.currentOpacity})`;
          ctx.fillRect(offsetX + c * gridSize, offsetY + r * gridSize, gridSize - 1, gridSize - 1);
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

export default OnboardingBackground;
