"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

export interface VehicleGalleryProps {
  mainImageUrl: string;
  galleryImages?: string[];
  vehicleName: string;
  vehicleColor?: string;
  className?: string;
}

export function VehicleGallery({
  mainImageUrl,
  galleryImages = [],
  vehicleName,
  vehicleColor,
  className = "",
}: VehicleGalleryProps) {
  // Tập hợp danh sách ảnh hợp lệ
  const allImages = React.useMemo(() => {
    const list = [mainImageUrl, ...galleryImages].filter(Boolean);
    return [...new Set(list)];
  }, [mainImageUrl, galleryImages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Điều khiển bàn phím trong lightbox (Mũi tên trái/phải)
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  const currentImage = allImages[activeIndex] || mainImageUrl;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 1. Khung xem ảnh chính (tỉ lệ 16:10, bo góc r-panel 24px) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setLightboxOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setLightboxOpen(true);
          }
        }}
        className="group relative aspect-[16/10] w-full overflow-hidden sm:rounded border border-td-rule bg-stage-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label={`Xem ảnh lớn của ${vehicleName}`}
      >
        <Image
          src={currentImage}
          alt={`${vehicleName} - Ảnh ngoại thất ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Nút phóng to Lightbox */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {vehicleColor && (
            <span className="hidden sm:inline-flex bg-stage-ink/80 px-2.5 py-1 text-xs font-medium text-white">
              Màu: {vehicleColor}
            </span>
          )}
          <span className="flex items-center gap-1.5 bg-stage-ink/80 px-2.5 py-1 text-xs font-semibold text-white group-hover:bg-primary transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phóng to</span>
          </span>
        </div>

        {/* Chỉ báo số lượng ảnh */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-stage-ink/80 px-2.5 py-1 text-xs font-mono tabular-nums font-semibold text-white">
          <Camera className="w-3.5 h-3.5 text-primary-tint" />
          <span>{activeIndex + 1} / {allImages.length}</span>
        </div>
      </div>

      {/* 2. Dải ảnh thu nhỏ (Thumbnails Strip) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((imgUrl, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`thumb-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative h-16 w-24 sm:h-20 sm:w-28 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-td-rule opacity-70 hover:opacity-100 hover:border-td-rule"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${vehicleName} - Thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Radix Dialog Lightbox xem toàn màn hình */}
      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-stage-ink/90 transition-opacity duration-200" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 focus:outline-none"
          >
            <Dialog.Title className="sr-only">
              Xem ảnh phóng to: {vehicleName} ({activeIndex + 1}/{allImages.length})
            </Dialog.Title>

            {/* Khung ảnh trung tâm */}
            <div className="relative max-h-[85vh] max-w-5xl w-full h-[70vh] flex items-center justify-center">
              <Image
                src={currentImage}
                alt={`${vehicleName} - Phóng to ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />

              {/* Điều hướng Prev / Next */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Ảnh trước"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-stage-ink/80 p-3 text-white hover:bg-primary transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Ảnh kế tiếp"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-stage-ink/80 p-3 text-white hover:bg-primary transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Nút đóng Lightbox */}
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng xem ảnh"
                className="absolute top-4 right-4 rounded-full bg-stage-ink/80 p-2.5 text-white hover:bg-danger transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>

            {/* Chỉ báo phía dưới */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stage-ink/80 px-4 py-1.5 font-mono text-xs tabular-nums font-semibold text-white">
              {activeIndex + 1} / {allImages.length}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
