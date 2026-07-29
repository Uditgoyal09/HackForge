import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

const HeroNetwork = () => {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 1000], [0, 200]);
  const networkScale = useTransform(scrollY, [0, 500], [1, 1.08]);
  const networkOpacity = useTransform(scrollY, [0, 500], [1, 0.15]);
  const networkBlur = useTransform(scrollY, [0, 500], [0, 2]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 25 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Respect prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const nodes = [
    { id: 'CODE', x: 200, y: 150 },
    { id: 'BUILD', x: 800, y: 100 },
    { id: 'SHIP', x: 900, y: 500 },
    { id: 'COMPETE', x: 500, y: 650 },
    { id: 'INNOVATE', x: 100, y: 450 },
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

  const isEdgeConnected = (edge, nodeId) => {
    return nodes[edge.source].id === nodeId || nodes[edge.target].id === nodeId;
  };

  const getEdgeOpacity = (edge) => {
    if (!hoveredNode) return 0.4;
    return isEdgeConnected(edge, hoveredNode) ? 1 : 0.1;
  };

  const getNodeOpacity = (node) => {
    if (!hoveredNode) return 1;
    return node.id === hoveredNode ? 1 : 0.4;
  };

  // Parallax layers
  const farLinesX = useTransform(smoothX, [-1, 1], [-4, 4]);
  const farLinesY = useTransform(smoothY, [-1, 1], [-4, 4]);

  const nodesX = useTransform(smoothX, [-1, 1], [-7, 7]);
  const nodesY = useTransform(smoothY, [-1, 1], [-7, 7]);

  const glowX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const glowY = useTransform(smoothY, [-1, 1], [-12, 12]);

  return (
    <motion.div
      ref={containerRef}
      style={{ 
        y: yOffset, 
        scale: networkScale,
        opacity: networkOpacity,
        filter: useTransform(networkBlur, v => `blur(${v}px)`)
      }}
      className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      {/* Ambient Glow */}
      <motion.div 
        style={{ x: glowX, y: glowY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 2 }}
        className="absolute w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
      />

      <svg
        className="w-full h-full max-w-[1400px] max-h-[900px] absolute pointer-events-none"
        viewBox="0 0 1000 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="purpleCyanGrad" x1="0" y1="0" x2="1000" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B6FF00" stopOpacity="0.8" />
            <stop offset="1" stopColor="#B6FF00" stopOpacity="0.1" />
          </linearGradient>
          
          <linearGradient id="activeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#B6FF00" stopOpacity="1" />
            <stop offset="1" stopColor="#B6FF00" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Draw paths */}
        <motion.g style={{ x: farLinesX, y: farLinesY }}>
          {edges.map((edge, idx) => (
            <motion.line
              key={`edge-${idx}`}
              x1={nodes[edge.source].x}
              y1={nodes[edge.source].y}
              x2={nodes[edge.target].x}
              y2={nodes[edge.target].y}
              stroke={hoveredNode && isEdgeConnected(edge, hoveredNode) ? "url(#activeGrad)" : "url(#purpleCyanGrad)"}
              strokeWidth={hoveredNode && isEdgeConnected(edge, hoveredNode) ? 2 : 1.5}
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: getEdgeOpacity(edge)
              }}
              transition={{
                pathLength: { duration: 1.8, delay: 0.3 + idx * 0.15, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.3 }
              }}
            />
          ))}
          
          {/* Signals */}
          {edges.map((edge, idx) => (
            <motion.circle
              key={`signal-${idx}`}
              r="2"
              fill="#B6FF00"
              className="pointer-events-none"
              style={{ filter: 'drop-shadow(0 0 4px #B6FF00)' }}
              initial={{ opacity: 0, cx: nodes[edge.source].x, cy: nodes[edge.source].y }}
              animate={{
                opacity: [0, 1, 1, 0],
                cx: [nodes[edge.source].x, nodes[edge.target].x],
                cy: [nodes[edge.source].y, nodes[edge.target].y],
              }}
              transition={{
                duration: 4,
                delay: 2 + idx * 1.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 5 + 3,
                ease: "linear"
              }}
            />
          ))}
        </motion.g>

        {/* Floating Nodes */}
        <motion.g style={{ x: nodesX, y: nodesY }} className="pointer-events-auto cursor-pointer">
          {nodes.map((node, idx) => (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: getNodeOpacity(node), 
                scale: 1 
              }}
              transition={{
                scale: { delay: 0.2 + idx * 0.15, duration: 0.6, ease: "easeOut" },
                opacity: { duration: 0.3 }
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <motion.g
                animate={{ y: [-2, 2, -2] }}
                transition={{
                  duration: 5 + (idx % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <rect
                  x={node.x - 45}
                  y={node.y - 12}
                  width={90}
                  height={24}
                  rx={12}
                  fill="var(--surface)"
                  stroke={hoveredNode === node.id ? "#B6FF00" : "rgba(182, 255, 0, 0.4)"}
                  strokeWidth={hoveredNode === node.id ? "1.5" : "1"}
                  style={{ filter: hoveredNode === node.id ? 'drop-shadow(0 0 8px rgba(182, 255, 0, 0.5))' : 'none' }}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  fill={hoveredNode === node.id ? "var(--foreground)" : "var(--muted-foreground)"}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  letterSpacing="0.1em"
                  className="pointer-events-none"
                >
                  {node.id}
                </text>
              </motion.g>
            </motion.g>
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default HeroNetwork;
