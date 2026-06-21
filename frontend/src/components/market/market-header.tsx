import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { Market } from "@/types";

interface MarketHeaderProps {
	market: string;
}

export function MarketHeader({ market }: MarketHeaderProps) {
	const navigate = useNavigate();
	const [markets, setMarkets] = useState<Market[]>([]);
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [base, quote] = market.split("_");

	useEffect(() => {
		fetch("http://localhost:8000/markets")
			.then((r) => r.json())
			.then((res) => setMarkets(res.data ?? []))
			.catch(() => {});
	}, []);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div className="flex flex-wrap items-center justify-between bg-card rounded-xl border border-border/40 px-5 py-3 shadow-xs gap-4 shrink-0">
			<div className="flex items-center gap-4">
				<div className="relative" ref={dropdownRef}>
					<button
						onClick={() => setOpen(!open)}
						className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary tracking-wide hover:bg-primary/15 transition-colors"
					>
						{base}/{quote}
						<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
					</button>

					{open && (
						<div className="absolute top-full left-0 mt-1.5 w-48 bg-popover border border-border/60 rounded-xl shadow-xl z-50 overflow-hidden py-1">
							<div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
								Markets
							</div>
							{markets.map((m) => {
								const [b, q] = m.symbol.split("_");
								return (
									<button
										key={m.id}
										onClick={() => {
											navigate(`/market/${m.symbol}`);
											setOpen(false);
										}}
										className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted/20 transition-colors ${
											m.symbol === market
												? "bg-primary/10 text-primary font-semibold"
												: "text-foreground/80"
										}`}
									>
										<span>
											{b}
											<span className="text-muted-foreground mx-1">/</span>
											<span className="text-muted-foreground">{q}</span>
										</span>
										{m.symbol === market && (
											<span className="h-1.5 w-1.5 rounded-full bg-primary" />
										)}
									</button>
								);
							})}
						</div>
					)}
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
