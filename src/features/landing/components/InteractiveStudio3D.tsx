"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
    modelPath: "/models/porsche_911_carrera_4s_opt.glb",
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
    modelPath: "/models/1975_porsche_911_930_turbo_opt.glb",
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
    pos: new THREE.Vector3(-1.35, 0.62, 0.0),
  },
  {
    id: "brakes-tires",
    title: "KIỂM ĐỊNH ĐỘ BÁM & PHANH",
    subtitle: "Cảm Biến Áp Suất & Độ Mòn Lốp",
    description: "Độ mòn gai lốp và cảm biến áp suất TPMS được chứng thực kỹ thuật số đạt chuẩn an toàn cao tốc trước giờ giao xe.",
    pos: new THREE.Vector3(1.15, 0.32, 0.82),
  },
  {
    id: "telematics",
    title: "ĐỐI SOÁT TELEMATICS TỰ ĐỘNG",
    subtitle: "Mức Nhiên Liệu & Odometer Số",
    description: "Telematics tự động chốt km và lượng nhiên liệu/pin khi trả xe. Không phụ thuộc kiểm tra thủ công, minh bạch tuyệt đối.",
    pos: new THREE.Vector3(0.15, 0.88, 0.35),
  },
  {
    id: "smart-lock",
    title: "MỞ KHÓA SỐ & HOÀN CỌC PAYOS",
    subtitle: "Không Cần Chìa Khóa Cơ",
    description: "Nhận xe không tiếp xúc qua ứng dụng Thong Dong. Hệ thống tự động giải phóng cọc PayOS trong 15 phút sau biên bản trả xe.",
    pos: new THREE.Vector3(1.55, 0.48, 0.45),
  },
];

