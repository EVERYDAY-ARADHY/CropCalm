import React, { useEffect, useRef } from 'react';

const RingBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height, maxRadius;
    
    let time = 0;
    
    // Configuration
    const numRings = 7; // Number of rings visible at once
    const speed = 0.8; // Speed of expansion
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Calculate max radius needed to cover the corners
      maxRadius = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)) + 100;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      time += speed;
      
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < numRings; i++) {
        // Calculate radius using modulo arithmetic to make it continuous
        let radius = (time + i * (maxRadius / numRings)) % maxRadius;
        
        // Fading effect: fading out towards the edges
        let opacity = 1 - (radius / maxRadius);
        
        // Make the fade-out slightly smoother (exponential)
        opacity = Math.pow(opacity, 1.2);
        
        // Base color: CropCalm Green #157A26
        const rColor = 21, gColor = 122, bColor = 38;
        
        // The max opacity should be quite low so it's a subtle background
        const maxOp = 0.25; 
        
        if (opacity > 0 && radius > 0) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(${rColor}, ${gColor}, ${bColor}, ${opacity * maxOp})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
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
