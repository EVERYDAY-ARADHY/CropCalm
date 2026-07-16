import React, { useEffect, useRef } from 'react';

const LETTERS = {
  M: [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  A: [
    [0,1,1,0],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  I: [
    [1,1,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [1,1,1],
  ],
  L: [
    [1,0,0],
    [1,0,0],
    [1,0,0],
    [1,0,0],
    [1,1,1],
  ],
  C: [
    [0,1,1,1],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [0,1,1,1],
  ],
  R: [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,1,0],
    [1,0,0,1],
  ],
  E: [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  H: [
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  '@': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,1,1,1],
    [1,0,0,0,0],
    [0,1,1,1,0],
  ],
  U: [
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  S: [
    [0,1,1,1],
    [1,0,0,0],
    [0,1,1,0],
    [0,0,0,1],
    [1,1,1,0],
  ],
  F: [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,0,0,0],
  ],
  O: [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  W: [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [1,0,0,0,1],
  ],
  T: [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  ' ': [
    [0,0],
    [0,0],
    [0,0],
    [0,0],
    [0,0],
  ],
  P: [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,0,0],
    [1,0,0,0],
  ],
  GITHUB: [
    [0,1,0,0,0,0,0,1,0],
    [0,1,1,0,0,0,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,0,1,1,1,0,1,1],
    [1,1,1,1,1,1,1,1,1],
    [0,1,1,0,1,0,1,1,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0],
  ]
};

const WORDS = {
  0: ['C', 'A', 'L', 'L', ' ', 'U', 'S'],
  1: ['@', 'F', 'O', 'L', 'L', 'O', 'W'],
  2: ['M', 'A', 'I', 'L', ' ', 'U', 'S'],
  3: ['R', 'E', 'A', 'C', 'H', 'O', 'U', 'T'],
  4: ['R', 'E', 'P', 'O']
};

const AnimatedGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height;
    
    let gridSize = 30; // Matches old background-size: 30px 30px
    let cols, rows;
    
    const activeCells = new Map();
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Dynamically scale grid size down on mobile so long text like "REACHOUT" fits
      if (width < 450) gridSize = 10;
      else if (width < 768) gridSize = 15;
      else if (width < 1024) gridSize = 20;
      else gridSize = 30;

      cols = Math.ceil(width / gridSize);
      rows = Math.ceil(height / gridSize);
    };

    window.addEventListener('resize', resize);
    resize();

    const drawWord = (wordArr) => {
      if (!cols || !rows) return;

      // Calculate total width of the word in grid cells
      let totalWidth = 0;
      wordArr.forEach(char => {
        const matrix = LETTERS[char];
        if (matrix) totalWidth += matrix[0].length + 1;
      });

      // On desktop start near menu bar (320px). On mobile start near edge (20px)
      const basePadding = width < 768 ? 20 : 320;
      let startX = Math.floor(basePadding / gridSize);
      
      // If the word overflows the right edge of the screen, pull it back to the left so it perfectly fits
      if (startX + totalWidth > cols - 2) {
        const safeMargin = width < 768 ? 10 : 250;
        startX = Math.max(Math.floor(safeMargin / gridSize), cols - totalWidth - 2);
      }

      let currentX = startX;
      let currentY = Math.floor(rows * 0.2); // 20% down

      wordArr.forEach(char => {
        const matrix = LETTERS[char];
        if (!matrix) return;
        
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c]) {
              const key = `${currentX + c},${currentY + r}`;
              activeCells.set(key, { 
                life: 1, 
                maxLife: 120, // Frames before fading out
                color: '#157A26' // Green hex theme
              });
            }
          }
        }
        currentX += matrix[0].length + 1; // 1 cell spacing
      });
    };

    const handleSwap = (e) => {
      const idx = e.detail.activeIndex;
      if (WORDS[idx]) {
        drawWord(WORDS[idx]);
      }
    };

    window.addEventListener('card-swap', handleSwap);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const isLight = document.documentElement.classList.contains('light');
      const gridColor = isLight ? 'rgba(16, 16, 16, 0.05)' : 'rgba(244, 231, 213, 0.04)';
      const highlightColor = isLight ? 'rgba(16, 16, 16, 0.15)' : 'rgba(244, 231, 213, 0.15)';
      
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Spawning logic removed, waiting for explicit animation commands

      for (const [key, cell] of activeCells.entries()) {
        const [x, y] = key.split(',').map(Number);
        
        const progress = cell.life / cell.maxLife;
        let opacity = 0;
        
        if (progress < 0.2) opacity = progress * 5;
        else if (progress > 0.7) opacity = (1 - progress) * 3.33;
        else opacity = 1;

        ctx.fillStyle = cell.color || highlightColor;
        ctx.globalAlpha = opacity;
        
        if (cell.color) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = cell.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, gridSize - 2);
        
        // Reset shadow for the next draw
        ctx.shadowBlur = 0;
        
        cell.life++;
        if (cell.life >= cell.maxLife) {
          activeCells.delete(key);
        }
      }
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('card-swap', handleSwap);
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

export default AnimatedGrid;
