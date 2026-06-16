import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketHeaderProps {
	market: string;
}

export function MarketHeader({ market }: MarketHeaderProps) {
	const [base, quote] = market.split("_");

	return (
		<div className="flex items-center gap-6 border-b px-4 py-3">
			<div>
				<h1 className="text-sm font-semibold">
					{base}/{quote}
				</h1>
			</div>
			<div className="flex items-center gap-6 text-xs">
				<div>
					<span className="text-muted-foreground">Price </span>
					<span className="font-mono">—</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-muted-foreground">24h </span>
					<span className="font-mono text-muted-foreground">—</span>
				</div>
				<div>
					<span className="text-muted-foreground">High </span>
					<span className="font-mono">—</span>
				</div>
				<div>
					<span className="text-muted-foreground">Low </span>
					<span className="font-mono">—</span>
				</div>
			</div>
		</div>
	);
}
