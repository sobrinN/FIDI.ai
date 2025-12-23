import React, { useEffect, useRef } from 'react';

export const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // Initial resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Neural Network Configuration
    // Reduced count for optimization and minimalism
    const nodeCount = Math.min(50, Math.floor(width / 30));
    const connectionDistance = 150;
    const pulseSpeed = 2;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }

    interface Pulse {
      from: Node;
      to: Node;
      progress: number; // 0 to 1
      life: number;
    }

    const nodes: Node[] = [];
    const pulses: Pulse[] = [];

    // Initialize Nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, // Slower movement
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and Draw Nodes - Even lighter for minimalism
      ctx.fillStyle = 'rgba(191, 219, 254, 0.2)';
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Connections and Manage Pulses
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            // Draw Line
            const opacity = 1 - distance / connectionDistance;
            ctx.strokeStyle = `rgba(191, 219, 254, ${opacity * 0.15})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Randomly trigger a pulse
            if (Math.random() < 0.0005) {
              pulses.push({
                from: nodes[i],
                to: nodes[j],
                progress: 0,
                life: 1
              });
            }
          }
        }
      }

      // Update and Draw Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulseSpeed / 100; // Speed of pulse

        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const currentX = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
        const currentY = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

        ctx.fillStyle = `rgba(191, 219, 254, ${0.8 * (1 - pulse.progress)})`;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};