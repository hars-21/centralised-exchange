import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function TradeForm() {
	const [side, setSide] = useState<"buy" | "sell">("buy");
	const [orderType, setOrderType] = useState<"limit" | "market">("limit");
	const [price, setPrice] = useState("");
	const [quantity, setQuantity] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<div className="flex h-full flex-col">
			<Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")} className="flex flex-1 flex-col">
				<div className="border-b px-3 py-2">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="buy" className="data-[state=active]:text-success text-xs">
							Buy
						</TabsTrigger>
						<TabsTrigger value="sell" className="data-[state=active]:text-destructive text-xs">
							Sell
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value={side} className="flex-1 px-3 py-3" forceMount>
					<form onSubmit={handleSubmit} className="space-y-3">
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setOrderType("limit")}
								className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
									orderType === "limit"
										? "bg-secondary text-foreground"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Limit
							</button>
							<button
								type="button"
								onClick={() => setOrderType("market")}
								className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
									orderType === "market"
										? "bg-secondary text-foreground"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Market
							</button>
						</div>

						{orderType === "limit" && (
							<div className="space-y-1.5">
								<Label htmlFor="price" className="text-xs text-muted-foreground">Price</Label>
								<Input
									id="price"
									type="number"
									step="any"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder="0.00"
									className="font-mono text-sm"
								/>
							</div>
						)}

						<div className="space-y-1.5">
							<Label htmlFor="quantity" className="text-xs text-muted-foreground">Quantity</Label>
							<Input
								id="quantity"
								type="number"
								step="any"
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								placeholder="0.00"
								className="font-mono text-sm"
							/>
						</div>

						{orderType === "limit" && price && quantity && (
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">Total</span>
								<span className="font-mono">
									{(parseFloat(price) * parseFloat(quantity) || 0).toFixed(2)} USD
								</span>
							</div>
						)}

						<Button
							type="submit"
							className={`w-full text-xs ${
								side === "buy"
									? "bg-success hover:bg-success/90 text-white"
									: "bg-destructive hover:bg-destructive/90 text-white"
							}`}
						>
							{side === "buy" ? "Place Buy Order" : "Place Sell Order"}
						</Button>
					</form>
				</TabsContent>
			</Tabs>
		</div>
	);
}