export default function InteractiveStudio3D() {
  const router = useNavigationRouter();
  const [selectedModelId, setSelectedModelId] = useState<string>("porsche-carrera-4s");
  const [selectedColor, setSelectedColor] = useState<string>("#f8fafc");
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>("exterior-ai");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMobileActive, setIsMobileActive] = useState<boolean>(false);
  const [isModelRendered, setIsModelRendered] = useState<boolean>(false);
  const frameCountRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentObjectRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const isScrollingRef = useRef<boolean>(false);
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  const hotspotElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const lastInteractionTimeRef = useRef<number>(0);
  const isIdleRef = useRef<boolean>(false);
  const isUserInteractingRef = useRef<boolean>(false);

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

  function startLoop() {
    if (animFrameIdRef.current) return;
    const tick = () => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return;
      }

      // DESIGN.md A8: Demand Rendering - Maintain active loop on desktop (1920px) for uninterrupted visual stability
      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
      const elapsed = Date.now() - lastInteractionTimeRef.current;
      if (!isDesktop && elapsed > 20000 && !isAutoRotateRef.current) {
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
        if (currentObjectRef.current) {
          frameCountRef.current++;
          if (frameCountRef.current >= 2) {
            setIsModelRendered(true);
          }
        }
      }
    };
    animFrameIdRef.current = requestAnimationFrame(tick);
  };

  function stopLoop() {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  };

  const notifyUserActivity = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
    if (isIdleRef.current) {
      isIdleRef.current = false;
      startLoop();
    }
  }, []);

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

  // 1. Initialize Three.js Scene, Camera, Lights, and Render Loop
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // Scene with transparent background to eliminate dark-mode white box
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera: fixed studio aspect
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.5, 1.25, 4.1);
    cameraRef.current = camera;

    // Renderer: transparent canvas seamlessly blending with light & dark mode surfaces
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
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setLoadError("Ngữ cảnh đồ họa WebGL bị gián đoạn. Vui lòng tải lại trang.");
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    // Controls: strictly disable zoom & pan so page scrolling won't resize or displace the car
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Do not go under the ground
    controls.minPolarAngle = Math.PI / 6;
    controls.target.set(0, 0.42, 0);
    controls.autoRotate = isAutoRotateRef.current;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    controls.addEventListener("start", () => {
      isUserInteractingRef.current = true;
      notifyUserActivity();
    });
    controls.addEventListener("change", notifyUserActivity);

    // Lights (Studio 3-Point Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 1.3);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff2d6, 2.0);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Dynamic studio theme lighting tuned for full-bleed obsidian stage
    const updateStudioThemeLighting = () => {
      ambientLight.intensity = 2.0;
      keyLight.intensity = 3.0;
      rimLight.intensity = 2.8;
      renderer.toneMappingExposure = 1.35;
    };
    updateStudioThemeLighting();

    const studioThemeObserver = new MutationObserver(() => {
      updateStudioThemeLighting();
    });
    studioThemeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

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
      studioThemeObserver.disconnect();
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

        object.updateMatrixWorld(true);
        const bbox = new THREE.Box3();
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mName = (mesh.name || "").toLowerCase();
            mesh.geometry?.computeBoundingBox();
            const gSize = mesh.geometry?.boundingBox?.getSize(new THREE.Vector3());
            const isFlatFloor = gSize ? gSize.y < 0.02 && (gSize.x > 2.2 || gSize.z > 2.2) : false;

            if (
              mName.includes("plane") ||
              mName === "object_140" ||
              mName.includes("floor") ||
              mName.includes("shadow") ||
              isFlatFloor
            ) {
              mesh.visible = false;
            } else {
              bbox.expandByObject(mesh);
            }
          }
        });

        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.z, 0.001);
        const normalizedScale = (4.35 / maxDim) * activeModel.scale;

        object.position.x = -center.x;
        object.position.y = -bbox.min.y;
        object.position.z = -center.z;

        const rootGroup = new THREE.Group();
        rootGroup.add(object);
        rootGroup.scale.setScalar(normalizedScale);

        // Apply current paint colorway
        applyPaintColorToMeshes(rootGroup, selectedColor);

        scene.add(rootGroup);
        currentObjectRef.current = rootGroup;
        if (rendererRef.current && cameraRef.current) {
          rendererRef.current.render(scene, cameraRef.current);
        }
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
    <section
      id="showroom-3d"
      ref={sectionRef}
      className="relative py-14 lg:py-16 px-4 sm:px-6 lg:px-8 w-full bg-stage-ink text-white border-y border-line-strong scroll-mt-24 overflow-hidden"
    >
      {/* Monumental Chapter Numeral */}
      <span 
        aria-hidden="true" 
        className="font-display font-black text-[clamp(4.5rem,7vw,8rem)] leading-none text-white/10 select-none pointer-events-none absolute right-8 top-2 z-0 opacity-40"
      >
        04
      </span>

      {/* Section Header */}
      <div className="relative z-10 max-w-[1680px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase block mb-2">
            TRẠM MÔ PHỎNG KIỂM ĐỊNH KỸ THUẬT SỐ // TỶ LỆ NGUYÊN BẢN 1:1
          </span>
          <h2 data-kinetic-skew="true" className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight text-balance">
            Trạm mô&#160;phỏng kiểm&#160;định xe kỹ&#160;thuật&#160;số
          </h2>
        </div>
        <p className="text-white/70 text-sm sm:text-base max-w-md leading-relaxed text-balance">
          Xoay góc nhìn 360°, đổi màu sơn thời gian thực và khám phá 4 điểm kiểm định an toàn kỹ thuật số hai chiều được chứng thực tự động.
        </p>
      </div>

      {/* Full-Bleed Spatial 3D Stage with Perimeter Docking Controls */}
      <div className="relative w-full max-w-[1680px] mx-auto h-[620px] sm:h-[680px] overflow-hidden flex items-center justify-center">
        {/* Mobile Editorial Card Fallback (DESIGN.md A8) */}
        {!isMobileActive && (
          <div className="lg:hidden absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-stage-ink border border-white/15">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-primary flex items-center justify-center mb-3">
              <Box className="w-6 h-6 stroke-[2]" aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-1">
              {activeModel.name} ({activeModel.year})
            </h3>
            <p className="text-xs text-white/60 max-w-xs mb-4">
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

        {/* High-Fidelity Studio Fallback Plate (Transparent Cutout, zero grey box) */}
        {!isModelRendered && (
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/hero-car/hero-car-composite-1920.webp"
              alt="Porsche 911 Carrera 4S Studio Stage"
              loading="eager"
              decoding="sync"
              className="max-w-[820px] w-full max-h-[440px] object-contain drop-shadow-2xl select-none"
            />
          </div>
        )}

        {/* Canvas Mount Target */}
        <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing z-10" />

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
                <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-75" />
                {/* Solid Center Crosshair Badge */}
                <span className="relative w-7 h-7 rounded-full bg-stage-ink border border-white/40 text-primary-graphic flex items-center justify-center shadow-lg">
                  <Crosshair className="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Active Hotspot Glass Popover Card (Docked Top-Left below switcher) */}
        {activeHotspot && (
          <div className="absolute top-20 left-4 sm:left-6 max-w-sm z-30 p-5 rounded-2xl glass-ink border border-white/20 text-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold px-2 py-0.5 rounded bg-primary/20">
                  {activeHotspot.subtitle}
                </span>
                <h4 className="font-display text-base font-bold text-white mt-1">
                  {activeHotspot.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveHotspotId(null)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Đóng bảng thông tin"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              {activeHotspot.description}
            </p>
          </div>
        )}

        {/* Loading Overlay with Progress Counter */}
        {isLoading && (
          <div className="absolute inset-0 glass-ink z-20 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <h4 className="font-display text-base font-bold text-white mb-1">
              Đang nạp mô hình 3D {activeModel.name}...
            </h4>
            <p className="text-xs text-white/60 font-mono mb-4">
              Dữ liệu mô phỏng vật lý đa giác cao · {loadingProgress}%
            </p>
            {/* Progress Bar */}
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Load Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 bg-stage-ink/90 z-20 flex flex-col items-center justify-center p-6 text-center">
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

        {/* PERIMETER DOCKING CONTROLS (Center 65% area remains 100% clear) */}

        {/* 1. Top-Left Floating Dock: Model Selector */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
          <div className="glass-ink p-1.5 rounded-2xl border border-white/15 shadow-sm flex items-center gap-1.5">
            {MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  setSelectedModelId(model.id);
                  playTactileClick();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 select-none ${
                  selectedModelId === model.id
                    ? "bg-primary text-white shadow-sm border border-primary/40"
                    : "hover:bg-white/10 text-white/70 hover:text-white"
                }`}
              >
                <span>{model.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    selectedModelId === model.id
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {model.year}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Top-Right Floating Dock: Colorway Palette */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 pointer-events-auto">
          <div className="glass-ink px-3.5 py-2 rounded-2xl border border-white/15 shadow-sm flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-primary shrink-0" />
            <div className="flex items-center gap-1.5">
              {COLORWAYS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectColor(c.hex)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                    selectedColor === c.hex
                      ? "border-primary scale-125 shadow-sm ring-2 ring-primary/40"
                      : "border-white/30 hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.label})`}
                  aria-label={`Chọn màu ${c.name}`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-semibold text-white/90 ml-1 hidden md:inline">
              {activeColor.name}
            </span>
          </div>
        </div>

        {/* 3. Bottom-Left Floating Dock: Navigation Guidance & Camera Controls */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="glass-ink px-3.5 py-2 rounded-full border border-white/15 flex items-center gap-2 text-xs font-mono text-white/70 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Giữ &amp; kéo chuột xoay 360° · Nhấp vào điểm tiêu cự trên thân xe</span>
            <span className="sm:hidden">Vuốt để xoay xe</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAutoRotate(!isAutoRotate);
                playTactileClick();
              }}
              className={`px-3 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                isAutoRotate
                  ? "bg-primary text-white border-primary"
                  : "glass-ink text-white/70 hover:text-white border-white/15"
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAutoRotate ? "Tự xoay: Bật" : "Tự xoay: Tắt"}</span>
            </button>

            <button
              type="button"
              onClick={handleResetCamera}
              className="glass-ink p-2 rounded-full text-white/70 hover:text-white transition-colors border border-white/15 shadow-sm cursor-pointer"
              title="Đặt lại góc nhìn ban đầu"
              aria-label="Đặt lại góc nhìn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Bottom-Right Floating Dock: Direct Booking CTA */}
        <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 pointer-events-auto">
          <div className="glass-ink p-1.5 rounded-2xl border border-white/15 shadow-sm">
            <Button
              type="button"
              onClick={() => {
                playTactileClick();
                router.push("/find");
              }}
              variant="marketing-cta"
              size="sm"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <span>Xem xe thực tế</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-Stage Horizontal Spec Bar (Border-top architectural divider, zero white box slop) */}
      <div className="max-w-[1680px] mx-auto border-t border-white/15 pt-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-white mt-8">
        <div className="flex items-center justify-between border-b lg:border-b-0 pb-4 lg:pb-0 border-white/10">
          <div>
            <span className="text-[11px] font-sans text-white/60 block mb-1">Cấu hình động cơ</span>
            <span className="font-mono text-base font-bold text-white tracking-tight">{activeModel.engine}</span>
          </div>
          <Cpu className="w-5 h-5 text-primary shrink-0 opacity-80" />
        </div>

        <div className="flex items-center justify-between border-b lg:border-b-0 pb-4 lg:pb-0 border-white/10">
          <div>
            <span className="text-[11px] font-sans text-white/60 block mb-1">Công suất cực đại</span>
            <span className="font-mono text-base font-bold text-white tracking-tight">{activeModel.power}</span>
          </div>
          <Gauge className="w-5 h-5 text-primary shrink-0 opacity-80" />
        </div>

        <div className="flex items-center justify-between border-b lg:border-b-0 pb-4 lg:pb-0 border-white/10">
          <div>
            <span className="text-[11px] font-sans text-white/60 block mb-1">Tốc độ tối đa</span>
            <span className="font-mono text-base font-bold text-white tracking-tight">{activeModel.topSpeed}</span>
          </div>
          <Rotate3d className="w-5 h-5 text-primary shrink-0 opacity-80" />
        </div>

        <div className="flex items-center justify-between pb-4 lg:pb-0">
          <div>
            <span className="text-[11px] font-sans text-white/60 block mb-1">Tiêu chuẩn an toàn</span>
            <span className="font-mono text-sm font-bold text-white tracking-tight">Biên bản số 60s · Hoàn cọc 15p</span>
          </div>
          <Box className="w-5 h-5 text-primary shrink-0 opacity-80" />
        </div>
      </div>
    </section>
  );
}
