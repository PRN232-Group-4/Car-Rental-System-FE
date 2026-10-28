"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { gsap } from "@/lib/motion/register";

export default function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    // Don't mount heavy 3D on small screens or reduced-motion
    if (window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 440;

    // 1. Three.js Scene & Transparent Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    // Pulled camera back and adjusted angle so the right rear fender/wheel is never clipped
    camera.position.set(2.4, 1.25, 4.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.2);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 1.2);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff2d6, 1.6);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // 3. Radial Soft Contact Shadow: Fades completely to 0 opacity by 60% radius on 12x12 plane
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      const gradient = shadowCtx.createRadialGradient(256, 256, 15, 256, 256, 250);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      gradient.addColorStop(0.25, "rgba(0, 0, 0, 0.20)");
      gradient.addColorStop(0.6, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      shadowCtx.fillStyle = gradient;
      shadowCtx.fillRect(0, 0, 512, 512);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    scene.add(shadowPlane);

    // 4. Car Group & Pointer Parallax
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      "/models/porsche_911_carrera_4s.glb",
      (gltf) => {
        const object = gltf.scene;
        const bbox = new THREE.Box3().setFromObject(object);
        const center = bbox.getCenter(new THREE.Vector3());

        object.position.x = -center.x;
        object.position.y = -bbox.min.y;
        object.position.z = -center.z;

        carGroup.add(object);
        carGroup.rotation.y = -Math.PI / 6.5; // Elegant three-quarter hero pose
        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.warn("[Hero 3D fallback]", err);
      }
    );

    // High frequency pointer parallax using gsap.quickTo
    const targetRotY = { val: -Math.PI / 6.5 };
    const targetRotX = { val: 0 };
    const setRotY = gsap.quickTo(targetRotY, "val", { duration: 0.8, ease: "power2.out" });
    const setRotX = gsap.quickTo(targetRotX, "val", { duration: 0.8, ease: "power2.out" });

    const handlePointerMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      setRotY(-Math.PI / 6.5 + normX * 0.12);
      setRotX(normY * 0.06);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 5. Demand Render Loop with IntersectionObserver
    const render = () => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return;
      }
      animFrameIdRef.current = requestAnimationFrame(render);
      carGroup.rotation.y = targetRotY.val;
      carGroup.rotation.x = targetRotX.val;
      camera.lookAt(-0.1, 0.35, 0);
      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !animFrameIdRef.current) {
          animFrameIdRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight || 440;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
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
      {/* 3D Canvas Target */}
      <div 
        ref={containerRef} 
        className={`w-full h-[280px] sm:h-[360px] md:h-[440px] lg:h-[500px] overflow-visible bg-transparent transition-opacity duration-700 cursor-grab active:cursor-grabbing ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`} 
      />

      {/* Instant Raster Picture Fallback (until 3D model finishes parsing, and always for mobile/noscript) */}
      <picture className={`absolute inset-0 w-full flex justify-center pointer-events-none transition-opacity duration-700 bg-transparent ${
        isLoaded ? "opacity-0 hidden" : "opacity-100"
      }`}>
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
          className="w-full h-auto max-h-[220px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[480px] object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.20)]"
        />
      </picture>
    </div>
  );
}
