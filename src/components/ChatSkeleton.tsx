import { Skeleton } from "@/components/ui/Skeleton";

export const ChatSkeleton = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Assistant Message */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-lg" />
        </div>
      </div>

      {/* User Message */}
      <div className="flex items-start justify-end gap-3">
        <div className="flex-1 space-y-2 text-right">
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-12 w-full max-w-md ml-auto" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Assistant Message */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-4/5" />
        </div>
      </div>
    </div>
  );
};
