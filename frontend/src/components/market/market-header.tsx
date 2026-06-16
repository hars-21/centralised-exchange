interface MarketHeaderProps {
	market: string;
}

export function MarketHeader({ market }: MarketHeaderProps) {
	const [base, quote] = market.split("_");

	return (
		<div className="flex flex-wrap items-center justify-between bg-card rounded-xl border border-border/40 px-5 py-3 shadow-xs gap-4 shrink-0">
			<div className="flex items-center gap-4">
				<div className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary tracking-wide">
					{base}/{quote}
				</div>
				<div className="hidden h-4 w-px bg-border/60 sm:block" />
				<div className="flex items-center gap-5 text-xs">
					<div>
						<span className="text-muted-foreground">Mark Price</span>
						<span className="font-mono font-medium text-foreground ml-1.5">—</span>
					</div>
					<div>
						<span className="text-muted-foreground">Index Price</span>
						<span className="font-mono font-medium text-foreground ml-1.5">—</span>
					</div>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
				<div>
					<span className="text-muted-foreground">24h Change</span>
					<span className="font-mono font-medium text-foreground ml-1.5">—</span>
				</div>
				<div>
					<span className="text-muted-foreground">24h High</span>
					<span className="font-mono font-medium text-foreground ml-1.5">—</span>
				</div>
				<div>
					<span className="text-muted-foreground">24h Low</span>
					<span className="font-mono font-medium text-foreground ml-1.5">—</span>
				</div>
				<div className="hidden sm:block">
					<span className="text-muted-foreground">24h Volume</span>
					<span className="font-mono font-medium text-foreground ml-1.5">—</span>
				</div>
			</div>
		</div>
	);
}
