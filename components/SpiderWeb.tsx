import React, { useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

interface SpiderWebProps {
  lineColor?: string;
  backgroundColor?: string;
  rings?: number;
  spokes?: number;
  friction?: number;
  tension?: number;
  maxMove?: number;
  hoverRadius?: number;
  className?: string;
}

export const SpiderWeb: React.FC<SpiderWebProps> = ({
  lineColor = "rgba(100, 100, 100, 0.25)",
  backgroundColor = "transparent",
  rings = 8,
  spokes = 12,
  friction = 0.88,
  tension = 0.008,
  maxMove = 50,
  hoverRadius = 150,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[][]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, lx: -1000, ly: -1000 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;
      centerX = width / 2;
      centerY = height / 2;
    };

    const createWeb = () => {
      pointsRef.current = [];
      const maxRadius = Math.max(width, height) * 0.7;

      for (let ring = 0; ring <= rings; ring++) {
        const radius = (ring / rings) * maxRadius;
        const ringPoints: Point[] = [];

        for (let spoke = 0; spoke < spokes; spoke++) {
          const angle = (spoke / spokes) * Math.PI * 2 - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ringPoints.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
          });
        }

        pointsRef.current.push(ringPoints);
      }
    };

    const updatePoints = () => {
      const mouse = mouseRef.current;

      pointsRef.current.forEach((ring) => {
        ring.forEach((point) => {
          const dx = point.baseX - mouse.x;
          const dy = point.baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < hoverRadius) {
            const force = (1 - dist / hoverRadius) * 0.5;
            const angle = Math.atan2(dy, dx);
            point.vx += Math.cos(angle) * force * 2;
            point.vy += Math.sin(angle) * force * 2;
          }

          point.vx += (point.baseX - point.x) * tension;
          point.vy += (point.baseY - point.y) * tension;
          point.vx *= friction;
          point.vy *= friction;

          point.x += point.vx;
          point.y += point.vy;

          const offsetX = point.x - point.baseX;
          const offsetY = point.y - point.baseY;
          const offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

          if (offset > maxMove) {
            const scale = maxMove / offset;
            point.x = point.baseX + offsetX * scale;
            point.y = point.baseY + offsetY * scale;
          }
        });
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      // Draw spiral/rings
      pointsRef.current.forEach((ring) => {
        ctx.beginPath();
        ring.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        ctx.stroke();
      });

      // Draw spokes
      for (let spoke = 0; spoke < spokes; spoke++) {
        ctx.beginPath();
        pointsRef.current.forEach((ring, i) => {
          const point = ring[spoke];
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }

      // Draw center spider
      ctx.fillStyle = lineColor.replace(/[\d.]+\)$/, "0.3)");
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      updatePoints();
      draw();
      frameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.lx = mouseRef.current.x;
      mouseRef.current.ly = mouseRef.current.y;
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.lx = mouseRef.current.x;
      mouseRef.current.ly = mouseRef.current.y;
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
    };

    const handleResize = () => {
      setSize();
      createWeb();
    };

    setSize();
    createWeb();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [lineColor, rings, spokes, friction, tension, maxMove, hoverRadius]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none ${className}`}
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
