import { Skeleton, SkeletonBlock } from "./Skeleton";

/** Shared structural placeholder for routes suspended while their content loads. */
export default function PageFallback({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return <SkeletonBlock label={label} className="space-y-6 px-4 py-8 sm:px-6">
    <div className="space-y-3"><Skeleton className="h-7 w-56 max-w-full" /><Skeleton className="h-4 w-80 max-w-full" /></div>
    {Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-3 border-t border-line pt-5">
      <Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" />
    </div>)}
  </SkeletonBlock>;
}
