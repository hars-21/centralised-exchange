import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "../ui/skeleton";

export function TradeForm({ marketId }: { marketId: string }) {
	const [side, setSide] = useState<"BUY" | "SELL">("BUY");
	const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
	const [price, setPrice] = useState("");
	const [quantity, setQuantity] = useState("");
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex h-full flex-col select-none p-5 space-y-6 animate-pulse">
				<Skeleton className="h-9 w-full" />
				<div className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-3 w-12" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-3.5 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
				<Skeleton className="h-10 w-full mt-auto" />
			</div>
		);
	}

	const handlePlaceOrder = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch("http://localhost:8000/orders", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					side,
					type: orderType,
					symbol: marketId,
					price: Number(price),
					qty: Number(quantity),
				}),
			});

			const data = await res.json();
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className="flex h-full flex-col select-none">
			<Tabs
				value={side}
				onValueChange={(v) => setSide(v as "BUY" | "SELL")}
				className="flex flex-1 flex-col"
			>
				<div className="border-b border-border/40 p-4 bg-muted/15">
					<TabsList className="grid w-full grid-cols-2 p-1 bg-muted/30 border border-border/10">
						<TabsTrigger
							value="BUY"
							className="data-[state=active]:bg-success data-[state=active]:text-white text-xs font-semibold transition-all py-1.5"
						>
							Buy
						</TabsTrigger>
						<TabsTrigger
							value="SELL"
							className="data-[state=active]:bg-destructive data-[state=active]:text-white text-xs font-semibold transition-all py-1.5"
						>
							Sell
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value={side} className="flex-1 p-5 flex flex-col justify-between" forceMount>
					<form
						onSubmit={handlePlaceOrder}
						className="space-y-5 flex-1 flex flex-col justify-between"
					>
						<div className="space-y-4">
							<div className="flex justify-between items-center text-xs">
								<span className="text-muted-foreground">Available Balance</span>
								<span className="font-mono text-foreground font-semibold">
									{side === "BUY"
										? `${user?.balance.INR?.available ?? 0} USD`
										: `${user?.balance[marketId]?.available ?? 0} ${marketId}`}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/20">
								<button
									type="button"
									onClick={() => setOrderType("LIMIT")}
									className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
										orderType === "LIMIT"
											? "bg-card text-foreground shadow-xs border border-border/10"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Limit
								</button>
								<button
									type="button"
									onClick={() => setOrderType("MARKET")}
									className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
										orderType === "MARKET"
											? "bg-card text-foreground shadow-xs border border-border/10"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Market
								</button>
							</div>

							{orderType === "LIMIT" ? (
								<div className="space-y-1.5">
									<Label htmlFor="price" className="text-xs font-medium text-muted-foreground">
										Price
									</Label>
									<div className="relative">
										<Input
											id="price"
											type="number"
											step="any"
											value={price}
											onChange={(e) => setPrice(e.target.value)}
											placeholder="0.00"
											className="font-mono pr-12 text-sm h-10"
										/>
										<div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/80 tracking-wider">
											USD
										</div>
									</div>
								</div>
							) : (
								<div className="space-y-1.5">
									<Label
										htmlFor="price-market"
										className="text-xs font-medium text-muted-foreground"
									>
										Price
									</Label>
									<div className="relative">
										<Input
											id="price-market"
											type="text"
											disabled
											value="Market Price"
											className="font-sans text-sm h-10 bg-muted/40 border-dashed text-muted-foreground/80"
										/>
									</div>
								</div>
							)}

							<div className="space-y-1.5">
								<Label htmlFor="quantity" className="text-xs font-medium text-muted-foreground">
									Quantity
								</Label>
								<div className="relative">
									<Input
										id="quantity"
										type="number"
										step="any"
										value={quantity}
										onChange={(e) => setQuantity(e.target.value)}
										placeholder="0.00"
										className="font-mono pr-12 text-sm h-10"
									/>
									<div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/80 tracking-wider">
										BTC
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4 pt-4 border-t border-border/40">
							{orderType === "LIMIT" && price && quantity && (
								<div className="flex justify-between items-center text-xs">
									<span className="text-muted-foreground">Est. Total</span>
									<span className="font-mono font-bold text-foreground">
										{(parseFloat(price) * parseFloat(quantity) || 0).toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}{" "}
										USD
									</span>
								</div>
							)}

							<Button
								type="submit"
								className={`w-full py-5 text-xs font-semibold uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
									side === "BUY"
										? "bg-success hover:bg-success/90 text-white shadow-sm shadow-success/15"
										: "bg-destructive hover:bg-destructive/90 text-white shadow-sm shadow-destructive/15"
								}`}
							>
								{side === "BUY" ? "Place Buy Order" : "Place Sell Order"}
							</Button>
						</div>
					</form>
				</TabsContent>
			</Tabs>
		</div>
	);
}
