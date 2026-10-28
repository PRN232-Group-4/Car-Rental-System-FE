"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Button } from "@/components/ui/Button";
import { useNavigationRouter } from "@/components/navigation/NavigationProvider";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/register";
import { 
  Rotate3d, 
  Gauge, 
  Cpu, 
  Loader2, 
  RefreshCw,
  Compass,
  ArrowUpRight,
  Palette,
  X,
  Crosshair,
  Box
} from "lucide-react";
import { playTactileClick } from "@/lib/audio/haptic-audio";

interface ModelInfo {
  id: string;
  name: string;
  subtitle: string;
  year: number;
  engine: string;
  power: string;
  topSpeed: string;
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
    modelPath: "/models/porsche_911_carrera_4s.glb",
    scale: 1.0,
    initialY: 0,
    tag: "Dòng xe thể thao đương đại",
  },
  {
    id: "porsche-1975-turbo",
    name: "Porsche 911 930 Turbo (1975)",
    subtitle: "Huyền thoại di sản tốc độ — Mẫu xe thể thao tăng áp đầu tiên của Porsche",
    year: 1975,
    engine: "3.0L Air-Cooled Turbo",
    power: "260 Mã Lực (191 kW)",
    topSpeed: "250 km/h",
    modelPath: "/models/1975_porsche_911_930_turbo.glb",
    scale: 0.95,
    initialY: 0,
    tag: "Dòng xe thể thao cổ điển",
  },
];

interface Colorway {
  id: string;
  name: string;
  hex: string;
  label: string;
}

const COLORWAYS: Colorway[] = [
  { id: "carrera-white", name: "Trắng Carrera", hex: "#f8fafc", label: "Carrera White" },
  { id: "guards-red", name: "Đỏ Guards", hex: "#dc2626", label: "Guards Red" },
  { id: "gentian-blue", name: "Xanh Gentian", hex: "#1d4ed8", label: "Gentian Blue" },
  { id: "jet-black", name: "Đen Ánh Kim", hex: "#18181b", label: "Jet Black Metallic" },
  { id: "crayon-grey", name: "Xám Crayon", hex: "#94a3b8", label: "Crayon Grey" },
  { id: "racing-yellow", name: "Vàng Racing", hex: "#eab308", label: "Racing Yellow" },
];

interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pos: THREE.Vector3;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "exterior-ai",
    title: "BIÊN BẢN NGOẠI QUAN 360°",
    subtitle: "AI Tự Động Ghi Nhận Xước Xát",
    description: "Chụp ảnh 8 góc trước khi nhận xe. AI tự động lập biên bản số đối soát vết xước, bảo vệ 100% tiền cọc.",
    pos: new THREE.Vector3(-1.8, 0.65, 0.65),
  },
  {
    id: "brakes-tires",
    title: "KIỂM ĐỊNH ĐỘ BÁM & PHANH",
    subtitle: "Cảm Biến Áp Suất & Độ Mòn Lốp",
    description: "Độ mòn gai lốp và cảm biến áp suất TPMS được chứng thực kỹ thuật số đạt chuẩn an toàn cao tốc trước giờ giao xe.",
    pos: new THREE.Vector3(-1.3, 0.45, 1.1),
  },
  {
    id: "telematics",
    title: "ĐỐI SOÁT TELEMATICS TỰ ĐỘNG",
    subtitle: "Mức Nhiên Liệu & Odometer Số",
    description: "Telematics tự động chốt km và lượng nhiên liệu/pin khi trả xe. Không phụ thuộc kiểm tra thủ công, minh bạch tuyệt đối.",
    pos: new THREE.Vector3(1.6, 0.95, 0.0),
  },
  {
    id: "smart-lock",
    title: "MỞ KHÓA SỐ & HOÀN CỌC PAYOS",
    subtitle: "Không Cần Chìa Khóa Cơ",
    description: "Nhận xe không tiếp xúc qua ứng dụng Thong Dong. Hệ thống tự động giải phóng cọc PayOS trong 15 phút sau biên bản trả xe.",
    pos: new THREE.Vector3(-0.2, 0.85, 1.0),
  },
];

