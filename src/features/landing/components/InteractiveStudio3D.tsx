"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Button } from "@/components/ui/Button";
import { 
  Rotate3d, 
  Gauge, 
  Cpu, 
  Calendar, 
  Loader2, 
  RefreshCw,
  Compass,
  ArrowUpRight
} from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  subtitle: string;
  year: number;
  engine: string;
  power: string;
  topSpeed: string;
  hourlyPrice: number;
  modelPath: string;
  scale: number;
  initialY: number;
  tag: string;
}

const MODELS: ModelInfo[] = [
  {
    id: "porsche-carrera-4s",
    name: "Porsche 911 Carrera 4S",
    subtitle: "Biểu tượng hiệu năng đương đại — Động cơ Twin-Turbo Boxer 6 xi-lanh",
    year: 2026,
    engine: "3.0L Twin-Turbo Boxer",
    power: "443 Mã Lực (331 kW)",
    topSpeed: "306 km/h",
    hourlyPrice: 450000,
    modelPath: "/models/porsche_911_carrera_4s.glb",
    scale: 1.0,
    initialY: 0,
    tag: "MODERN PERFORMANCE",
  },
  {
    id: "porsche-1975-turbo",
    name: "Porsche 911 930 Turbo (1975)",
    subtitle: "Huyền thoại di sản tốc độ — Mẫu xe thể thao tăng áp đầu tiên của Porsche",
    year: 1975,
    engine: "3.0L Air-Cooled Turbo",
    power: "260 Mã Lực (191 kW)",
    topSpeed: "250 km/h",
    hourlyPrice: 550000,
    modelPath: "/models/1975_porsche_911_930_turbo.glb",
    scale: 0.95,
    initialY: 0,
    tag: "HERITAGE CLASSIC",
  },
];

