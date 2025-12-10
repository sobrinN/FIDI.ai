import React, { useEffect, useRef } from 'react';

export const NeuralPlanet: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration
    const particleCount = 200;
    const globeRadius = 140; 
    const connectionThreshold = 50; 
    const rotationSpeed = 0.003;
    const interactionRadius = 100; // Radius of the "opening" effect
    const repulsionStrength = 60; // How much it opens

    // State
    let width = container.clientWidth;
    let height = container.clientHeight;
    let angleY = 0;
    let angleX = 0.15; // Slight tilt

    // Set canvas size
    const handleResize = () => {
      if (container) {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse Tracking (Global window listener to work through text overlays)
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle Type
    interface Particle {
      x: number;
      y: number;
      z: number;
      neighbors: number[]; 
    }

    const particles: Particle[] = [];

    // Initialize Particles (Fibonacci Sphere Algorithm)
    const phi = Math.PI * (3 - Math.sqrt(5)); 

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; 
      const radiusAtY = Math.sqrt(1 - y * y); 
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      particles.push({
        x: x * globeRadius,
        y: y * globeRadius,
        z: z * globeRadius,
        neighbors: []
      });
    }

    // Pre-calculate neighbors
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dz = particles[i].z - particles[j].z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist < connectionThreshold) {
          particles[i].neighbors.push(j);
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;

      // Rotate
      angleY += rotationSpeed;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Project particles
      const projected = particles.map(p => {
        // Rotation around Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        
        // Rotation around X (Tilt)
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Perspective projection
        const scale = 500 / (500 - z2);
        let x2d = x1 * scale + centerX;
        let y2d = y1 * scale + centerY;

        // --- MOUSE INTERACTION (Repulsion) ---
        const dx = x2d - mouseRef.current.x;
        const dy = y2d - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < interactionRadius) {
          const force = (interactionRadius - dist) / interactionRadius; // 0 to 1 based on proximity
          const angle = Math.atan2(dy, dx);
          
          // Push away
          x2d += Math.cos(angle) * force * repulsionStrength;
          y2d += Math.sin(angle) * force * repulsionStrength;
        }

        return { x: x2d, y: y2d, z: z2, scale };
      });

      ctx.lineWidth = 1;

      // Draw connections
      for (let i = 0; i < particleCount; i++) {
        const p1 = projected[i];
        if (p1.scale < 0) continue; 

        const neighbors = particles[i].neighbors;
        
        for (let nIdx of neighbors) {
          const p2 = projected[nIdx];
          
          // Depth cueing
          const depthAlpha = (p1.scale + p2.scale) / 2 - 0.4; 
          
          if (depthAlpha > 0.1) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${depthAlpha * 0.3})`; // Blue-500
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      projected.forEach(p => {
        const alpha = Math.max(0.1, (p.scale - 0.5) * 1.5);
        if (p.scale < 0.5) return; 

        const size = Math.max(1, p.scale * 2);
        
        ctx.fillStyle = `rgba(191, 219, 254, ${alpha})`; // Blue-200
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-visible pointer-events-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-blue-600/10 rounded-full blur-[50px]" />
      <canvas ref={canvasRef} className="relative z-10" />
    </div>
  );
};