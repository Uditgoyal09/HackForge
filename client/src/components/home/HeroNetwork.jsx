import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useTime, useAnimationFrame } from 'framer-motion';

const nodesData = [
  { id: 'CODE', bx: 150, by: 180, rx: 6, ry: 4, speed: 0.0004, phase: 0, label: 'BUILD' },
  { id: 'BUILD', bx: 850, by: 180, rx: 4, ry: 7, speed: 0.0003, phase: 1.5, label: 'SHIP' },
  { id: 'SHIP', bx: 850, by: 620, rx: 5, ry: 5, speed: 0.0005, phase: 3, label: 'DEPLOY' },
  { id: 'COMPETE', bx: 500, by: 720, rx: 7, ry: 3, speed: 0.00035, phase: 4.5, label: 'TEAM' },
  { id: 'INNOVATE', bx: 150, by: 620, rx: 4, ry: 6, speed: 0.00045, phase: 6, label: 'IDEATE' },
];

const edges = [
  { source: 0, target: 1 },
  { source: 1, target: 2 },
  { source: 2, target: 3 },
  { source: 3, target: 4 },
  { source: 4, target: 0 },
  { source: 0, target: 3 },
  { source: 1, target: 4 },
];

// Data flow particles (just 2 for subtlety)
const particles = [
  { edgeIndex: 0, duration: 15000, delay: 0, dir: 1 },
  { edgeIndex: 2, duration: 20000, delay: 5000, dir: -1 },
];

