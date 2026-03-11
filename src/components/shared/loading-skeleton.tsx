"use client";

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-lg animate-pulse space-y-3">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-32 rounded-lg bg-muted" />
      <div className="h-4 w-1/2 rounded bg-muted" />
    </div>
  );
}
