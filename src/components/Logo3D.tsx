import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

type Props = {
  className?: string;
};

const TOXIC_GREEN = 0x39ff6a;

function chromeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xf2f4f2,
    metalness: 0.95,
    roughness: 0.13,
    emissive: 0x2a2f2c,
    emissiveIntensity: 0.4,
  });
}

function greenAccentMaterial() {
  return new THREE.MeshStandardMaterial({
    color: TOXIC_GREEN,
    emissive: TOXIC_GREEN,
    emissiveIntensity: 1.4,
    metalness: 0.25,
    roughness: 0.4,
  });
}

function buildTwistedWireRing(rx: number, ry: number, strandRadius: number, twistAmp: number, twistCount: number) {
  const group = new THREE.Group();
  const segments = 480;

  function strandPoints(phase: number) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const px = Math.cos(t) * rx;
      const py = Math.sin(t) * ry;
      const nx = Math.cos(t) / (rx * rx);
      const ny = Math.sin(t) / (ry * ry);
      const nLen = Math.hypot(nx, ny) || 1;
      const dirX = nx / nLen;
      const dirY = ny / nLen;
      const twist = t * twistCount + phase;
      const offsetN = Math.cos(twist) * twistAmp;
      const offsetZ = Math.sin(twist) * twistAmp;
      pts.push(new THREE.Vector3(px + dirX * offsetN, py + dirY * offsetN, offsetZ));
    }
    return pts;
  }

  const mat = chromeMaterial();
  [0, Math.PI].forEach((phase) => {
    const curve = new THREE.CatmullRomCurve3(strandPoints(phase), true);
    const geo = new THREE.TubeGeometry(curve, segments, strandRadius, 6, true);
    group.add(new THREE.Mesh(geo, mat));
  });
  return group;
}

