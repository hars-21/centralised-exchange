import type { DepthLevel } from "@/types";
import { Info } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function Orderbook({
	bids,
	asks,
	loading,
}: {
	bids: DepthLevel[];
	asks: DepthLevel[];
	loading?: boolean;
}) {
	if (loading) {
		return (
			<div className="flex h-full flex-col select-none">
				<div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-muted/15">
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-2 w-2 rounded-full" />
					</div>
					<Skeleton className="h-4 w-4 rounded-full" />
				</div>

				<div className="flex border-b border-border/30 px-4 py-2 bg-muted/5 gap-4">
					<Skeleton className="h-3 flex-1" />
					<Skeleton className="h-3 flex-1" />
					<Skeleton className="h-3 flex-1" />
				</div>

				<div className="flex-1 flex flex-col justify-between min-h-0 py-2">
					<div className="flex flex-col justify-end flex-1 min-h-0 gap-2.5 px-4 py-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={`ask-loading-${i}`} className="flex gap-4">
								<Skeleton className="h-3 flex-1" />
								<Skeleton className="h-3 flex-1" />
								<Skeleton className="h-3 flex-1" />
							</div>
						))}
					</div>
					<div className="border-y border-border/40 bg-muted/10 px-4 py-2.5">
						<Skeleton className="h-4 w-2/3" />
					</div>
					<div className="flex flex-col justify-start flex-1 min-h-0 gap-2.5 px-4 py-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={`bid-loading-${i}`} className="flex gap-4">
								<Skeleton className="h-3 flex-1" />
								<Skeleton className="h-3 flex-1" />
								<Skeleton className="h-3 flex-1" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	const showMockAsks = asks === undefined;
	const showMockBids = bids === undefined;

	return (
		<div className="flex h-full flex-col select-none">
			<div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-muted/15">
				<div className="flex items-center gap-2">
					<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Order Book
					</h2>
					<div
						className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse"
						title="Live matching engine"
					/>
				</div>
				<Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
			</div>

			<div className="flex border-b border-border/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 bg-muted/5">
				<span className="flex-1">Price (USD)</span>
				<span className="flex-1 text-right">Size (BTC)</span>
				<span className="flex-1 text-right">Total</span>
			</div>

			<div className="flex flex-1 flex-col justify-between min-h-0 py-1.5">
				<div className="flex flex-col justify-end flex-1 min-h-0">
					{showMockAsks
						? Array.from({ length: 6 }).map((_, i) => (
								<div key={`ask-mock-${i}`} className="flex py-1.5 px-4 text-xs font-mono">
									<span className="flex-1 text-destructive/40 font-medium">—</span>
									<span className="flex-1 text-right text-muted-foreground/30">—</span>
									<span className="flex-1 text-right text-muted-foreground/30">—</span>
								</div>
							))
						: Array.from(asks).map((ask, i) => (
								<div
									key={`ask-${i}`}
									className="flex py-1.5 px-4 text-xs font-mono hover:bg-muted/10 transition-colors"
								>
									<span className="flex-1 text-destructive/80 font-medium">{ask.price}</span>
									<span className="flex-1 text-right text-muted-foreground/80">{ask.qty}</span>
									<span className="flex-1 text-right text-muted-foreground/40">—</span>
								</div>
							))}
				</div>

				<div className="border-y border-border/40 bg-muted/10 px-4 py-2 flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-sm font-semibold tracking-tight text-foreground">
							—
						</span>
						<span className="text-[10px] text-muted-foreground font-medium uppercase">USD</span>
					</div>
					<div className="text-[10px] text-muted-foreground font-medium">
						Spread: <span className="font-mono">—</span>
					</div>
				</div>

				<div className="flex flex-col justify-start flex-1 min-h-0">
					{showMockBids
						? Array.from({ length: 6 }).map((_, i) => (
								<div key={`bid-mock-${i}`} className="flex py-1.5 px-4 text-xs font-mono">
									<span className="flex-1 text-success/40 font-medium">—</span>
									<span className="flex-1 text-right text-muted-foreground/30">—</span>
									<span className="flex-1 text-right text-muted-foreground/30">—</span>
								</div>
							))
						: Array.from(bids).map((bid, i) => (
								<div
									key={`bid-${i}`}
									className="flex py-1.5 px-4 text-xs font-mono hover:bg-muted/10 transition-colors"
								>
									<span className="flex-1 text-success/80 font-medium">{bid.price}</span>
									<span className="flex-1 text-right text-muted-foreground/80">{bid.qty}</span>
									<span className="flex-1 text-right text-muted-foreground/40">—</span>
								</div>
							))}
				</div>
			</div>
		</div>
	);
}
