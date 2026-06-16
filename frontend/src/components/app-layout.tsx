import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/theme-provider";

export function AppLayout({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const { theme, toggleTheme } = useTheme();

	const isActive = (path: string) =>
		location.pathname.startsWith(path) ? "text-foreground" : "text-muted-foreground";

	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<header className="border-b bg-background">
				<div className="mx-auto flex h-12 max-w-350 items-center justify-between px-4">
					<div className="flex items-center gap-6">
						<Link to="/" className="text-lg font-semibold tracking-tight">
							Atlas
						</Link>
						<nav className="flex items-center gap-5 text-sm">
							<Link
								to="/market/BTC_USD"
								className={`transition-colors hover:text-foreground ${isActive("/market")}`}
							>
								Market
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle Theme">
							{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
						</Button>
						<Link to="/profile">
							<Button
								variant="ghost"
								size="icon-sm"
								className={location.pathname === "/profile" ? "text-foreground bg-accent/30" : ""}
							>
								<User className="h-4 w-4" />
							</Button>
						</Link>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-muted-foreground hover:text-destructive"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</header>
			<main>{children}</main>
		</div>
	);
}
