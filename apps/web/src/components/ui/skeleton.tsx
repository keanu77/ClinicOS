import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="grid grid-cols-8 gap-2 min-w-[800px]">
        <Skeleton className="h-10" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
        {Array.from({ length: 3 }).map((_, row) => (
          <>
            <Skeleton key={`label-${row}`} className="h-24" />
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton key={`cell-${row}-${col}`} className="h-24" />
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Quick Actions skeleton */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton, PageSkeleton, TableSkeleton, CardSkeleton, CardGridSkeleton, ListSkeleton, ScheduleSkeleton, DashboardSkeleton };
