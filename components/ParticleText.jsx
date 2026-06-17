"use client";
import React, { useRef, useEffect } from 'react';

export default function ParticleText({ text }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    let particlesArray = [];
    let animationFrameId;
    
    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    let mouse = {
      x: null,
      y: null,
      radius: 120
    };
    
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    
    const init = () => {
      setCanvasSize();
      particlesArray = [];
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
      
      const lines = text.split('\n');
      const baseFontSize = Math.min(canvas.width / 5.5, 240); // Slightly larger
      offscreenCtx.font = `900 ${baseFontSize}px "Outfit", sans-serif`;
      offscreenCtx.fillStyle = 'white';
      offscreenCtx.textAlign = 'center';
      offscreenCtx.textBaseline = 'middle';
      
      const lineHeight = baseFontSize * 0.9;
      const totalHeight = lines.length * lineHeight;
      const startY = (canvas.height - totalHeight) / 2 + lineHeight / 2 - (baseFontSize * 0.4);
      
      lines.forEach((line, i) => {
        offscreenCtx.fillText(line, canvas.width / 2, startY + i * lineHeight);
      });
      
      const textCoordinates = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = textCoordinates.data;
      
      const step = Math.max(Math.floor(canvas.width / 180), 5); // Tighter step for more dots
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          if (data[(y * canvas.width + x) * 4 + 3] > 128) {
            let positionX = x;
            let positionY = y;
            const size = Math.random() * 3 + 1.5; // Bigger particles
            const isRed = Math.random() > 0.92;
            const color = isRed ? '#E63946' : 'rgba(255, 255, 255, 0.7)';
            particlesArray.push(new Particle(positionX, positionY, size, color));
          }
        }
      }
    };
    
    class Particle {
      constructor(x, y, size, color) {
        this.x = x + (Math.random() - 0.5) * 10;
        this.y = y + (Math.random() - 0.5) * 10;
        this.baseX = x;
        this.baseY = y;
        this.size = size;
        this.color = color;
        this.density = (Math.random() * 30) + 5;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        
        const maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        if (force < 0) force = 0;
        
        let directionX = (forceDirectionX * force * this.density);
        let directionY = (forceDirectionY * force * this.density);
        
        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            let dxBase = this.x - this.baseX;
            this.x -= dxBase / 10;
          }
          if (this.y !== this.baseY) {
            let dyBase = this.y - this.baseY;
            this.y -= dyBase / 10;
          }
        }
      }
    }
    
    const connect = () => {
      let opacityValue = 1;
      const connectDist = Math.max(canvas.width / 60, 20);
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectDist) {
            opacityValue = 1 - (distance/connectDist);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }
      connect();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    document.fonts.ready.then(() => {
      init();
      animate();
    });
    
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        init();
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
}
