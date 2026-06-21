import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import type { Market } from "@/types";
import { ASSET_NAMES, COIN_LOGOS } from "@/utils/misc";

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
			<div className="max-w-6xl mx-auto p-6 select-none animate-fade-in">
				<div className="mb-8">
					<h1 className="text-2xl font-bold tracking-tight">Spot Markets</h1>
					<p className="text-xs text-muted-foreground mt-1">
						Zero-fee sandbox paper trading playground on digital assets
					</p>
				</div>

				{loading ? (
					<div className="bg-card rounded-xl border border-border/40 shadow-xs overflow-hidden">
						<div className="p-5 border-b border-border/30 bg-muted/10 animate-pulse">
							<Skeleton className="h-4 w-32" />
						</div>
						<div className="p-5 space-y-4 animate-pulse">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between py-2 border-b border-border/10 last:border-0"
								>
									<div className="flex items-center gap-3">
										<Skeleton className="h-8 w-8 rounded-lg" />
										<div className="space-y-1.5">
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-3 w-10" />
										</div>
									</div>
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-8 w-24 rounded-md" />
								</div>
							))}
						</div>
					</div>
				) : (
					<>
						<div className="bg-card rounded-xl border border-border/40 shadow-xs overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse text-xs">
									<thead>
										<tr className="border-b border-border/30 bg-muted/15 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
											<th className="px-6 py-3.5 font-semibold">Asset Pair</th>
											<th className="px-6 py-3.5 font-semibold">Name</th>
											<th className="px-6 py-3.5 font-semibold">Market Type</th>
											<th className="px-6 py-3.5 font-semibold">Status</th>
											<th className="px-6 py-3.5 font-semibold text-right">Action</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/20">
										{markets.map((m) => {
											const [base, quote] = m.symbol.split("_") as [string, string];
											const assetName = ASSET_NAMES[base] || m.name || base;
											return (
												<tr key={m.id} className="hover:bg-muted/10 transition-colors">
													<td className="px-6 py-4.5">
														<div className="flex items-center gap-2.5">
															{COIN_LOGOS[base] ? (
																<img
																	src={COIN_LOGOS[base]}
																	alt={base}
																	className="h-8 w-8 object-contain shrink-0"
																/>
															) : (
																<div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs tracking-wider uppercase shrink-0">
																	{base[0]}
																</div>
															)}
															<div>
																<span className="font-bold text-foreground text-sm">
																	{base}/{quote}
																</span>
																<span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
																	{m.symbol}
																</span>
															</div>
														</div>
													</td>
													<td className="px-6 py-4.5 text-muted-foreground font-medium">
														{assetName}
													</td>
													<td className="px-6 py-4.5">
														<span className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[9px] font-bold uppercase tracking-wider border border-border/10">
															Spot
														</span>
													</td>
													<td className="px-6 py-4.5">
														<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-semibold">
															<span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
															Active
														</span>
													</td>
													<td className="px-6 py-4.5 text-right">
														<Link to={`/market/${m.symbol}`}>
															<Button
																size="sm"
																variant="ghost"
																className="hover:bg-primary hover:text-white transition-all text-xs font-semibold gap-1 px-3 cursor-pointer"
															>
																Trade <ArrowRight className="h-3.5 w-3.5" />
															</Button>
														</Link>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>

						<p className="text-center text-xs text-muted-foreground/40 mt-8">
							More spot markets coming soon. All trading assets are simulated sandbox balances.
						</p>
					</>
				)}
			</div>
		</AppLayout>
	);
}
