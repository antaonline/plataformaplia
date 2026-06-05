/**
 * Renderiza una Scene3D declarativa como JS plano que se inyecta en el HTML
 * del template. La idea: Claude solo escribe el JSON (Scene3D), nosotros
 * generamos el codigo Three.js + GSAP — asi evitamos shaders rotos, APIs
 * inventadas, y cualquier otro error tipico de "AI escribiendo Three.js".
 *
 * Devuelve el bloque <script type="module"> completo. El HTML del template
 * solo necesita un <canvas id="scene3d"> y los <section> con sus IDs para
 * los triggers de scroll.
 */

import type { Scene3D, Scene3DObject, Scene3DLight } from './scene-3d.types';

// CDN entry points. Pin de version explicito para evitar breaking changes.
const THREE_VERSION = '0.162.0';
const GSAP_VERSION = '3.12.5';

const CDN = {
  threeImportMap: `
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@${THREE_VERSION}/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@${THREE_VERSION}/examples/jsm/"
  }
}
</script>`,
  gsap: `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/${GSAP_VERSION}/gsap.min.js"></script>`,
  scrollTrigger: `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/${GSAP_VERSION}/ScrollTrigger.min.js"></script>`,
};

/**
 * Devuelve los <script> de CDN que el <head> del HTML necesita. Los meto
 * en este orden: importmap (sync) -> gsap (sync) -> scrollTrigger (sync).
 * El modulo de la escena se carga al final del body con type="module".
 */
export function renderScene3DHeadScripts(): string {
  return [CDN.threeImportMap, CDN.gsap, CDN.scrollTrigger].join('\n');
}

/**
 * Renderiza el <script type="module"> completo que monta la escena.
 * Va al FINAL del body para asegurar que el DOM (canvas + triggers) existe.
 */
