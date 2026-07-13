'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

// ─────────────────────────────────────────────────────────────────────────
// OPTIMIZACIÓN (v2): la animación de las partículas se calcula en un SHADER
// (GPU), no en un bucle por CPU. Antes, cada frame recorría ~58k puntos en JS
// haciendo trig + física y re-subía todo el buffer de posiciones a la GPU
// (~1.4MB/frame) — inviable en móvil. Ahora las posiciones son ESTÁTICAS y el
// wobble + la repulsión del cursor se calculan en el vertex shader; por frame
// solo se actualiza el uniform `uTime` (coste O(1)). Además: conteo adaptativo
// por dispositivo, pausa cuando está fuera de viewport, y dpr menor en móvil.
// ─────────────────────────────────────────────────────────────────────────

type ParticleLayerProps = {
  imageUrl: string;
  size: number;
  spread: number;
  depth: number;
  threshold: number;
  step: number;
  maxPoints: number;
  yScale: number;
  opacity: number;
};

type ParticleData = {
  count: number;
  positions: Float32Array; // origen ESTÁTICO (el shader anima alrededor)
  seeds: Float32Array;     // 2 por punto
  weights: Float32Array;   // 1 por punto (luminancia)
};

// Vectores reutilizables para desproyectar el puntero (evita alocar por frame).
const _ndc = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _world = new THREE.Vector3();

const useGlobalPointer = () => {
  const pointer = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const setFromClient = (clientX: number, clientY: number) => {
      pointer.current.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(clientY / window.innerHeight) * 2 + 1;
      pointer.current.active = true;
    };
    const onPointerMove = (event: PointerEvent) => setFromClient(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      setFromClient(touch.clientX, touch.clientY);
    };
    const onLeave = () => { pointer.current.active = false; };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return pointer;
};

const buildParticlesFromImage = (
  image: HTMLImageElement,
  options: Pick<ParticleLayerProps, "threshold" | "step" | "maxPoints" | "yScale">
): ParticleData => {
  const canvas = document.createElement("canvas");
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { count: 0, positions: new Float32Array(0), seeds: new Float32Array(0), weights: new Float32Array(0) };
  }

  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const positions: number[] = [];
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
      const worldZ = (luminance - 0.5) * options.yScale * 0.25;

      positions.push(nx, ny, worldZ);
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
    seeds: new Float32Array(seeds),
    weights: new Float32Array(weights),
  };
};

// Shader: wobble (fn del tiempo + semilla) + repulsión del puntero, todo en GPU.
// No se declaran position/modelMatrix/viewMatrix/projectionMatrix: THREE los
// inyecta en ShaderMaterial.
const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform vec3  uPointer;
uniform float uPointerActive;
uniform float uSize;
uniform float uScale;
uniform float uDepth;
attribute vec2  aSeed;
attribute float aWeight;
varying float vWeight;

