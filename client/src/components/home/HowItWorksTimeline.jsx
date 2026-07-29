import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const steps = [
  { num: "01", title: "Discover", desc: "Find a hackathon that matches your skills and interests.", align: "right" },
  { num: "02", title: "Register", desc: "Join individually or build your team using email invitations.", align: "left" },
  { num: "03", title: "Build", desc: "Turn your idea into something real. Write code, design UI, and solve problems.", align: "right" },
  { num: "04", title: "Submit", desc: "Publish your project before the deadline with a repo and demo link.", align: "left" },
  { num: "05", title: "Win", desc: "Ship. Get judged. Rise on the leaderboard.", align: "right" },
];

const TimelineStep = ({ step }) => {
  const stepRef = useRef(null);
  
  // Track this step's position relative to the viewport center.
  // 0 = approaching (center of step is at 75% of viewport height from top)
  // 0.5 = active (center of step is exactly at 50% of viewport height)
  // 1 = completed (center of step is at 25% of viewport height)
  const { scrollYProgress } = useScroll({
    target: stepRef,
    offset: ["center 75%", "center 25%"]
  });

  // Derived animation values based on scroll progress
  
  // Content Opacity: approaches 1 at center, then fades slightly to 0.7 when past
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.5, 1, 1, 0.8]);
  
  // Content Transform: slides in from side, settles at 0, stays at 0
  const isRight = step.align === 'right';
  const slideDistance = isRight ? 24 : -24;
  const contentX = useTransform(scrollYProgress, [0, 0.5, 1], [slideDistance, 0, 0]);

  // Dot styles
  const dotScale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1, 1.25, 1.25, 1]);
  // We use CSS custom properties via style for colors to support Light/Dark mode natively.
  // Inactive: surface background, border color. Active: primary.
  const dotOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 1]);
  
  // Connector line progress
  const connectorScaleX = useTransform(scrollYProgress, [0.3, 0.5, 1], [0, 1, 1]);

  return (
    <div 
      ref={stepRef} 
      className={`relative flex items-center w-full py-16 md:py-24 ${isRight ? 'md:justify-end' : 'md:justify-start'}`}
    >
      {/* Center Dot (Mobile: Left, Desktop: Center) */}
      <div className="absolute left-[24px] md:left-1/2 md:-translate-x-1/2 z-20 flex items-center justify-center">
        <motion.div 
          className="w-4 h-4 rounded-full border-2 border-border bg-surface flex items-center justify-center transition-colors overflow-hidden"
          style={{ scale: dotScale }}
        >
           <motion.div className="w-full h-full bg-primary" style={{ opacity: dotOpacity }} />
        </motion.div>
        
        {/* Glow effect on active dot */}
        <motion.div 
           className="absolute inset-0 rounded-full bg-primary blur-[8px]"
           style={{ opacity: useTransform(scrollYProgress, [0.4, 0.5, 0.6], [0, 0.6, 0.2]) }}
        />
      </div>

      {/* Subtle Connector from Dot to Content */}
      <div className={`absolute top-1/2 -translate-y-1/2 hidden md:block z-10 w-16 h-[2px] bg-border/40
        ${isRight ? 'left-1/2' : 'right-1/2'}
      `}>
        <motion.div 
          className="h-full bg-primary origin-left"
          style={{ 
            scaleX: connectorScaleX,
            transformOrigin: isRight ? 'left' : 'right'
          }}
        />
      </div>
      
      {/* Mobile Connector */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[32px] md:hidden z-10 w-8 h-[2px] bg-border/40">
        <motion.div 
          className="h-full bg-primary origin-left"
          style={{ scaleX: connectorScaleX }}
        />
      </div>

      {/* Content Card */}
      <motion.div 
        className={`relative z-30 ml-16 md:ml-0 w-[calc(100%-4.5rem)] md:w-[40%] ${isRight ? 'md:ml-24' : 'md:mr-24'}`}
        style={{ opacity: contentOpacity, x: contentX }}
      >
        <Card className="border border-border hover:border-border-hover transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 overflow-hidden bg-surface">
          <CardHeader className="pb-3">
            <motion.div 
              className="font-mono font-bold text-sm mb-2"
              style={{ 
                color: useTransform(scrollYProgress, [0, 0.4, 1], ["var(--foreground-muted)", "var(--primary)", "var(--primary)"]) 
              }}
            >
              {step.num}
            </motion.div>
            <CardTitle className="text-xl md:text-2xl text-foreground">{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground-secondary text-sm md:text-base leading-relaxed">{step.desc}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const HowItWorksTimeline = () => {
  const containerRef = useRef(null);
  
  // Track the entire section's scroll progress to draw the main vertical line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12" ref={containerRef}>
      
      {/* Base Dotted Line (Inactive) */}
      <div 
        className="absolute top-0 bottom-0 left-[24px] md:left-1/2 md:-ml-[1px] w-[2px] z-0"
        style={{
          backgroundImage: 'linear-gradient(to bottom, var(--border) 50%, transparent 50%)',
          backgroundSize: '2px 12px',
          backgroundRepeat: 'repeat-y'
        }}
      />
      
      {/* Progress Solid Line (Active) */}
      <motion.div 
        className="absolute top-0 bottom-0 left-[24px] md:left-1/2 md:-ml-[1px] w-[2px] bg-primary z-10 origin-top shadow-[0_0_10px_rgba(182,255,0,0.4)]"
        style={{ scaleY: scrollYProgress }}
      />

      <div className="relative z-20 flex flex-col">
        {steps.map((step) => (
          <TimelineStep key={step.num} step={step} />
        ))}
      </div>
      
    </div>
  );
};

export default HowItWorksTimeline;