export function renderScene3DModule(scene: Scene3D): string {
  const containerSel = scene.container || '#scene3d';
  const sceneJson = JSON.stringify(scene);

  // Todo el codigo del runtime esta en una sola string para que sea facil
  // de mantener. Es JS standalone — recibe sceneSpec por window.
  return `<script type="module" data-plia-scene3d>
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const SCENE_SPEC = ${sceneJson};

// ---------------------------------------------------------------------
// Setup basico: scene + camera + renderer + composer
// ---------------------------------------------------------------------

const container = document.querySelector('${containerSel}');
if (!container) {
  console.warn('[plia-scene3d] container no encontrado:', '${containerSel}');
} else {
  const w = () => container.clientWidth || window.innerWidth;
  const h = () => container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  if (SCENE_SPEC.environment && SCENE_SPEC.environment.background && SCENE_SPEC.environment.background !== 'transparent') {
    scene.background = new THREE.Color(SCENE_SPEC.environment.background);
  }
  if (SCENE_SPEC.environment && SCENE_SPEC.environment.fog) {
    const f = SCENE_SPEC.environment.fog;
    scene.fog = new THREE.Fog(f.color, f.near, f.far);
  }

  const cam = new THREE.PerspectiveCamera(
    (SCENE_SPEC.camera && SCENE_SPEC.camera.fov) || 50,
    w() / h(),
    0.1,
    100,
  );
  if (SCENE_SPEC.camera && SCENE_SPEC.camera.position) {
    const p = SCENE_SPEC.camera.position;
    cam.position.set(p.x, p.y, p.z);
  } else {
    cam.position.set(0, 1, 5);
  }
  if (SCENE_SPEC.camera && SCENE_SPEC.camera.lookAt) {
    const l = SCENE_SPEC.camera.lookAt;
    cam.lookAt(l.x, l.y, l.z);
  }

  const renderer = new THREE.WebGLRenderer({
    canvas: container.tagName === 'CANVAS' ? container : undefined,
    antialias: true,
    alpha: !SCENE_SPEC.environment || SCENE_SPEC.environment.background === 'transparent',
    powerPreference: 'high-performance',
  });
  if (container.tagName !== 'CANVAS') container.appendChild(renderer.domElement);
  const maxPr = (SCENE_SPEC.performance && SCENE_SPEC.performance.maxPixelRatio) || 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPr));
  renderer.setSize(w(), h(), false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Environment IBL: HDR si hay URL, sino RoomEnvironment de drei-equivalente.
  if (SCENE_SPEC.environment && SCENE_SPEC.environment.hdrUrl) {
    new RGBELoader().load(SCENE_SPEC.environment.hdrUrl, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = tex;
    });
  } else {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  }

  // ---------------------------------------------------------------------
  // Luces
  // ---------------------------------------------------------------------
  const lightRefs = [];
  for (const L of (SCENE_SPEC.lights || [])) {
    let l;
    if (L.kind === 'ambient') l = new THREE.AmbientLight(L.color, L.intensity);
    else if (L.kind === 'directional') {
      l = new THREE.DirectionalLight(L.color, L.intensity);
      l.position.set(L.position.x, L.position.y, L.position.z);
      if (L.castShadow) { l.castShadow = true; l.shadow.mapSize.set(2048, 2048); }
    } else if (L.kind === 'point') {
      l = new THREE.PointLight(L.color, L.intensity, L.distance || 0, L.decay || 2);
      l.position.set(L.position.x, L.position.y, L.position.z);
    } else if (L.kind === 'spot') {
      l = new THREE.SpotLight(L.color, L.intensity, 0, L.angle || Math.PI / 4, L.penumbra || 0.3);
      l.position.set(L.position.x, L.position.y, L.position.z);
      if (L.target) {
        const t = new THREE.Object3D();
        t.position.set(L.target.x, L.target.y, L.target.z);
        scene.add(t);
        l.target = t;
      }
    }
    if (l) { scene.add(l); lightRefs.push(l); }
  }

  // ---------------------------------------------------------------------
  // Objetos
  // ---------------------------------------------------------------------
  const objectRefs = {};

  function buildPrimitive(spec) {
    let geo;
    const d = spec.dims || [];
    if (spec.shape === 'box') geo = new THREE.BoxGeometry(d[0] || 1, d[1] || 1, d[2] || 1);
    else if (spec.shape === 'sphere') geo = new THREE.SphereGeometry(d[0] || 0.6, 64, 64);
    else if (spec.shape === 'plane') geo = new THREE.PlaneGeometry(d[0] || 10, d[1] || 10);
    else if (spec.shape === 'torus') geo = new THREE.TorusGeometry(d[0] || 0.5, d[1] || 0.2, 32, 100);
    else if (spec.shape === 'torusKnot') geo = new THREE.TorusKnotGeometry(d[0] || 0.5, d[1] || 0.18, 200, 32);
    else if (spec.shape === 'cone') geo = new THREE.ConeGeometry(d[0] || 0.5, d[1] || 1, 64);
    else if (spec.shape === 'cylinder') geo = new THREE.CylinderGeometry(d[0] || 0.5, d[1] || 0.5, d[2] || 1, 64);
    else geo = new THREE.BoxGeometry(1, 1, 1);

    const m = spec.material;
    // Material premium: MeshPhysicalMaterial para soportar transmission/clearcoat.
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(m.color || '#ffffff'),
      metalness: m.metalness != null ? m.metalness : 0.85,
      roughness: m.roughness != null ? m.roughness : 0.15,
      emissive: m.emissive ? new THREE.Color(m.emissive) : new THREE.Color('#000000'),
      emissiveIntensity: m.emissiveIntensity || 0,
      transmission: m.transmission || 0,
      clearcoat: m.shader === 'iridescent' ? 1 : 0,
      clearcoatRoughness: 0.05,
      iridescence: m.shader === 'iridescent' || m.shader === 'holographic' ? 1 : 0,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [100, 800],
    });
    return new THREE.Mesh(geo, mat);
  }

  function applyTransform(obj, spec) {
    if (spec.position) obj.position.set(spec.position.x, spec.position.y, spec.position.z);
    if (spec.rotation) obj.rotation.set(spec.rotation.x, spec.rotation.y, spec.rotation.z);
    if (spec.scale != null) {
      if (typeof spec.scale === 'number') obj.scale.setScalar(spec.scale);
      else obj.scale.set(spec.scale.x, spec.scale.y, spec.scale.z);
    }
    if (spec.castShadow) obj.castShadow = true;
    if (spec.receiveShadow) obj.receiveShadow = true;
  }

  const gltfLoader = new GLTFLoader();
  for (const o of (SCENE_SPEC.objects || [])) {
    if (o.kind === 'primitive') {
      const m = buildPrimitive(o);
      applyTransform(m, o);
      scene.add(m);
      objectRefs[o.id] = m;
    } else if (o.kind === 'gltf') {
      gltfLoader.load(o.url, (gltf) => {
        const root = gltf.scene;
        applyTransform(root, o);
        root.traverse((n) => {
          if (n.isMesh) {
            if (o.castShadow) n.castShadow = true;
            if (o.receiveShadow) n.receiveShadow = true;
          }
        });
        scene.add(root);
        objectRefs[o.id] = root;
        // Si el GLTF tiene animaciones y se pidio una por default, reproducir.
        if (gltf.animations && gltf.animations.length && o.defaultAnimation) {
          const mixer = new THREE.AnimationMixer(root);
          const clip = THREE.AnimationClip.findByName(gltf.animations, o.defaultAnimation) || gltf.animations[0];
          if (clip) { mixer.clipAction(clip).play(); root.__mixer = mixer; }
        }
        // Trigger refresh de ScrollTrigger ahora que el modelo cargo.
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }, undefined, (err) => console.warn('[plia-scene3d] GLTF error', err));
    } else if (o.kind === 'text3d') {
      // Text3D requiere FontLoader async — para v1 lo aproximamos con un
      // Sprite con canvas 2D (suficiente para hero text 3D-ish).
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = o.color || '#ffffff';
      ctx.font = 'bold ' + (o.size ? Math.round(o.size * 80) : 120) + 'px ' + (o.font || 'Inter');
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(o.text, c.width / 2, c.height / 2);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sprite.scale.set(4, 1, 1);
      applyTransform(sprite, o);
      scene.add(sprite);
      objectRefs[o.id] = sprite;
    }
  }

  // ---------------------------------------------------------------------
  // Post-processing
  // ---------------------------------------------------------------------
  let composer = null;
  if (SCENE_SPEC.postFX && SCENE_SPEC.postFX.bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, cam));
    const b = SCENE_SPEC.postFX.bloom;
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(w(), h()), b.strength, b.radius, b.threshold));
    composer.addPass(new OutputPass());
  }

  // ---------------------------------------------------------------------
  // Animate loop + resize
  // ---------------------------------------------------------------------
  const clock = new THREE.Clock();
  let paused = false;
  if (SCENE_SPEC.performance && SCENE_SPEC.performance.pauseOffScreen && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      paused = !entries[0].isIntersecting;
    });
    io.observe(container);
  }

  function tick() {
    requestAnimationFrame(tick);
    if (paused) return;
    const dt = clock.getDelta();
    // Mixers para GLTF animations
    for (const k in objectRefs) {
      const o = objectRefs[k];
      if (o && o.__mixer) o.__mixer.update(dt);
    }
    // Auto-rotate
    if (SCENE_SPEC.autoRotate) {
      const tgt = objectRefs[SCENE_SPEC.autoRotate.objectId];
      if (tgt) tgt.rotation.y += (SCENE_SPEC.autoRotate.speedDegPerSec * Math.PI / 180) * dt;
    }
    if (composer) composer.render();
    else renderer.render(scene, cam);
  }
  tick();

  window.addEventListener('resize', () => {
    cam.aspect = w() / h();
    cam.updateProjectionMatrix();
    renderer.setSize(w(), h(), false);
    if (composer) composer.setSize(w(), h());
  });

  // ---------------------------------------------------------------------
  // Scroll-triggered timeline (GSAP)
  // ---------------------------------------------------------------------
  if (window.gsap && window.ScrollTrigger && SCENE_SPEC.scrollScenes && SCENE_SPEC.scrollScenes.length) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    for (const sc of SCENE_SPEC.scrollScenes) {
      const trig = document.querySelector(sc.trigger);
      if (!trig) continue;
      const tl = window.gsap.timeline({
        scrollTrigger: {
          trigger: trig,
          start: sc.start || 'top center',
          end: sc.end || 'bottom center',
          scrub: 1,
        },
      });
      if (sc.to.camera) {
        if (sc.to.camera.position) tl.to(cam.position, { ...sc.to.camera.position, duration: 1 }, 0);
        if (sc.to.camera.fov) tl.to(cam, { fov: sc.to.camera.fov, duration: 1, onUpdate: () => cam.updateProjectionMatrix() }, 0);
      }
      if (sc.to.objects) {
        for (const id in sc.to.objects) {
          const target = objectRefs[id];
          if (!target) continue;
          const o = sc.to.objects[id];
          if (o.position) tl.to(target.position, { ...o.position, duration: 1 }, 0);
          if (o.rotation) tl.to(target.rotation, { ...o.rotation, duration: 1 }, 0);
          if (o.scale != null) {
            const s = typeof o.scale === 'number' ? { x: o.scale, y: o.scale, z: o.scale } : o.scale;
            tl.to(target.scale, { ...s, duration: 1 }, 0);
          }
          if (o.material && target.material) {
            if (o.material.color) tl.to(target.material.color, { ...new THREE.Color(o.material.color), duration: 1 }, 0);
            if (o.material.emissive) tl.to(target.material.emissive, { ...new THREE.Color(o.material.emissive), duration: 1 }, 0);
            if (o.material.emissiveIntensity != null) tl.to(target.material, { emissiveIntensity: o.material.emissiveIntensity, duration: 1 }, 0);
          }
        }
      }
      if (sc.to.lights) {
        for (const idx in sc.to.lights) {
          const lref = lightRefs[parseInt(idx, 10)];
          if (!lref) continue;
          const lspec = sc.to.lights[idx];
          if (lspec.intensity != null) tl.to(lref, { intensity: lspec.intensity, duration: 1 }, 0);
          if (lspec.color) tl.to(lref.color, { ...new THREE.Color(lspec.color), duration: 1 }, 0);
        }
      }
    }
  }
}
</script>`;
}