void main() {
  vWeight = aWeight;
  vec3 p = position;

  float wobble  = sin(uTime * 0.4 + aSeed.x) * (0.015 + aWeight * 0.035);
  float wobbleZ = sin(uTime * 0.5 + aSeed.y + (p.x + p.y) * 0.35) * (0.012 + aWeight * 0.03);
  p.x += wobble;
  p.y += wobble;
  p.z += wobbleZ;

  vec4 world = modelMatrix * vec4(p, 1.0);

  if (uPointerActive > 0.5) {
    vec3 diff = world.xyz - uPointer;
    float dist = length(diff);
    float radius = 1.3;
    if (dist < radius) {
      float falloff = 1.0 - dist / radius;
      world.xyz += normalize(diff + 0.0001) * falloff * falloff * 0.5 * uDepth;
    }
  }

  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * uScale / -mvPosition.z;
}
`;

const PARTICLE_FRAG = /* glsl */ `
precision mediump float;
uniform float uOpacity;
uniform vec3  uColor;
varying float vWeight;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = dot(c, c);
  if (d > 0.25) discard;                       // recorte circular (menos overdraw)
  float alpha = smoothstep(0.25, 0.0, d) * uOpacity;
  gl_FragColor = vec4(uColor, alpha);
}
`;

function ParticleLayer({
  imageUrl, size, spread, depth, threshold, step, maxPoints, yScale, opacity,
}: ParticleLayerProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const pointer = useGlobalPointer();
  const { viewport } = useThree();
  const texture = useTexture(imageUrl);

  const data = useMemo(() => {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image) return null;
    return buildParticlesFromImage(image, { threshold, step, maxPoints, yScale });
  }, [texture.image, threshold, step, maxPoints, yScale]);

  const geometry = useMemo(() => {
    if (!data || data.count === 0) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.seeds, 2));
    g.setAttribute("aWeight", new THREE.BufferAttribute(data.weights, 1));
    return g;
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector3() },
          uPointerActive: { value: 0 },
          uSize: { value: size },
          uScale: { value: 1 },
          uDepth: { value: depth },
          uOpacity: { value: opacity },
          uColor: { value: new THREE.Color("#ffffff") },
        },
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [size, depth, opacity]
  );

  // Liberar GPU al desmontar.
  useEffect(() => () => {
    geometry?.dispose();
    material.dispose();
  }, [geometry, material]);

  // Escala de "cover" del campo respecto al viewport y al aspecto de la imagen.
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

  // Coste O(1) por frame: solo uniforms (tiempo, escala de pixel, puntero).
  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const u = material.uniforms;
    u.uTime.value = t;
    // Replica la atenuación de tamaño de PointsMaterial (scale = altura buffer / 2).
    u.uScale.value = state.gl.domElement.height * 0.5;

    if (pointer.current.active) {
      _ndc.set(pointer.current.x, pointer.current.y, 0.6).unproject(state.camera);
      _dir.copy(_ndc).sub(state.camera.position).normalize();
      const distToPlane = -state.camera.position.z / _dir.z;
      _world.copy(state.camera.position).add(_dir.multiplyScalar(distToPlane));
      u.uPointer.value.copy(_world);
      u.uPointerActive.value = 1;
    } else {
      u.uPointerActive.value = 0;
    }

    pointsRef.current.rotation.z = t * 0.02;
  });

  if (!geometry || !data || data.count === 0) return null;

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

type StarFieldProps = { count: number; size: number; spread: number; opacity: number };

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

  // O(1) por frame: solo rota (no toca el buffer de posiciones).
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.z = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size} color="#ffffff" transparent opacity={opacity} depthWrite={false} sizeAttenuation />
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
  const [available, setAvailable] = useState<boolean | null>(null);
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

/** Perfil de dispositivo → presupuesto de partículas. Móvil/gama baja recibe
 *  bastantes menos puntos y una sola capa, para ir fluido en todos lados. */
type DeviceTier = "low" | "high";
function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
    const lowCpu = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
    const small = window.innerWidth < 768;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    setTier(small || coarse || lowMem || lowCpu ? "low" : "high");
  }, []);
  return tier;
}

/** IntersectionObserver: pausa el render loop cuando el campo está fuera de la
 *  pantalla (frameloop="never" → coste GPU/CPU cero mientras no se ve). */
function useInViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      { rootMargin: "120px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/** Error boundary local: si el Canvas WebGL llega a fallar al crearse (drivers,
 *  contexto perdido, límite de contextos), mostramos el fondo estático en vez
 *  de romper la página entera. */
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
  const tier = useDeviceTier();
  const { ref, visible } = useInViewport<HTMLDivElement>();

  // Sin WebGL (o mientras se detecta) → fondo estático. NUNCA montamos el
  // Canvas sin WebGL: eso lanzaba una excepción no capturada que dejaba toda
  // la web en blanco en navegadores con WebGL deshabilitado/sandboxed.
  if (!webglAvailable) {
    return <ParticleFallback />;
  }

  // Presupuesto adaptativo: móvil/gama baja = 1 capa liviana; desktop = 2 capas.
  const isLow = tier === "low";
  const starCount = isLow ? 1500 : 4200;
  const layers: ParticleLayerProps[] = isLow
    ? [
        { imageUrl: "/particulas22.jpg", size: 0.014, spread: 1.12, depth: 1, threshold: 0.5, step: 3, maxPoints: 8000, yScale: 0.36, opacity: 0.85 },
      ]
    : [
        { imageUrl: "/particulas22.jpg", size: 0.010, spread: 1.15, depth: 1, threshold: 0.46, step: 2, maxPoints: 24000, yScale: 0.4, opacity: 0.7 },
        { imageUrl: "/particulas22.jpg", size: 0.030, spread: 1.05, depth: 1.2, threshold: 0.55, step: 2, maxPoints: 11000, yScale: 0.26, opacity: 1 },
      ];

  return (
    <div ref={ref} className="absolute inset-0 -z-10 pointer-events-none">
      <WebGLBoundary>
        <Canvas
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 0, 9], fov: 55 }}
          dpr={isLow ? [1, 1] : [1, 1.5]}
          gl={{ antialias: !isLow, alpha: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#000000"]} />
          <StarField count={starCount} size={0.012} spread={1.25} opacity={0.28} />
          {layers.map((l, i) => (
            <ParticleLayer key={i} {...l} />
          ))}
        </Canvas>
      </WebGLBoundary>
    </div>
  );
}
