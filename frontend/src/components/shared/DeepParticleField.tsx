'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from "three";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";


type ImageParticleFieldProps = {
  imageUrl: string;
  size: number;
  spread: number;
  speed: number;
  depth: number;
  threshold: number;
  step: number;
  maxPoints: number;
  yScale: number;
  opacity: number;
};

type ParticleData = {
  count: number;
  positions: Float32Array;
  velocities: Float32Array;
  origins: Float32Array;
  seeds: Float32Array;
  weights: Float32Array;
};

const useGlobalPointer = () => {
  const pointer = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const setFromClient = (clientX: number, clientY: number) => {
      pointer.current.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(clientY / window.innerHeight) * 2 + 1;
      pointer.current.active = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      setFromClient(event.clientX, event.clientY);
    };

    const onMouseMove = (event: MouseEvent) => {
      setFromClient(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      setFromClient(touch.clientX, touch.clientY);
    };

    const onLeave = () => {
      pointer.current.active = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mousemove", onMouseMove, true);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchmove", onTouchMove, true);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousemove", onMouseMove, true);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return pointer;
};

const buildParticlesFromImage = (
  image: HTMLImageElement,
  options: Pick<ImageParticleFieldProps, "threshold" | "step" | "maxPoints" | "yScale">
): ParticleData => {
  const canvas = document.createElement("canvas");
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      count: 0,
      positions: new Float32Array(0),
      velocities: new Float32Array(0),
      origins: new Float32Array(0),
      seeds: new Float32Array(0),
      weights: new Float32Array(0),
    };
  }

  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const positions: number[] = [];
  const origins: number[] = [];
  const velocities: number[] = [];
  const seeds: number[] = [];
  const weights: number[] = [];

  for (let y = 0; y < height; y += options.step) {
    for (let x = 0; x < width; x += options.step) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      if (luminance < options.threshold) continue;
      const keepChance = Math.min(1, Math.pow(luminance, 2.9) * 1.6);
      if (Math.random() > keepChance) continue;

      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * -2;
      const worldX = nx;
      const worldY = ny;
      const worldZ = (luminance - 0.5) * options.yScale * 0.25;

      positions.push(worldX, worldY, worldZ);
      origins.push(worldX, worldY, worldZ);
      velocities.push(
        (Math.random() * 2 - 1) * 0.0015,
        (Math.random() * 2 - 1) * 0.0015,
        (Math.random() * 2 - 1) * 0.0015
      );
      seeds.push(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      weights.push(luminance);

      if (options.maxPoints > 0 && positions.length / 3 >= options.maxPoints) {
        y = height;
        break;
      }
    }
  }

  return {
    count: positions.length / 3,
    positions: new Float32Array(positions),
    velocities: new Float32Array(velocities),
    origins: new Float32Array(origins),
    seeds: new Float32Array(seeds),
    weights: new Float32Array(weights),
  };
};