function buildBarbCluster(length: number, radius: number) {
  const group = new THREE.Group();
  const mat = chromeMaterial();
  const spread = 0.5;
  const offsets: [number, number][] = [
    [0, 0],
    [spread, spread * 0.4],
    [-spread, spread * 0.4],
  ];
  offsets.forEach(([ax, ay]) => {
    const geo = new THREE.ConeGeometry(radius, length, 4);
    geo.translate(0, length / 2, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = ax;
    mesh.rotation.z = ay;
    group.add(mesh);
  });
  return group;
}

function buildBarbedCrown(rx: number, ry: number) {
  const group = new THREE.Group();
  group.add(buildTwistedWireRing(rx, ry, 0.05, 0.09, 22));
  group.add(buildTwistedWireRing(rx * 0.9, ry * 0.86, 0.04, 0.07, 20));

  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  angles.forEach((angleDeg) => {
    const t = (angleDeg * Math.PI) / 180;
    const x = Math.cos(t) * rx;
    const y = Math.sin(t) * ry;
    const nx = Math.cos(t) / (rx * rx);
    const ny = Math.sin(t) / (ry * ry);
    const nLen = Math.hypot(nx, ny) || 1;
    const dirX = nx / nLen;
    const dirY = ny / nLen;
    const isMajor = angleDeg % 90 === 0;
    const length = isMajor ? 0.7 : 0.42;
    const radius = isMajor ? 0.1 : 0.07;
    const cluster = buildBarbCluster(length, radius);
    cluster.position.set(x, y, 0);
    const dir = new THREE.Vector3(dirX, dirY, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    cluster.quaternion.copy(quat);
    group.add(cluster);
  });
  return group;
}

const ITALIC_SHEAR = new THREE.Matrix4().set(
  1, 0.22, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
);

export function Logo3D({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 13.5);
    camera.lookAt(0, 0, 0);

    // ---- ΧΩΡΙΣ post-processing / bloom — απλό, σωστό transparent rendering ----
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.PointLight(0xffffff, 120, 60);
    keyLight.position.set(4, 6, 10);
    scene.add(keyLight);
    const keyLight2 = new THREE.PointLight(0xffffff, 80, 60);
    keyLight2.position.set(-3, 4, 9);
    scene.add(keyLight2);
    const rimGreenA = new THREE.PointLight(TOXIC_GREEN, 40, 60);
    rimGreenA.position.set(-8, 1, -7);
    scene.add(rimGreenA);
    const rimGreenB = new THREE.PointLight(TOXIC_GREEN, 25, 60);
    rimGreenB.position.set(7, -6, -8);
    scene.add(rimGreenB);
    const fill = new THREE.PointLight(0xe8eae6, 30, 60);
    fill.position.set(-6, -3, 8);
    scene.add(fill);
    const sparkle1 = new THREE.PointLight(0xffffff, 18, 8);
    sparkle1.position.set(2, 1.5, 3);
    scene.add(sparkle1);
    const sparkle2 = new THREE.PointLight(0xffffff, 12, 8);
    sparkle2.position.set(-2.5, -1, 3);
    scene.add(sparkle2);

    const model = new THREE.Group();
    scene.add(model);

    const RX = 3.3;
    const RY = 1.4;
    model.add(buildBarbedCrown(RX, RY));

    const accentPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const x = (t - 0.5) * RX * 1.5;
      const y = -0.66 - Math.sin(t * Math.PI) * 0.08;
      accentPoints.push(new THREE.Vector3(x, y, 0.05));
    }
    const accentCurve = new THREE.CatmullRomCurve3(accentPoints);
    const accentGeo = new THREE.TubeGeometry(accentCurve, 32, 0.03, 8, false);
    model.add(new THREE.Mesh(accentGeo, greenAccentMaterial()));

    const loader = new FontLoader();
    loader.load(
      "/fonts/helvetiker_bold.typeface.json",
      (font: Font) => {
        if (disposed) return;

        const CAP_SIZE = 2.3;
        const DEPTH = 0.6;
        const textMat = chromeMaterial();
        const GAP = CAP_SIZE * 0.004;

        function letterMesh(char: string, size: number) {
          const geo = new TextGeometry(char, {
            font,
            size,
            depth: DEPTH,
            curveSegments: 18,
            bevelEnabled: true,
            bevelThickness: 0.065,
            bevelSize: 0.075,
            bevelSegments: 8,
          });
          geo.applyMatrix4(ITALIC_SHEAR);
          geo.computeBoundingBox();
          return new THREE.Mesh(geo, textMat);
        }

        // ---- Χτίζουμε τα γράμματα σε εσωτερικό group με ωμές θέσεις ----
        const lettersGroup = new THREE.Group();
        let cursor = 0;

        const kMesh = letterMesh("k", CAP_SIZE);
        const kBB = kMesh.geometry.boundingBox!;
        kMesh.position.x = cursor - kBB.min.x;
        lettersGroup.add(kMesh);
        cursor += (kBB.max.x - kBB.min.x) + GAP;

        const aMesh = letterMesh("A", CAP_SIZE);
        const aBB = aMesh.geometry.boundingBox!;
        aMesh.position.x = cursor - aBB.min.x;
        lettersGroup.add(aMesh);
        cursor += (aBB.max.x - aBB.min.x) + GAP;

        const capHeight = aBB.max.y - aBB.min.y;
        const iStemWidth = CAP_SIZE * 0.2;
        const iStemHeight = capHeight * 0.58;
        const iGap = capHeight * 0.16;
        const dotSize = iStemWidth * 1.15;

        const stemGeo = new THREE.BoxGeometry(iStemWidth, iStemHeight, DEPTH);
        stemGeo.applyMatrix4(ITALIC_SHEAR);
        const stemMesh = new THREE.Mesh(stemGeo, textMat);
        stemMesh.position.x = cursor + iStemWidth / 2;
        stemMesh.position.y = iStemHeight / 2;
        stemMesh.position.z = DEPTH / 2;
        lettersGroup.add(stemMesh);

        const dotGeo = new THREE.BoxGeometry(dotSize, dotSize, dotSize);
        const dotMesh = new THREE.Mesh(dotGeo, textMat);
        dotMesh.position.x = cursor + iStemWidth / 2;
        dotMesh.position.y = iStemHeight + iGap + dotSize / 2;
        dotMesh.position.z = DEPTH / 2;
        dotMesh.rotation.set(0.3, 0.5, 0.15);
        lettersGroup.add(dotMesh);

        cursor += iStemWidth + GAP;

        const fMesh = letterMesh("F", CAP_SIZE);
        const fBB = fMesh.geometry.boundingBox!;
        fMesh.position.x = cursor - fBB.min.x;
        lettersGroup.add(fMesh);
        cursor += (fBB.max.x - fBB.min.x);

        // ---- Κεντράρισμα ΣΤΙΣ ΘΕΣΕΙΣ ΤΩΝ ΠΑΙΔΙΩΝ (όχι στο group.position) ----
        const box = new THREE.Box3().setFromObject(lettersGroup);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        lettersGroup.children.forEach((child) => {
          child.position.x -= center.x;
          child.position.y -= center.y;
        });

        // ---- Scale ώστε να χωράει ΜΕΣΑ στο πλάτος του συρματοπλέγματος ----
        const TARGET_WIDTH = RX * 2 * 0.86;
        const scale = TARGET_WIDTH / size.x;
        lettersGroup.scale.setScalar(scale);
        lettersGroup.position.z = -(DEPTH / 2) * scale;

        model.add(lettersGroup);
      },
      undefined,
      (err) => console.error("Font load failed:", err),
    );

    let raf = 0;
    let angle = 0;
    const speed = prefersReducedMotion ? 0 : 0.008;

    function animate() {
      angle += speed;
      model.rotation.y = angle;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth || width;
      height = container.clientHeight || height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}