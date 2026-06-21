import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { Market } from "@/types";

export function MarketsPage() {
	const [markets, setMarkets] = useState<Market[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("http://localhost:8000/markets")
			.then((r) => r.json())
			.then((res) => setMarkets(res.data ?? []))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	return (
		<AppLayout>
			<div className="max-w-350 mx-auto p-6">
				<div className="mb-8">
					<h1 className="text-2xl font-semibold tracking-tight">Markets</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Trade perpetual futures with up to 10x leverage on supported assets
					</p>
				</div>

				{loading ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="bg-card rounded-xl border border-border/40 shadow-xs p-5 space-y-4">
								<Skeleton className="h-5 w-28" />
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-9 w-full rounded-lg" />
							</div>
						))}
					</div>
				) : (
					<>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{markets.map((m) => {
								const [base, quote] = m.symbol.split("_");
								return (
									<div
										key={m.id}
										className="bg-card rounded-xl border border-border/40 shadow-xs p-5 hover:shadow-md hover:border-border/60 transition-all"
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2.5">
												<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
													<TrendingUp className="h-4 w-4 text-primary" />
												</div>
												<div>
													<div className="font-semibold text-sm">
														{base}/{quote}
													</div>
													<div className="text-[10px] text-muted-foreground font-mono tracking-wider">
														{m.symbol}
													</div>
												</div>
											</div>
											<div className="text-right">
												<div className="text-xs text-muted-foreground">Perpetual</div>
												<div className="text-[10px] text-muted-foreground/50">10x max</div>
											</div>
										</div>

										<Link to={`/market/${m.symbol}`}>
											<Button size="sm" className="w-full gap-1.5">
												Trade <ArrowRight className="h-3 w-3" />
											</Button>
										</Link>
									</div>
								);
							})}
						</div>

						<p className="text-center text-xs text-muted-foreground/50 mt-8">
							More markets coming soon. Trade responsibly — all assets are held in custody.
						</p>
					</>
				)}
			</div>
		</AppLayout>
	);
}
