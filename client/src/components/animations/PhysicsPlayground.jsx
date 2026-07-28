import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const TECH_BADGES = [
  'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 
  'TypeScript', 'Three.js', 'Tailwind', 'Docker', 'AWS', 'Solidity', 'Python'
];

const PhysicsPlayground = () => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, World } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;
    engine.world.gravity.y = 0.8;

    const width = sceneRef.current.clientWidth || 800;
    const height = 300;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent',
      },
    });

    // Boundaries
    const ground = Bodies.rectangle(width / 2, height + 20, width, 40, { isStatic: true, render: { fillStyle: 'transparent' } });
    const leftWall = Bodies.rectangle(-20, height / 2, 40, height, { isStatic: true, render: { fillStyle: 'transparent' } });
    const rightWall = Bodies.rectangle(width + 20, height / 2, 40, height, { isStatic: true, render: { fillStyle: 'transparent' } });

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Create interactive physics badge bodies
    const badgeBodies = TECH_BADGES.map((tech, i) => {
      const x = (i % 6) * (width / 6) + 60;
      const y = Math.floor(i / 6) * -60 - 40;
      return Bodies.rectangle(x, y, 90, 36, {
        chamfer: { radius: 12 },
        restitution: 0.6,
        friction: 0.1,
        render: {
          fillStyle: '#1e1b4b',
          strokeStyle: '#6366f1',
          lineWidth: 1.5,
        },
      });
    });

    Composite.add(engine.world, badgeBodies);

    // Mouse drag interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Cleanup on unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
    };
  }, []);

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 z-10 relative">
        <div>
          <h3 className="font-bold text-lg text-white">Interactive Tech Stack Playground</h3>
          <p className="text-xs text-slate-400">Drag, toss, and collide tech badges powered by Matter.js 2D physics engine.</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono">
          Matter.js Physics
        </span>
      </div>

      <div ref={sceneRef} className="w-full h-[300px] relative rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800/50" />
    </div>
  );
};

export default PhysicsPlayground;
