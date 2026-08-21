'use client';
import { useRef, useEffect } from 'react';

interface ShapeGridProps {
  direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  shape?: 'square' | 'hexagon' | 'circle' | 'triangle';
  hoverTrailAmount?: number;
  className?: string;
}

const ShapeGrid = ({
  direction = 'diagonal',
  speed = 0.4,
  borderColor = '#2A2A30',
  squareSize = 40,
  hoverFillColor = 'rgba(200,241,53,0.08)',
  shape = 'square',
  hoverTrailAmount = 4,
  className = '',
}: ShapeGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null);
  const trailCells = useRef<{ x: number; y: number }[]>([]);
  const cellOpacities = useRef(new Map<string, number>());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const cols = Math.ceil(canvas.width / squareSize) + 3;
      const rows = Math.ceil(canvas.height / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const sx = col * squareSize + offsetX;
          const sy = row * squareSize + offsetY;
          const cellKey = `${col},${row}`;
          const alpha = cellOpacities.current.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(sx, sy, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(sx, sy, squareSize, squareSize);
        }
      }

      // vignette
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0.3, 'rgba(13,13,15,0)');
      gradient.addColorStop(1, 'rgba(13,13,15,0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateCellOpacities = () => {
      const targets = new Map<string, number>();
      if (hoveredSquare.current) targets.set(`${hoveredSquare.current.x},${hoveredSquare.current.y}`, 1);
      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trailCells.current.length; i++) {
          const t = trailCells.current[i];
          const key = `${t.x},${t.y}`;
          if (!targets.has(key)) targets.set(key, (trailCells.current.length - i) / (trailCells.current.length + 1));
        }
      }
      for (const [key] of targets) {
        if (!cellOpacities.current.has(key)) cellOpacities.current.set(key, 0);
      }
      for (const [key, opacity] of cellOpacities.current) {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.15;
        if (next < 0.005) cellOpacities.current.delete(key);
        else cellOpacities.current.set(key, next);
      }
    };

    const updateAnimation = () => {
      const s = Math.max(speed, 0.1);
      const wrap = squareSize;
      switch (direction) {
        case 'right':    gridOffset.current.x = (gridOffset.current.x - s + wrap) % wrap; break;
        case 'left':     gridOffset.current.x = (gridOffset.current.x + s + wrap) % wrap; break;
        case 'up':       gridOffset.current.y = (gridOffset.current.y + s + wrap) % wrap; break;
        case 'down':     gridOffset.current.y = (gridOffset.current.y - s + wrap) % wrap; break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - s + wrap) % wrap;
          gridOffset.current.y = (gridOffset.current.y - s + wrap) % wrap;
          break;
      }
      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const col = Math.floor((mouseX - offsetX) / squareSize);
      const row = Math.floor((mouseY - offsetY) / squareSize);
      if (!hoveredSquare.current || hoveredSquare.current.x !== col || hoveredSquare.current.y !== row) {
        if (hoveredSquare.current && hoverTrailAmount > 0) {
          trailCells.current.unshift({ ...hoveredSquare.current });
          if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
        }
        hoveredSquare.current = { x: col, y: row };
      }
    };

    const handleMouseLeave = () => {
      if (hoveredSquare.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquare.current });
        if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
      }
      hoveredSquare.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let isVisible = false;
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !requestRef.current) requestRef.current = requestAnimationFrame(updateAnimation);
      else if (!isVisible && requestRef.current) { cancelAnimationFrame(requestRef.current); requestRef.current = null; }
    }, { threshold: 0 });
    io.observe(canvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      io.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, shape, hoverTrailAmount]);

  return <canvas ref={canvasRef} className={`w-full h-full block border-none ${className}`} />;
};

export default ShapeGrid;
