import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-[218px]" />
      <Skeleton className="h-[218px]" />
      <Skeleton className="h-[218px]" />
    </div>
  );
}