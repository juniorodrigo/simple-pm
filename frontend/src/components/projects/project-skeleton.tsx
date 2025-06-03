import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header skeleton */}
			<div className="flex flex-col md:flex-row md:justify-between gap-4">
				<div>
					<Skeleton className="h-8 w-64 mb-2" />
					<Skeleton className="h-4 w-96" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-32" />
				</div>
			</div>

			{/* Stats skeleton */}
			<div className="border rounded-lg overflow-hidden">
				<div className="flex justify-between px-4 py-3 bg-muted/40">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-6 w-6" />
				</div>
				<div className="p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-24" />
						))}
					</div>
				</div>
			</div>

			{/* Content skeleton */}
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<Skeleton className="h-6 w-48" />
					<div className="flex gap-2">
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-24" />
					</div>
				</div>
				<Skeleton className="h-[400px] w-full" />
			</div>
		</div>
	);
}