export default function InteractiveStudio3D() {
  const [selectedModelId, setSelectedModelId] = useState<string>("porsche-carrera-4s");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentObjectRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(false);
  const isScrollingRef = useRef<boolean>(false);
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  const activeModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];

  // 1. Initialize Three.js Scene, Camera, Lights, and Render Loop
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f6f2); // Studio light warm gray
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.5, 2.0, 5.0);

    // Renderer (capped at 1.5 pixel ratio for optimal GPU fillrate)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go under the ground
    controls.minDistance = 3.2;
    controls.maxDistance = 9.0;
    controls.autoRotate = isAutoRotateRef.current;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // Lights (Studio 3-Point Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.4);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 1.2);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff2d6, 1.8);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Studio Circular Floor Shadow
    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.02;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Performance-Optimized Animation Loop (Only runs when visible in viewport)
    let isLoopRunning = false;
    const animate = () => {
      if (!isVisibleRef.current) {
        isLoopRunning = false;
        return;
      }
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const startLoop = () => {
      if (!isLoopRunning && isVisibleRef.current) {
        isLoopRunning = true;
        animate();
      }
    };

    const stopLoop = () => {
      isLoopRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };

    // IntersectionObserver to pause loop when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Scroll listener: pause autoRotate during active page scroll to free GPU compositor
    let scrollDebounceTimer: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (!controlsRef.current) return;
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        controlsRef.current.autoRotate = false;
      }
      if (scrollDebounceTimer) {
        clearTimeout(scrollDebounceTimer);
      }
      scrollDebounceTimer = setTimeout(() => {
        isScrollingRef.current = false;
        if (controlsRef.current && isAutoRotateRef.current) {
          controlsRef.current.autoRotate = true;
        }
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 540;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
      stopLoop();
      controls.dispose();
      renderer.dispose();
      scene.clear();
      container.innerHTML = "";
    };
  }, []);

  // 2. Load Selected GLB Model with Progress Tracking
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadError(null);

    // Remove previous model if exists
    if (currentObjectRef.current) {
      scene.remove(currentObjectRef.current);
      currentObjectRef.current = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      activeModel.modelPath,
      (gltf) => {
        const object = gltf.scene;

        // Auto-center and normalize bounding box
        const bbox = new THREE.Box3().setFromObject(object);
        const center = bbox.getCenter(new THREE.Vector3());

        // Place car on floor
        object.position.x = -center.x;
        object.position.y = -bbox.min.y;
        object.position.z = -center.z;

        // Enable shadows for all meshes
        object.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        const rootGroup = new THREE.Group();
        rootGroup.add(object);
        rootGroup.scale.setScalar(activeModel.scale);

        scene.add(rootGroup);
        currentObjectRef.current = rootGroup;
        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
          setLoadingProgress(percent);
        } else {
          // If total size header is missing, estimate based on loaded bytes
          setLoadingProgress((prev) => Math.min(95, prev + 8));
        }
      },
      (err) => {
        console.error("[3D Studio Error]", err);
        setLoadError("Không thể tải mô hình 3D. Vui lòng thử lại sau.");
        setIsLoading(false);
      }
    );
  }, [activeModel]);

  // 3. Toggle Auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.autoRotate = isAutoRotate;
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  return (
    <section id="showroom-3d" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 overflow-hidden">
      {/* Background Automotive Blueprint & Calibration Vectors */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg className="w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="48" x2="100%" y2="48" stroke="#0f172a" strokeWidth="1" strokeDasharray="8 8" />
          <line x1="0" y1="180" x2="100%" y2="180" stroke="#b45309" strokeWidth="0.8" />
          <path d="M 80 320 C 350 280, 600 360, 950 310 C 1150 280, 1300 340, 1400 360" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="92%" cy="180" r="32" stroke="#b45309" strokeWidth="1" strokeDasharray="3 3" />
          <text x="92%" y="184" fill="#b45309" fontSize="9" fontFamily="monospace" textAnchor="middle">STUDIO-Z0</text>
        </svg>
      </div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight">
            Khu Trưng Bày Xe 3D Tương Tác
          </h2>
        </div>
        <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed">
          Tương tác trực quan 360°, chiêm ngưỡng từng chi tiết thiết kế khí động học và cảm nhận vẻ đẹp di sản của các dòng xe hàng đầu.
        </p>
      </div>

      {/* Model Switcher Buttons */}
      <div className="relative z-10 flex flex-wrap items-center gap-3 mb-8">
        {MODELS.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => setSelectedModelId(model.id)}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 select-none active:scale-[0.98] ${
              selectedModelId === model.id
                ? "bg-stage-ink text-white shadow-e2 border border-white/20"
                : "bg-surface hover:bg-sunken text-ink-2 hover:text-ink border border-line-strong"
            }`}
          >
            <span>{model.name}</span>
            <span
              className={`text-xs font-mono uppercase px-2 py-0.5 rounded-full ${
                selectedModelId === model.id
                  ? "bg-surface/20 text-white"
                  : "bg-sunken text-ink-3"
              }`}
            >
              {model.year}
            </span>
          </button>
        ))}
      </div>

      {/* 3D Canvas & Telemetry HUD Grid — relative z-10 để panel nằm trên nền blueprint SVG (absolute z-0) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Main 3D Canvas Box (7 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-sunken border border-line-strong overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-h-[460px] sm:min-h-[540px] flex items-center justify-center">
          {/* Canvas Mount Target */}
          <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

          {/* Loading Overlay with Progress Counter */}
          {isLoading && (
            <div className="absolute inset-0 glass-2 z-20 flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <h4 className="font-display text-base font-bold text-ink mb-1">
                Đang nạp mô hình 3D {activeModel.name}...
              </h4>
              <p className="text-xs text-ink-3 font-mono mb-4">
                Dữ liệu mô phỏng vật lý đa giác cao · {loadingProgress}%
              </p>
              {/* Progress Bar */}
              <div className="w-48 h-1.5 bg-sunken rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Load Error Fallback */}
          {loadError && (
            <div className="absolute inset-0 bg-sunken z-20 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm font-semibold text-danger mb-4">{loadError}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedModelId(activeModel.id)}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Thử lại</span>
              </Button>
            </div>
          )}

          {/* Interactive Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <div className="glass-1 px-3.5 py-1.5 rounded-full pointer-events-auto flex items-center gap-2 text-xs font-mono text-ink-2 shadow-sm border border-line">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Kéo chuột để xoay 360° · Cuộn để thu phóng</span>
              <span className="sm:hidden">Vuốt để xoay xe</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                  isAutoRotate
                    ? "bg-stage-ink text-white border-white/20"
                    : "bg-surface text-ink border-line-strong hover:bg-sunken"
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>{isAutoRotate ? "Tắt tự xoay" : "Bật tự xoay"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetCamera}
                className="w-8 h-8 rounded-full bg-surface text-ink border border-line-strong hover:bg-sunken flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Đặt lại góc nhìn"
              >
                <RefreshCw className="w-3.5 h-3.5 text-ink-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry & Specifications Card (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-surface border border-line-strong p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <h3 className="font-display text-2xl font-black text-ink mb-2">
              {activeModel.name}
            </h3>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed mb-6">
              {activeModel.subtitle}
            </p>

            {/* Specifications Matrix */}
            <div className="space-y-3.5 pb-6 border-b border-line">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-raised">
                <div className="flex items-center gap-2.5 text-xs text-ink-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Năm sản xuất</span>
                </div>
                <span className="font-mono text-sm font-bold text-ink">{activeModel.year}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-raised">
                <div className="flex items-center gap-2.5 text-xs text-ink-3">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span>Cấu hình động cơ</span>
                </div>
                <span className="font-mono text-xs font-bold text-ink">{activeModel.engine}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-raised">
                <div className="flex items-center gap-2.5 text-xs text-ink-3">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span>Công suất cực đại</span>
                </div>
                <span className="font-mono text-xs font-bold text-ink">{activeModel.power}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-raised">
                <div className="flex items-center gap-2.5 text-xs text-ink-3">
                  <Rotate3d className="w-4 h-4 text-primary" />
                  <span>Tốc độ tối đa</span>
                </div>
                <span className="font-mono text-sm font-bold text-ink">{activeModel.topSpeed}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Action */}
          <div className="pt-6">
            <div className="mb-4 p-4 rounded-2xl bg-surface-raised border border-line">
              <span className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1">
                Giá thuê niêm yết
              </span>
              <div className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-mono text-xl font-black text-ink tabular-nums">
                  {formatVND(activeModel.hourlyPrice)}
                </span>
                <span className="text-xs font-semibold text-ink-3">/giờ</span>
              </div>
            </div>

            <Button
              as="a"
              href="#tim-xe"
              variant="amber-hero"
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider"
            >
              <span>Đặt thuê xe này</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
