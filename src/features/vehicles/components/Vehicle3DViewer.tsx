"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Rotate3d, Play, RotateCcw, Loader2, Sparkles, AlertCircle, Camera } from "lucide-react";

export interface Vehicle3DViewerProps {
  modelUrl?: string;
  posterUrl: string;
  vehicleName: string;
  defaultColor?: string;
  className?: string;
}

export const CAR_COLORS = [
  { name: "Trắng", hex: "#F2F2F0" },
  { name: "Đen", hex: "#1A1A1A" },
  { name: "Bạc", hex: "#B8BCBF" },
  { name: "Xám", hex: "#6B7075" },
  { name: "Đỏ", hex: "#9B1C1C" },
  { name: "Xanh dương", hex: "#1E3A8A" },
  { name: "Xanh lá", hex: "#14532D" },
  { name: "Vàng", hex: "#B7791F" },
];

export function disposeThreeResources(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  controls?: OrbitControls
) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) {
          const matRec = mat as unknown as Record<string, unknown>;
          for (const key of Object.keys(matRec)) {
            const prop = matRec[key];
            if (prop && typeof prop === "object" && "isTexture" in prop && (prop as THREE.Texture).isTexture) {
              (prop as THREE.Texture).dispose();
            }
          }
          mat.dispose();
        }
      }
    }
  });

  if (controls) {
    controls.dispose();
  }

  renderer.dispose();
  renderer.forceContextLoss();

  if (renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  scene.clear();
}

