"use client";

import { useState } from "react";
import Image from "next/image";
import { initialsFor } from "@/features/profile/api";

type AccountAvatarProps = {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: number;
};

export default function AccountAvatar({ src, name, className = "", size = 40 }: AccountAvatarProps) {
  const source = src?.trim() || null;

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}>
      <AvatarContent key={source} src={source} name={name} size={size} />
    </span>
  );
}

function AvatarContent({ src, name, size }: AccountAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{initialsFor(name) || "?"}</>;

  return (
    <Image
      src={src}
      alt={`Ảnh đại diện ${name || "nhân viên"}`}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}