/**
 * Convierte una Scene3D + el HTML de un template en una pagina HTML completa
 * lista para servir. Inserta los scripts CDN en el head y el module al final
 * del body. Garantiza que <canvas id="scene3d"> exista (si el template no
 * lo tiene, lo metemos position:fixed detras del contenido).
 */
export function injectScene3DIntoHtml(html: string, scene: Scene3D): string {
  let out = html;

  // 1. Inyectar scripts CDN en head si no estan ya.
  if (!/three\.module\.js/.test(out)) {
    const headScripts = renderScene3DHeadScripts();
    if (/<\/head>/i.test(out)) out = out.replace(/<\/head>/i, `${headScripts}\n</head>`);
    else out = headScripts + '\n' + out;
  }

  // 2. Asegurar canvas/contenedor. Si no esta, lo inyectamos fixed detras.
  const containerSel = scene.container || '#scene3d';
  const containerId = containerSel.replace(/^#/, '');
  const containerRe = new RegExp(`id=["']${containerId}["']`, 'i');
  if (!containerRe.test(out)) {
    const canvasTag = `<canvas id="${containerId}" style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;"></canvas>`;
    if (/<body[^>]*>/i.test(out)) out = out.replace(/<body([^>]*)>/i, `<body$1>\n${canvasTag}`);
    else out = canvasTag + out;
  }

  // 3. Inyectar el module al final del body.
  const module = renderScene3DModule(scene);
  if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${module}\n</body>`);
  else out += '\n' + module;

  return out;
}
