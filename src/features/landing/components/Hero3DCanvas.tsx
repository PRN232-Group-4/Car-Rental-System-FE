"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/motion/register";
import { applyLithographShader } from "./lithograph-shader";

export default function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    if (
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const container = containerRef.current;
    let isDisposed = false;
    let animFrameId: number | null = null;
    let rendererInstance: THREE.WebGLRenderer | null = null;
    let sceneInstance: THREE.Scene | null = null;
    let cleanupEvents: (() => void) | null = null;

    // Asynchronous lazy-load of Three.js to keep initial landing bundle <= 180KB gzip
    Promise.all([
      import("three"),
      import("three/examples/jsm/loaders/GLTFLoader.js"),
      import("three/examples/jsm/libs/meshopt_decoder.module.js"),
    ]).then(([THREE, { GLTFLoader }, { MeshoptDecoder }]) => {
      if (isDisposed || !containerRef.current) return;

      const width = container.clientWidth || 960;
      const height = container.clientHeight || 420;

      const scene = new THREE.Scene();
      sceneInstance = scene;

      const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
      camera.position.set(2.85, 1.15, 4.75);

      // preserveDrawingBuffer: false eliminates ReadPixels GPU stall warnings
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      });
      rendererInstance = renderer;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      // Hard Key Light on Sun side
      const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
      keyLight.position.set(3.8, 5.2, 3.2);
      scene.add(keyLight);

      // Rim Light Lake-400 (#3DA5D9) on opposite side for continuous car silhouette definition
      const rimLight = new THREE.DirectionalLight(0x3da5d9, 3.6);
      rimLight.position.set(-4.5, 3.0, -3.5);
      scene.add(rimLight);

      // Ambient light (low ink fill)
      const ambientLight = new THREE.AmbientLight(0x0f1215, 0.4);
      scene.add(ambientLight);

      // Small monochrome environment map
      const envCanvas = document.createElement("canvas");
      envCanvas.width = 64;
      envCanvas.height = 32;
      const envCtx = envCanvas.getContext("2d");
      if (envCtx) {
        const envGrad = envCtx.createLinearGradient(0, 0, 0, 32);
        envGrad.addColorStop(0, "#E9E4D8");
        envGrad.addColorStop(0.5, "#3DA5D9");
        envGrad.addColorStop(1, "#0F1215");
        envCtx.fillStyle = envGrad;
        envCtx.fillRect(0, 0, 64, 32);
      }
      const envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = envTexture;

      const renderOnce = () => {
        camera.lookAt(0, 0.42, 0);
        renderer.render(scene, camera);
      };

      // Flat hard-edged blob shadow plane at y = 0.005
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 512;
      shadowCanvas.height = 512;
      const shadowCtx = shadowCanvas.getContext("2d");
      if (shadowCtx) {
        shadowCtx.clearRect(0, 0, 512, 512);
        shadowCtx.fillStyle = "#0F1215";
        shadowCtx.beginPath();
        shadowCtx.ellipse(256, 256, 215, 115, 0, 0, Math.PI * 2);
        shadowCtx.fill();
      }
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(6.6, 3.4),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = 0.005;
      scene.add(shadowPlane);

      const carGroup = new THREE.Group();
      scene.add(carGroup);

      const baseRotY = -Math.PI / 6.2;
      const scrollOffset = { rotY: 0, camZ: 4.75 };
      const pointerOffset = { rotY: 0, rotX: 0 };

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        "/models/porsche_911_carrera_4s_opt.glb",
        (gltf) => {
          if (isDisposed) return;
          const object = gltf.scene;
          object.updateMatrixWorld(true);

          const cleanBbox = new THREE.Box3();
          object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const name = (mesh.name || "").toLowerCase();
              if (
                name.includes("plane") ||
                name === "object_140" ||
                name.includes("floor") ||
                name.includes("shadow") ||
                name.includes("ground")
              ) {
                mesh.visible = false;
              } else {
                cleanBbox.expandByObject(mesh);

                const mat = mesh.material;
                const matName = Array.isArray(mat)
                  ? mat.map((m) => m.name.toLowerCase()).join(" ")
                  : (mat?.name || "").toLowerCase();
                const isHeadlight =
                  matName.includes("light") ||
                  matName.includes("lamp") ||
                  name.includes("light") ||
                  name.includes("headlight");

                if (Array.isArray(mat)) {
                  mat.forEach((m) => applyLithographShader(m, isHeadlight));
                } else if (mat) {
                  applyLithographShader(mat, isHeadlight);
                }
              }
            }
          });

          if (!cleanBbox.isEmpty()) {
            const center = cleanBbox.getCenter(new THREE.Vector3());
            const size = cleanBbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.z, 0.001);
            const scaleFactor = 4.7 / maxDim;

            object.position.set(-center.x, -cleanBbox.min.y, -center.z);
            const normalizedWrapper = new THREE.Group();
            normalizedWrapper.add(object);
            normalizedWrapper.scale.setScalar(scaleFactor);
            carGroup.add(normalizedWrapper);
          } else {
            carGroup.add(object);
          }

          carGroup.rotation.y = baseRotY;
          renderOnce();
          setIsLoaded(true);
        },
        undefined,
        (err) => {
          console.warn("[Hero 3D fallback]", err);
        }
      );

      // ScrollTrigger Scrub
      const st = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: (self) => {
          scrollOffset.rotY = (self.progress - 0.35) * 0.52;
          scrollOffset.camZ = 4.75 - (self.progress - 0.35) * 0.45;
        },
      });

      // ±8 degrees yaw range spring interpolation (8 * PI / 180 ≈ 0.14 rad)
      const setPointerRotY = gsap.quickTo(pointerOffset, "rotY", { duration: 0.7, ease: "power2.out" });
      const setPointerRotX = gsap.quickTo(pointerOffset, "rotX", { duration: 0.7, ease: "power2.out" });

      const handlePointerMove = (e: MouseEvent) => {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = (e.clientY / window.innerHeight) * 2 - 1;
        setPointerRotY(normX * 0.14);
        setPointerRotX(normY * 0.045);
      };
      window.addEventListener("pointermove", handlePointerMove, { passive: true });

      const renderLoop = () => {
        if (!isVisibleRef.current || isDisposed) {
          animFrameId = null;
          return;
        }
        animFrameId = requestAnimationFrame(renderLoop);
        carGroup.rotation.y = baseRotY + scrollOffset.rotY + pointerOffset.rotY;
        carGroup.rotation.x = pointerOffset.rotX;
        camera.position.z = scrollOffset.camZ;
        renderOnce();
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !animFrameId) {
            animFrameId = requestAnimationFrame(renderLoop);
          } else if (!entry.isIntersecting) {
            renderOnce();
          }
        },
        { threshold: 0.02 }
      );
      observer.observe(container);

      const handleResize = () => {
        const newW = container.clientWidth || 960;
        const newH = container.clientHeight || 420;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
        renderOnce();
      };
      window.addEventListener("resize", handleResize);

      cleanupEvents = () => {
        st.kill();
        observer.disconnect();
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("resize", handleResize);
        if (animFrameId) cancelAnimationFrame(animFrameId);
        renderer.dispose();
        scene.clear();
        container.innerHTML = "";
      };
    });

    return () => {
      isDisposed = true;
      if (cleanupEvents) cleanupEvents();
      if (rendererInstance) rendererInstance.dispose();
      if (sceneInstance) sceneInstance.clear();
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-transparent overflow-visible">
      <div
        ref={containerRef}
        className={`w-full h-[300px] sm:h-[380px] md:h-[460px] lg:h-[520px] overflow-visible bg-transparent transition-opacity duration-500 cursor-grab active:cursor-grabbing ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* LCP Poster Fallback Image (≤ 54KB WebP / ≤ 26KB AVIF) */}
      <picture
        className={`absolute inset-0 w-full flex items-center justify-center pointer-events-none transition-opacity duration-500 bg-transparent ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <source
          type="image/avif"
          srcSet="/assets/hero-car/hero-car-composite-1280.avif"
        />
        <source
          type="image/webp"
          srcSet="/assets/hero-car/hero-car-composite-1280.webp"
        />
        <img
          src="/assets/hero-car/hero-car-composite-1280.webp"
          alt="Porsche Carrera 4S Thong Dong"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-auto max-h-[260px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[480px] object-contain"
        />
      </picture>
    </div>
  );
}
