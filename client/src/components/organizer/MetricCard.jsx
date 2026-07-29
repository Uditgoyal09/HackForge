import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, trend, subtitle }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseMove={handleMouseMove}
      className="relative group overflow-hidden rounded-[var(--radius-lg)] bg-surface border border-border shadow-lg"
    >
      {/* Pointer-responsive radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(182, 255, 0, 0.08), transparent 50%)`,
        }}
      />
      
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[var(--radius-sm)] bg-surface-elevated text-primary border border-border">
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {title}
            </h3>
          </div>
          {trend && (
            <div className={`text-xs font-medium ${trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-muted-foreground'}`}>
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="mt-auto">
          <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight drop-shadow-sm font-mono">
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