export default function InteractiveStudio3D() {
  const router = useNavigationRouter();
  const [selectedModelId, setSelectedModelId] = useState<string>("porsche-carrera-4s");
  const [selectedColor, setSelectedColor] = useState<string>("#f8fafc");
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMobileActive, setIsMobileActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentObjectRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(false);
  const isScrollingRef = useRef<boolean>(false);
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  const hotspotElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  const activeModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];
  const activeColor = COLORWAYS.find((c) => c.hex === selectedColor) || COLORWAYS[0];
  const activeHotspot = HOTSPOTS.find((h) => h.id === activeHotspotId) || null;

  // Function to apply paint color to 3D meshes
  const applyPaintColorToMeshes = (group: THREE.Group, hex: string) => {
    const threeColor = new THREE.Color(hex);
    group.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          if (!mat) return;
          const name = (mat.name || "").toLowerCase();
          if (
            name.includes("paint") ||
            name.includes("body") ||
            name.includes("car") ||
            name.includes("exterior") ||
            name.includes("color") ||
            name.includes("shell") ||
            name.includes("hood") ||
            name.includes("door") ||
            name.includes("metal")
          ) {
            if ("color" in mat && mat.color instanceof THREE.Color) {
              mat.color.set(threeColor);
              mat.needsUpdate = true;
            }
          }
        });
      }
    });
  };

  const notifyUserActivity = () => {
    lastInteractionTimeRef.current = Date.now();
    if (isIdleRef.current) {
      isIdleRef.current = false;
      startLoop();
    }
  };

  const handleSelectColor = (hex: string) => {
    notifyUserActivity();
    setSelectedColor(hex);
    playTactileClick();
    if (currentObjectRef.current) {
      applyPaintColorToMeshes(currentObjectRef.current, hex);
    }
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    notifyUserActivity();
    playTactileClick();
    if (activeHotspotId === hotspot.id) {
      setActiveHotspotId(null);
    } else {
      setActiveHotspotId(hotspot.id);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(hotspot.pos, 0.35);
        controlsRef.current.update();
      }
    }
  };

  const startLoop = () => {
    if (animFrameIdRef.current) return;
    const tick = () => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return;
      }

      // DESIGN.md A8: Demand Rendering - Idle sleep after 20s of no interaction
      const elapsed = Date.now() - lastInteractionTimeRef.current;
      if (elapsed > 20000 && !isAutoRotateRef.current) {
        isIdleRef.current = true;
        animFrameIdRef.current = null;
        return;
      }

      animFrameIdRef.current = requestAnimationFrame(tick);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Project 3D Hotspots into 2D DOM screen space (direct DOM updates, zero React re-render)
      if (cameraRef.current && containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight || 540;

        HOTSPOTS.forEach((spot) => {
          const el = hotspotElementsRef.current[spot.id];
          if (!el) return;
          const projected = spot.pos.clone().project(cameraRef.current!);
          const isBehind = projected.z > 1;
          const x = ((projected.x + 1) * w) / 2;
          const y = ((-projected.y + 1) * h) / 2;

          if (isBehind || x < 20 || x > w - 20 || y < 20 || y > h - 20) {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          } else {
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
            el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
          }
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animFrameIdRef.current = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  };

  // 1. Initialize Three.js Scene, Camera, Lights, and Render Loop
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // Scene with transparent background to eliminate dark-mode white box
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.5, 2.0, 5.0);
    cameraRef.current = camera;

    // Renderer: transparent canvas seamlessly blending with light & dark mode surfaces
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setLoadError("Ngữ cảnh đồ họa WebGL bị gián đoạn. Vui lòng tải lại trang.");
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

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

    controls.addEventListener("start", notifyUserActivity);
    controls.addEventListener("change", notifyUserActivity);

    // Lights (Studio 3-Point Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.4);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 1.2);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff2d6, 1.8);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Soft Contact Shadow Plane: Radial gradient fading smoothly to zero (0 draw call shadow map)
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

    // IntersectionObserver: Pause WebGL render loop when section is outside viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          notifyUserActivity();
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Scroll listener: pause autoRotate during active scroll
    let scrollDebounceTimer: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      notifyUserActivity();
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
      notifyUserActivity();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
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

  // 2. Load Selected GLB Model with Progress Tracking and Meshopt Decoder
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
    loader.setMeshoptDecoder(MeshoptDecoder);

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

        const rootGroup = new THREE.Group();
        rootGroup.add(object);
        rootGroup.scale.setScalar(activeModel.scale);

        // Apply current paint colorway
        applyPaintColorToMeshes(rootGroup, selectedColor);

        scene.add(rootGroup);
        currentObjectRef.current = rootGroup;
        setIsLoading(false);
        notifyUserActivity();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
          setLoadingProgress(percent);
        } else {
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
      if (isAutoRotate) notifyUserActivity();
    }
  }, [isAutoRotate]);

  const handleResetCamera = () => {
    notifyUserActivity();
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.autoRotate = isAutoRotate;
      setActiveHotspotId(null);
    }
  };

  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = sectionRef.current;
      if (!el || typeof window === "undefined") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { autoAlpha: 1, scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { autoAlpha: 0.85, scale: 0.98 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section id="showroom-3d" ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 overflow-hidden">
      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
            TRẠM MÔ PHỎNG KIỂM ĐỊNH KỸ THUẬT SỐ // TỶ LỆ NGUYÊN BẢN 1:1
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-ink tracking-tight text-balance">
            Trạm mô&#160;phỏng kiểm&#160;định xe kỹ&#160;thuật&#160;số
          </h2>
        </div>
        <p className="text-ink-2 text-sm sm:text-base max-w-md leading-relaxed text-balance">
          Xoay góc nhìn 360°, đổi màu sơn và khám phá 4 điểm kiểm định an toàn kỹ thuật số hai chiều được chứng thực tự động.
        </p>
      </div>

      {/* Controls Bar: Model Switcher + Colorway Palette */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        {/* Model Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => {
                setSelectedModelId(model.id);
                playTactileClick();
              }}
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

        {/* Real-time Colorway Selector */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface border border-line-strong shadow-sm self-start lg:self-auto">
          <Palette className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-ink-2 mr-1 hidden sm:inline">Màu sơn:</span>
          <div className="flex items-center gap-2">
            {COLORWAYS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectColor(c.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer relative ${
                  selectedColor === c.hex
                    ? "border-primary scale-125 shadow-sm ring-2 ring-primary/30"
                    : "border-stage-ink/20 hover:scale-110"
                }`}
                style={{ backgroundColor: c.hex }}
                title={`${c.name} (${c.label})`}
                aria-label={`Chọn màu ${c.name}`}
              />
            ))}
          </div>
          <span className="font-mono text-xs font-semibold text-ink ml-1 hidden md:inline">
            {activeColor.name}
          </span>
        </div>
      </div>

      {/* 3D Canvas & Telemetry HUD Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Main 3D Canvas Box (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-sunken/40 border border-line-strong overflow-hidden relative shadow-sm min-h-[460px] sm:min-h-[560px] flex items-center justify-center">
          {/* Mobile Editorial Card Fallback (DESIGN.md A8) */}
          {!isMobileActive && (
            <div className="lg:hidden absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-surface border border-line-strong">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-line-strong text-primary flex items-center justify-center mb-3">
                <Box className="w-6 h-6 stroke-[2]" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink mb-1">
                {activeModel.name} ({activeModel.year})
              </h3>
              <p className="text-xs text-ink-3 max-w-xs mb-4">
                Trải nghiệm xoay 360° tương tác vật lý 3D. Nhấp để kích hoạt bộ giải mã đồ họa trực tiếp.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsMobileActive(true);
                  playTactileClick();
                }}
              >
                <span>Xem xe 3D</span>
              </Button>
            </div>
          )}

          {/* Mobile active close button */}
          {isMobileActive && (
            <button
              type="button"
              onClick={() => {
                setIsMobileActive(false);
                playTactileClick();
              }}
              className="lg:hidden absolute top-4 left-4 z-30 px-3 py-1.5 rounded-xl text-white text-xs font-medium glass-ink shadow flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Thu nhỏ 3D</span>
            </button>
          )}

          {/* Canvas Mount Target */}
          <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

          {/* 3D Spatial Hotspot Anchors (DOM overlay with 60fps GPU transforms) */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {HOTSPOTS.map((spot) => (
              <div
                key={spot.id}
                ref={(el) => {
                  hotspotElementsRef.current[spot.id] = el;
                }}
                className="absolute top-0 left-0 transition-opacity duration-200 pointer-events-auto"
                style={{ opacity: 0 }}
              >
                <button
                  type="button"
                  onClick={() => handleHotspotClick(spot)}
                  className={`relative group w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                    activeHotspotId === spot.id ? "scale-125" : "hover:scale-110"
                  }`}
                  aria-label={`Chi tiết: ${spot.title}`}
                >
                  {/* Pulsing Sonar Ring */}
                  <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-75" />
                  {/* Solid Center Crosshair Badge */}
                  <span className="relative w-7 h-7 rounded-full bg-stage-ink border border-white/40 text-primary-graphic flex items-center justify-center shadow-lg">
                    <Crosshair className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* Active Hotspot Glass Popover Card */}
          {activeHotspot && (
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm z-20 p-5 rounded-2xl bg-surface border border-line-strong shadow-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold px-2 py-0.5 rounded bg-primary-tint">
                    {activeHotspot.subtitle}
                  </span>
                  <h4 className="font-display text-base font-bold text-ink mt-1">
                    {activeHotspot.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHotspotId(null)}
                  className="p-1 rounded-lg text-ink-3 hover:text-ink hover:bg-sunken transition-colors cursor-pointer"
                  aria-label="Đóng bảng thông tin"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-ink-2 leading-relaxed">
                {activeHotspot.description}
              </p>
            </div>
          )}

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
              <span className="hidden sm:inline">Kéo chuột xoay 360° · Cuộn thu phóng · Nhấp vào điểm tiêu cự</span>
              <span className="sm:hidden">Vuốt để xoay xe</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setIsAutoRotate(!isAutoRotate);
                  playTactileClick();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                  isAutoRotate
                    ? "bg-primary text-white border-primary"
                    : "glass-1 text-ink-2 hover:text-ink border-line"
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>{isAutoRotate ? "Tự xoay: Bật" : "Tự xoay: Tắt"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetCamera}
                className="glass-1 p-2 rounded-full text-ink-2 hover:text-ink transition-colors border border-line shadow-sm cursor-pointer"
                title="Đặt lại góc nhìn ban đầu"
                aria-label="Đặt lại góc nhìn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry & Specifications HUD Sidebar (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-surface border border-line-strong p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-primary-tint text-primary font-bold">
                {activeModel.tag}
              </span>
              <span className="text-xs font-mono text-ink-3">
                Mã khung: TD-3D-{activeModel.year}
              </span>
            </div>

            <h3 className="font-display text-2xl font-black text-ink mb-2">
              {activeModel.name}
            </h3>
            <p className="text-xs text-ink-2 leading-relaxed mb-6">
              {activeModel.subtitle}
            </p>

            {/* Spec Readout Table */}
            <div className="space-y-3 pt-2 border-t border-line">
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
            <p className="mb-4 text-xs text-ink-3 leading-relaxed">
              Mô hình 3D vật lý nguyên bản tỷ lệ 1:1. Khám phá thêm hàng chục mẫu xe cao cấp trong danh mục thực tế.
            </p>

            <Button
              type="button"
              onClick={() => {
                playTactileClick();
                router.push("/find");
              }}
              variant="marketing-cta"
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wider cursor-pointer"
            >
              <span>Xem xe thực tế</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
