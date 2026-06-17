import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
	return (
		<div className={cn("h-screen w-screen flex items-center justify-center", className)}>
			<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
		</div>
	);
}

export default Loader;
