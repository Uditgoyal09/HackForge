import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleNodes = ({ count = 80 }) => {
  const mesh = useRef();
  const light = useRef();

  // Generate random node positions and velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      vel[i * 3] = (Math.random() - 0.5) * 0.008;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }

    return [pos, vel];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;

    // Slowly rotate particle field based on mouse pointer
    mesh.current.rotation.x = state.pointer.y * 0.15;
    mesh.current.rotation.y = state.pointer.x * 0.15;

    // Animate individual particles
    const positionsAttr = mesh.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let x = positionsAttr.getX(i) + velocities[i * 3];
      let y = positionsAttr.getY(i) + velocities[i * 3 + 1];
      let z = positionsAttr.getZ(i) + velocities[i * 3 + 2];

      // Boundary bounds check
      if (x > 8 || x < -8) velocities[i * 3] *= -1;
      if (y > 8 || y < -8) velocities[i * 3 + 1] *= -1;
      if (z > 5 || z < -5) velocities[i * 3 + 2] *= -1;

      positionsAttr.setXYZ(i, x, y, z);
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <group ref={mesh}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#6366f1"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

const HeroCanvas = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <ParticleNodes count={100} />
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
