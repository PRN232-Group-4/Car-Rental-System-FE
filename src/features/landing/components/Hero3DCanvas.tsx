"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { gsap, ScrollTrigger } from "@/lib/motion/register";

function isArtifactFloorMesh(mesh: THREE.Mesh): boolean {
  const name = (mesh.name || "").toLowerCase();
  if (
    name.includes("plane") ||
    name === "object_140" ||
    name.includes("floor") ||
    name.includes("shadow") ||
    name.includes("ground")
  ) {
    return true;
  }
  mesh.geometry?.computeBoundingBox();
  const gBox = mesh.geometry?.boundingBox;
  if (gBox) {
    const size = gBox.getSize(new THREE.Vector3());
    if (size.y < 0.02 && (size.x > 2.2 || size.z > 2.2)) {
      return true;
    }
  }
  return false;
}

export default function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animFrameIdRef = useRef<number | null>(null);
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
    const width = container.clientWidth || 960;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    camera.position.set(2.85, 1.15, 4.75);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf2, 2.6);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.4);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffedd5, 2.0);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    const renderOnce = () => {
      camera.lookAt(0, 0.42, 0);
      renderer.render(scene, camera);
    };

    const updateThemeLighting = (isDark: boolean) => {
      gsap.to(ambientLight, {
        intensity: isDark ? 1.85 : 1.6,
        duration: 0.35,
        onUpdate: renderOnce,
      });
      gsap.to(rimLight, {
        intensity: isDark ? 2.8 : 2.0,
        duration: 0.35,
      });
      gsap.to(renderer, {
        toneMappingExposure: isDark ? 1.4 : 1.25,
        duration: 0.35,
      });
    };

    const isInitialDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.dataset.theme === "dark";
    if (isInitialDark) updateThemeLighting(true);

    const themeObserver = new MutationObserver(() => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.dataset.theme === "dark";
      updateThemeLighting(isDark);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    // Soft Ground Shadow Plane tại y = -0.01
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      shadowCtx.clearRect(0, 0, 512, 512);
      const gradient = shadowCtx.createRadialGradient(256, 256, 15, 256, 256, 240);
      gradient.addColorStop(0, "rgba(9, 13, 22, 0.42)");
      gradient.addColorStop(0.4, "rgba(9, 13, 22, 0.14)");
      gradient.addColorStop(0.75, "rgba(9, 13, 22, 0)");
      gradient.addColorStop(1, "rgba(9, 13, 22, 0)");
      shadowCtx.fillStyle = gradient;
      shadowCtx.fillRect(0, 0, 512, 512);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 7.2),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
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
        const object = gltf.scene;
        object.updateMatrixWorld(true);

        const cleanBbox = new THREE.Box3();
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (isArtifactFloorMesh(mesh)) {
              mesh.visible = false;
            } else {
              cleanBbox.expandByObject(mesh);
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

    // ScrollTrigger Scrub: Xoay nhẹ xe khi người dùng cuộn từ Hero xuống Showroom
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

    const setPointerRotY = gsap.quickTo(pointerOffset, "rotY", { duration: 0.7, ease: "power2.out" });
    const setPointerRotX = gsap.quickTo(pointerOffset, "rotX", { duration: 0.7, ease: "power2.out" });

    const handlePointerMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      setPointerRotY(normX * 0.12);
      setPointerRotX(normY * 0.04);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const renderLoop = () => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return;
      }
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
      carGroup.rotation.y = baseRotY + scrollOffset.rotY + pointerOffset.rotY;
      carGroup.rotation.x = pointerOffset.rotX;
      camera.position.z = scrollOffset.camZ;
      renderOnce();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !animFrameIdRef.current) {
          animFrameIdRef.current = requestAnimationFrame(renderLoop);
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

    return () => {
      st.kill();
      themeObserver.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      scene.clear();
      container.innerHTML = "";
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

      <picture
        className={`absolute inset-0 w-full flex items-center justify-center pointer-events-none transition-opacity duration-500 bg-transparent ${
          isLoaded ? "opacity-0 hidden" : "opacity-100"
        }`}
      >
        <source
          type="image/avif"
          srcSet="/assets/hero-car/hero-car-composite-1920.avif 1920w, /assets/hero-car/hero-car-composite-1280.avif 1280w, /assets/hero-car/hero-car-composite-960.avif 960w, /assets/hero-car/hero-car-composite-640.avif 640w"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1220px"
        />
        <source
          type="image/webp"
          srcSet="/assets/hero-car/hero-car-composite-1920.webp 1920w, /assets/hero-car/hero-car-composite-1280.webp 1280w, /assets/hero-car/hero-car-composite-960.webp 960w, /assets/hero-car/hero-car-composite-640.webp 640w"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1220px"
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
