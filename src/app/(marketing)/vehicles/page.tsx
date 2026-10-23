"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import PageFallback from "@/components/ui/PageFallback";

export default function VehiclesRedirectPage() {
  return (
    <Suspense fallback={<PageFallback label="Đang mở danh sách phương tiện..." />}>
      <RedirectHandler />
    </Suspense>
  );
}

function RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(qs ? `/find?${qs}` : "/find");
  }, [router, searchParams]);

  return null;
}
