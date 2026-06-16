import { AppLayout } from "../components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { LogOut } from "lucide-react";

export function ProfilePage() {
	return (
		<AppLayout>
			<div className="mx-auto max-w-3xl px-6 py-10 select-none animate-fade-in">
				<div className="mb-8 flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
						<p className="text-xs text-muted-foreground mt-1">Manage sandbox balances and review recent trade execution activity.</p>
					</div>
					<Button variant="outline" size="sm" className="hover:text-destructive hover:border-destructive/35 cursor-pointer shrink-0">
						<LogOut className="mr-1.5 h-3.5 w-3.5" />
						Log out
					</Button>
				</div>

				<div className="space-y-5">
					<Card className="border-border/40 shadow-xs">
						<CardHeader className="pb-3">
							<CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User Account</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm flex items-center justify-between">
								<span className="text-muted-foreground">Username</span>
								<span className="font-mono font-medium text-foreground">—</span>
							</div>
						</CardContent>
					</Card>

					<Card className="border-border/40 shadow-xs">
						<CardHeader className="pb-3">
							<CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sandbox Asset Balances</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="divide-y divide-border/30">
								{[
									{ currency: "USD", name: "US Dollar", balance: "—" },
									{ currency: "BTC", name: "Bitcoin", balance: "—" },
									{ currency: "ETH", name: "Ethereum", balance: "—" },
								].map((item) => (
									<div key={item.currency} className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0">
										<div className="flex flex-col">
											<span className="font-semibold text-foreground">{item.currency}</span>
											<span className="text-[10px] text-muted-foreground font-medium">{item.name}</span>
										</div>
										<span className="font-mono text-foreground font-semibold">{item.balance}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card className="border-border/40 shadow-xs">
						<CardHeader className="pb-3">
							<CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Orders Log</CardTitle>
						</CardHeader>
						<CardContent className="py-2 flex flex-col items-center justify-center text-muted-foreground/60 gap-2">
							<p className="text-xs font-medium text-muted-foreground py-6">No orders logged in this sandbox session</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}