function ImageParticleField({
  imageUrl,
  size,
  spread,
  speed,
  depth,
  threshold,
  step,
  maxPoints,
  yScale,
  opacity,
}: ImageParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const pointer = useGlobalPointer();
  const { camera, viewport } = useThree();
  const texture = useTexture(imageUrl);

  const data = useMemo(() => {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image) {
      return null;
    }
    return buildParticlesFromImage(image, { threshold, step, maxPoints, yScale });
  }, [texture.image, threshold, step, maxPoints, yScale]);

  useEffect(() => {
    if (!data || !pointsRef.current) return;
    const image = texture.image as HTMLImageElement | undefined;
    if (!image) return;
    const imageAspect = (image.naturalWidth || image.width) / (image.naturalHeight || image.height);
    const viewportAspect = viewport.width / viewport.height;
    const coverScaleX = imageAspect > viewportAspect ? imageAspect / viewportAspect : 1;
    const coverScaleY = imageAspect > viewportAspect ? 1 : viewportAspect / imageAspect;
    pointsRef.current.scale.set(
      (viewport.width * 0.5) * coverScaleX * spread,
      (viewport.height * 0.5) * coverScaleY * spread,
      1
    );
  }, [data, texture.image, viewport.width, viewport.height, spread]);

  useFrame(({ clock }) => {
    if (!data || data.count === 0) return;

    const time = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    pointsRef.current.rotation.z = time * 0.02;

    const pointerActive = pointer.current.active;
    const pointerNdc = new THREE.Vector3(pointer.current.x, pointer.current.y, 0.6);
    pointerNdc.unproject(camera);
    const pointerDir = pointerNdc.sub(camera.position).normalize();
    const distanceToPlane = -camera.position.z / pointerDir.z;
    const pointerWorld = camera.position.clone().add(pointerDir.multiplyScalar(distanceToPlane));

    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      const px = pos[i3];
      const py = pos[i3 + 1];
      const pz = pos[i3 + 2];

      const ox = data.origins[i3];
      const oy = data.origins[i3 + 1];
      const oz = data.origins[i3 + 2];

      const seedA = data.seeds[i * 2];
      const seedB = data.seeds[i * 2 + 1];
      const weight = data.weights[i];

      const wobble = Math.sin(time * 0.4 + seedA) * (0.015 + weight * 0.035);
      const wobbleZ = Math.sin(time * 0.5 + seedB + (ox + oy) * 0.35) * (0.012 + weight * 0.03);

      const targetX = ox + wobble;
      const targetY = oy + wobble;
      const targetZ = oz + wobbleZ;

      const pull = 0.0012 + weight * 0.0016;
      data.velocities[i3] += (targetX - px) * pull;
      data.velocities[i3 + 1] += (targetY - py) * pull;
      data.velocities[i3 + 2] += (targetZ - pz) * pull;

      if (pointerActive) {
        const dx = pointerWorld.x - px;
        const dy = pointerWorld.y - py;
        const dz = pointerWorld.z - pz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const radius = 0.6;

        if (dist < radius && dist > 0.0001) {
          const falloff = 1 - dist / radius;
          const repulsion = falloff * 0.007 * depth;
          data.velocities[i3] -= (dx / dist) * repulsion;
          data.velocities[i3 + 1] -= (dy / dist) * repulsion;
          data.velocities[i3 + 2] -= (dz / dist) * repulsion;

          const swirl = falloff * 0.0012;
          data.velocities[i3] += dz * swirl;
          data.velocities[i3 + 2] -= dx * swirl;
        }
      }

      const damping = pointerActive ? 0.92 : 0.965;
      data.velocities[i3] *= damping;
      data.velocities[i3 + 1] *= damping;
      data.velocities[i3 + 2] *= damping;

      const boost = pointerActive ? 1.2 : 1;
      pos[i3] = px + data.velocities[i3] * depth * boost;
      pos[i3 + 1] = py + data.velocities[i3 + 1] * depth * boost;
      pos[i3 + 2] = pz + data.velocities[i3 + 2] * depth * boost;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!data || data.count === 0) {
    return null;
  }

  return (
    <points ref={pointsRef} key={`${imageUrl}-${threshold}-${step}-${data.count}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={data.positions}
          count={data.count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color="#ffffff"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

type StarFieldProps = {
  count: number;
  size: number;
  spread: number;
  opacity: number;
};

function StarField({ count, size, spread, opacity }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { viewport } = useThree();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] = (Math.random() * 2 - 1) * spread;
      arr[i3 + 1] = (Math.random() * 2 - 1) * spread * 0.6;
      arr[i3 + 2] = (Math.random() * 2 - 1) * 0.4;
    }
    return arr;
  }, [count, spread]);

  useEffect(() => {
    if (!pointsRef.current) return;
    pointsRef.current.scale.set(viewport.width * 0.5, viewport.height * 0.5, 1);
  }, [viewport.width, viewport.height]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.z = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color="#ffffff"
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/** Fondo estático de respaldo cuando el navegador NO tiene WebGL disponible
 *  (deshabilitado, sandboxed, GPU off, sesiones RDP/VM). Evita que el <Canvas>
 *  de react-three-fiber lance "Error creating WebGL context" — esa excepción
 *  no capturada tumbaba TODA la app (pantalla en blanco "Application error"). */
function ParticleFallback() {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      aria-hidden
      style={{
        background:
          "radial-gradient(circle at 50% 35%, #12121c 0%, #05050a 60%, #000 100%)",
      }}
    />
  );
}

/** Detecta si el navegador puede crear un contexto WebGL. Corre solo en cliente.
 *  Devuelve null mientras no se sabe (primer render / SSR): en ese estado se
 *  muestra el fondo estático, así nunca montamos el Canvas sin WebGL. */
function useWebGLAvailable(): boolean | null {
  const [available, setAvailable] = React.useState<boolean | null>(null);
  useEffect(() => {
    let ok = false;
    try {
      const canvas = document.createElement("canvas");
      ok = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      ok = false;
    }
    setAvailable(ok);
  }, []);
  return available;
}

/** Error boundary local: si el Canvas WebGL llega a fallar al crearse (drivers,
 *  contexto perdido, límite de contextos por dos instancias en la home, etc.),
 *  mostramos el fondo estático en vez de romper la página entera. */
class WebGLBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Degradación esperada (navegador sin WebGL). No es un error a reportar.
  }
  render() {
    if (this.state.failed) return <ParticleFallback />;
    return this.props.children as React.ReactElement;
  }
}

export function DeepParticleField() {
  const webglAvailable = useWebGLAvailable();

  // Sin WebGL (o mientras se detecta) → fondo estático. NUNCA montamos el
  // Canvas sin WebGL: eso lanzaba una excepción no capturada que dejaba toda
  // la web en blanco en navegadores con WebGL deshabilitado/sandboxed.
  if (!webglAvailable) {
    return <ParticleFallback />;
  }

  return (
    <WebGLBoundary>
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 9], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#000000"]} />
          <StarField count={5200} size={0.012} spread={1.25} opacity={0.28} />
          <ImageParticleField
            imageUrl="/particulas22.jpg"
            size={0.01}
            spread={1.15}
            speed={0.42}
            depth={1}
            threshold={0.46}
            step={2}
            maxPoints={42000}
            yScale={0.4}
            opacity={0.7}
          />
          <ImageParticleField
            imageUrl="/particulas22.jpg"
            size={0.034}
            spread={1.05}
            speed={0.4}
            depth={1.2}
            threshold={0.55}
            step={2}
            maxPoints={16000}
            yScale={0.26}
            opacity={1}
          />
        </Canvas>
      </div>
    </WebGLBoundary>
  );
}
