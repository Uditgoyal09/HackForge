import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { cn } from '../ui/Button'; // Assuming cn is exported here

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full"
    >
      <Card ref={cardRef} className="h-full relative group overflow-hidden bg-surface hover:bg-surface-hover border border-border hover:border-border-hover shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300">
        {/* Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(300px circle at ${smoothX}px ${smoothY}px, rgba(182,255,0,0.1), transparent 40%)`,
          }}
        />

        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-surface-elevated border border-border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 relative">
            <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300 relative z-10" />
          </div>
          <CardTitle className="text-foreground transition-colors">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-secondary leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