export default function Vehicle3DViewer({
  modelUrl,
  posterUrl,
  vehicleName,
  defaultColor = "#B8BCBF",
  className = "",
}: Vehicle3DViewerProps) {
  // On-demand activation để tiết kiệm dữ liệu mạng & GPU
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelObjectRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const isAutoRotateRef = useRef(isAutoRotate);

  // Khởi tạo Three.js khi được kích hoạt
  useEffect(() => {
    if (!isActivated || !modelUrl || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f6f2); // Studio light warm gray
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.2, 1.8, 4.8);

    // 3. Renderer (cap 1.5 pixel ratio for performance)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.8;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Không cho xuyên gầm
    controls.autoRotate = isAutoRotateRef.current;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // 5. Lights (Studio 3-Point Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 1.1);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff2d6, 1.6);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Animation Loop with visibility pause
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

    // IntersectionObserver to pause render loop when offscreen
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

    // Resize listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 480;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // 7. Load GLB Model
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadError(null);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const object = gltf.scene;

        // Auto center bounding box
        const bbox = new THREE.Box3().setFromObject(object);
        const center = bbox.getCenter(new THREE.Vector3());

        object.position.x = -center.x;
        object.position.y = -bbox.min.y;
        object.position.z = -center.z;

        object.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        const rootGroup = new THREE.Group();
        rootGroup.add(object);
        rootGroup.scale.setScalar(1.0);

        scene.add(rootGroup);
        modelObjectRef.current = rootGroup;
        setIsLoading(false);
        startLoop();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
          setLoadingProgress(percent);
        } else {
          setLoadingProgress((prev) => Math.min(95, prev + 10));
        }
      },
      (err) => {
        console.error("[Vehicle3DViewer Error]", err);
        setLoadError("Không thể tải mô hình 3D. Vui lòng xem ảnh chụp thực tế.");
        setIsLoading(false);
      }
    );

    // Cleanup WebGL on unmount
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      stopLoop();
      disposeThreeResources(scene, renderer, controls);
    };
  }, [isActivated, modelUrl]);

  // Cập nhật màu thân xe
  useEffect(() => {
    if (!modelObjectRef.current) return;

    modelObjectRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material;
        const matName = ((mat as THREE.Material)?.name || "").toLowerCase();
        const meshName = (mesh.name || "").toLowerCase();

        // Kiểm tra vật liệu thuộc phần sơn vỏ xe
        if (
          matName.includes("paint") ||
          matName.includes("body") ||
          matName.includes("car_paint") ||
          meshName.includes("body") ||
          meshName.includes("paint")
        ) {
          if (Array.isArray(mat)) {
            mat.forEach((m) => {
              if ("color" in m) (m as THREE.MeshStandardMaterial).color.set(selectedColor);
            });
          } else if (mat && "color" in mat) {
            (mat as THREE.MeshStandardMaterial).color.set(selectedColor);
          }
        }
      }
    });
  }, [selectedColor]);

  // Cập nhật auto-rotate
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
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

  // Nếu không có mô hình 3D cho dòng xe này
  if (!modelUrl) {
    return (
      <div
        data-testid="3d-fallback-banner"
        className={`relative aspect-[16/10] w-full overflow-hidden rounded sm:rounded border border-td-rule bg-stage-ink flex flex-col justify-end p-6 text-white ${className}`}
      >
        <Image
          src={posterUrl}
          alt={vehicleName}
          fill
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover opacity-60"
        />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-primary-tint font-bold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Mô hình 3D đang được hoàn thiện</span>
          </div>
          <h3 className="text-lg font-bold text-white">{vehicleName}</h3>
          <p className="text-xs text-white/80 max-w-md">
            Dòng xe này hiện được hiển thị qua ảnh chụp thực tế đa góc. Mô hình 3D tương tác có sẵn trên dòng xe Porsche 911 tại chi nhánh Trung tâm.
          </p>
        </div>
      </div>
    );
  }

  // Trạng thái On-demand: Hiển thị poster 2D kèm nút khởi động
  if (!isActivated) {
    return (
      <div
        data-testid="3d-poster-view"
        className={`relative aspect-[16/10] w-full overflow-hidden rounded sm:rounded border border-td-rule bg-stage-ink flex items-center justify-center p-6 ${className}`}
      >
        <Image
          src={posterUrl}
          alt={vehicleName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover opacity-50"
        />

        <div className="relative z-10 flex flex-col items-center text-center p-6 rounded bg-stage-ink/80 border border-white/10 max-w-md">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-primary text-white mb-3">
            <Rotate3d className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white">Khám phá mô hình 3D tương tác</h3>
          <p className="mt-1 text-xs text-white/80 leading-relaxed">
            Xem 360 độ ngoại thất chuẩn xác của {vehicleName}, kiểm tra góc nhìn và tùy biến màu sắc thân xe thời gian thực.
          </p>

          <button
            type="button"
            onClick={() => setIsActivated(true)}
            className="mt-4 flex items-center gap-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Khởi động mô hình 3D (25 MB)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="3d-canvas-container"
      className={`relative aspect-[16/10] w-full overflow-hidden rounded sm:rounded border border-td-rule bg-td-chalk ${className}`}
    >
      {/* Three.js Canvas Container — touch-action: pan-y đảm bảo cuộn dọc trên mobile */}
      <div
        ref={containerRef}
        style={{ touchAction: "pan-y" }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-td-chalk/90 p-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-3 text-xs font-bold text-td-ink">
            Đang tải mô hình 3D chính xác...{" "}
            <span className="font-mono tabular-nums">{loadingProgress}%</span>
          </p>
          <div className="mt-3 h-1.5 w-48 rounded-full bg-line overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-td-chalk/95 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-danger mb-2" />
          <p className="text-xs font-bold text-td-ink">{loadError}</p>
          <button
            type="button"
            onClick={() => setIsActivated(false)}
            className="mt-3 rounded border border-td-rule bg-td-white px-3 py-1.5 text-xs font-semibold text-td-ink hover:bg-td-chalk"
          >
            Quay lại xem ảnh chụp
          </button>
        </div>
      )}

      {/* Floating Toolbar Điều Khiển 3D */}
      {!isLoading && !loadError && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 rounded bg-td-white/90 px-3 py-1.5 text-xs font-bold text-td-ink border border-td-rule pointer-events-auto">
            <Rotate3d className="w-4 h-4 text-primary" />
            <span>Kéo chuột / vuốt để xoay</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              aria-label="Bật/Tắt tự xoay"
              className={`rounded px-2.5 py-1.5 text-xs font-semibold shadow-xs border transition-colors cursor-pointer ${
                isAutoRotate
                  ? "bg-primary text-white border-primary"
                  : "bg-td-white/90 text-td-ink border-td-rule hover:bg-td-chalk"
              }`}
            >
              Tự xoay
            </button>
            <button
              type="button"
              onClick={handleResetCamera}
              aria-label="Đặt lại góc camera"
              className="rounded border border-td-rule bg-td-white/90 p-2 text-td-ink shadow-xs hover:bg-td-chalk transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bảng chọn màu thân xe (DESIGN.md A8 Color Customization) */}
      {!isLoading && !loadError && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded bg-td-white/95 p-3 border border-td-rule">
          <div className="flex items-center gap-1.5 text-xs font-bold text-td-ink">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Màu thân xe:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {CAR_COLORS.map((col) => {
              const isSelected = selectedColor.toLowerCase() === col.hex.toLowerCase();
              return (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setSelectedColor(col.hex)}
                  aria-label={`Chọn màu ${col.name}`}
                  className={`h-6 w-6 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-xs border-white"
                      : "border-td-rule hover:scale-105"
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
