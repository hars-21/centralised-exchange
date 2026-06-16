import { AppLayout } from "../components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { LogOut } from "lucide-react";

export function ProfilePage() {
	return (
		<AppLayout>
			<div className="mx-auto max-w-3xl px-6 py-10">
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-2xl font-bold tracking-tight">Profile</h1>
					<Button variant="outline" size="sm">
						<LogOut className="mr-1.5 h-3.5 w-3.5" />
						Log out
					</Button>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">
								<span className="text-muted-foreground">Username: </span>
								<span className="font-mono">—</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">Balances</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{[
									{ currency: "USD", balance: "—" },
									{ currency: "BTC", balance: "—" },
									{ currency: "ETH", balance: "—" },
								].map((item) => (
									<div key={item.currency} className="flex items-center justify-between text-sm">
										<span className="font-medium">{item.currency}</span>
										<span className="font-mono text-muted-foreground">{item.balance}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">Recent Orders</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">No orders yet.</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}