const HeroNetwork = () => {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 1000], [0, 150]);
  const networkScale = useTransform(scrollY, [0, 500], [1, 1.05]);
  const networkOpacity = useTransform(scrollY, [0, 500], [1, 0.2]);
  const networkBlur = useTransform(scrollY, [0, 500], [0, 1]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 50, damping: 30 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleMouseMove = (e) => {
      if (isReducedMotion || isTouchDevice) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isReducedMotion, isTouchDevice]);

  const time = useTime();

  // Create independent motion values for each node
  const nodePositions = nodesData.map((node, i) => {
    const parallaxFactorX = 0.5 + (i * 0.1);
    const parallaxFactorY = 0.5 + (i * 0.1);
    
    const x = useTransform(() => {
      if (isReducedMotion) return node.bx;
      const t = time.get();
      const baseMotion = Math.sin(t * node.speed + node.phase) * node.rx;
      const parallax = smoothX.get() * 15 * parallaxFactorX;
      return node.bx + baseMotion + parallax;
    });

    const y = useTransform(() => {
      if (isReducedMotion) return node.by;
      const t = time.get();
      const baseMotion = Math.cos(t * node.speed + node.phase) * node.ry;
      const parallax = smoothY.get() * 15 * parallaxFactorY;
      return node.by + baseMotion + parallax;
    });

    return { x, y };
  });

  const isEdgeConnected = (edge, nodeId) => {
    return nodesData[edge.source].id === nodeId || nodesData[edge.target].id === nodeId;
  };

  const getEdgeOpacity = (edge) => {
    if (!hoveredNode) return 0.25;
    return isEdgeConnected(edge, hoveredNode) ? 0.8 : 0.1;
  };

  const getNodeOpacity = (node) => {
    if (!hoveredNode) return 0.85;
    return node.id === hoveredNode ? 1 : 0.4;
  };

  return (
    <motion.div
      ref={containerRef}
      style={{ 
        y: yOffset, 
        scale: networkScale,
        opacity: networkOpacity,
        filter: useTransform(networkBlur, v => `blur(${v}px)`),
        // SAFE-ZONE MASK: Responsive fade out in the center where text sits
        WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0) 10%, rgba(0,0,0,1) 60%)",
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0) 10%, rgba(0,0,0,1) 60%)"
      }}
      className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none"
    >
      {/* Ambient Glow */}
      <motion.div 
        style={{ 
          x: useTransform(smoothX, [-1, 1], [-20, 20]), 
          y: useTransform(smoothY, [-1, 1], [-20, 20]) 
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 2 }}
        className="absolute w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
      />

      <svg
        className="w-full h-full max-w-[1400px] max-h-[900px] absolute pointer-events-none"
        viewBox="0 0 1000 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="primaryGrad" x1="0" y1="0" x2="1000" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0.1" />
          </linearGradient>
          
          <linearGradient id="activeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {edges.map((edge, idx) => (
          <motion.line
            key={`edge-${idx}`}
            x1={nodePositions[edge.source].x}
            y1={nodePositions[edge.source].y}
            x2={nodePositions[edge.target].x}
            y2={nodePositions[edge.target].y}
            stroke={hoveredNode && isEdgeConnected(edge, hoveredNode) ? "url(#activeGrad)" : "url(#primaryGrad)"}
            strokeWidth={hoveredNode && isEdgeConnected(edge, hoveredNode) ? 1.5 : 1}
            strokeDasharray="4 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: getEdgeOpacity(edge) }}
            transition={{ duration: 0.4 }}
          />
        ))}
        
        {/* Subtle Data-Flow Particles */}
        {!isReducedMotion && particles.map((p, idx) => {
          const edge = edges[p.edgeIndex];
          
          // Calculate interpolated position manually via useTransform to perfectly track the moving nodes
          const particleCx = useTransform(() => {
            const t = time.get();
            const progress = ((t + p.delay) % p.duration) / p.duration; // 0 to 1
            const actualProg = p.dir === 1 ? progress : 1 - progress;
            const x1 = nodePositions[edge.source].x.get();
            const x2 = nodePositions[edge.target].x.get();
            return x1 + (x2 - x1) * actualProg;
          });

          const particleCy = useTransform(() => {
            const t = time.get();
            const progress = ((t + p.delay) % p.duration) / p.duration; // 0 to 1
            const actualProg = p.dir === 1 ? progress : 1 - progress;
            const y1 = nodePositions[edge.source].y.get();
            const y2 = nodePositions[edge.target].y.get();
            return y1 + (y2 - y1) * actualProg;
          });

          const particleOpacity = useTransform(() => {
            const t = time.get();
            const progress = ((t + p.delay) % p.duration) / p.duration;
            // Fade in and out at ends
            if (progress < 0.1) return progress * 10;
            if (progress > 0.9) return (1 - progress) * 10;
            return 1;
          });

          return (
            <motion.circle
              key={`particle-${idx}`}
              r="1.5"
              fill="var(--primary)"
              cx={particleCx}
              cy={particleCy}
              style={{ opacity: particleOpacity, filter: 'drop-shadow(0 0 4px var(--primary))' }}
            />
          );
        })}

        {/* Nodes */}
        {nodesData.map((node, idx) => {
          const pos = nodePositions[idx];
          
          // Hover logic needs pointer events enabled just on the nodes
          return (
            <motion.g
              key={node.id}
              className="pointer-events-auto cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: getNodeOpacity(node) }}
              transition={{ duration: 0.4 }}
              onMouseEnter={() => !isTouchDevice && setHoveredNode(node.id)}
              onMouseLeave={() => !isTouchDevice && setHoveredNode(null)}
            >
              {/* Outer Glow on hover */}
              <motion.circle 
                cx={pos.x} 
                cy={pos.y} 
                r={16} 
                fill="var(--primary)" 
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredNode === node.id ? 0.15 : 0 }}
                className="pointer-events-none"
              />
              
              <motion.rect
                x={useTransform(pos.x, x => x - 40)}
                y={useTransform(pos.y, y => y - 10)}
                width={80}
                height={20}
                rx={10}
                fill="var(--surface)"
                stroke={hoveredNode === node.id ? "var(--primary)" : "rgba(182, 255, 0, 0.3)"}
                strokeWidth={hoveredNode === node.id ? "1.5" : "1"}
                style={{ filter: hoveredNode === node.id ? 'drop-shadow(0 0 6px rgba(182, 255, 0, 0.4))' : 'none' }}
              />
              <motion.text
                x={pos.x}
                y={useTransform(pos.y, y => y + 3)}
                fill={hoveredNode === node.id ? "var(--foreground)" : "var(--foreground-muted)"}
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                letterSpacing="0.1em"
                className="pointer-events-none transition-colors"
              >
                {node.label}
              </motion.text>
            </motion.g>
          );
        })}
      </svg>
    </motion.div>
  );
};

export default HeroNetwork;

