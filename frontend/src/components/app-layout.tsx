import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { User, LogOut, Sun, Moon, TrendingUp, Activity } from "lucide-react";
import { useTheme } from "../lib/theme-provider";
import { useAuth } from "@/context/AuthContext";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const { user, setUser } = useAuth();

	const isActive = (path: string) =>
		location.pathname.startsWith(path) ? "text-foreground" : "text-muted-foreground";

	const handleLogout = () => {
		setUser(null);
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<header className="border-b bg-background/85 backdrop-blur-md sticky top-0 z-50">
				<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
					<div className="flex items-center gap-8">
						<Link
							to="/"
							className="text-lg font-semibold tracking-tight hover:text-primary transition-colors"
						>
							Atlas
						</Link>
						<nav className="flex items-center gap-6 text-sm">
							<Link
								to="/markets"
								className={`transition-colors hover:text-foreground font-medium ${isActive("/markets")}`}
							>
								Markets
							</Link>
							<Link
								to="/market/BTC_USD"
								className={`transition-colors hover:text-foreground font-medium ${isActive("/market")}`}
							>
								Trading
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle Theme">
							{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
						</Button>

						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="gap-2 px-2.5 cursor-pointer">
										<div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs uppercase">
											{user.username[0]}
										</div>
										<span className="max-w-20 truncate text-xs font-medium">{user.username}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56 border-border/40">
									<DropdownMenuLabel className="flex flex-col">
										<span className="text-[10px] text-muted-foreground font-normal uppercase tracking-wider">
											Signed in as
										</span>
										<span className="font-semibold text-sm truncate mt-0.5">{user.username}</span>
									</DropdownMenuLabel>
									<DropdownMenuSeparator className="border-border/30" />
									<DropdownMenuGroup>
										<DropdownMenuItem asChild>
											<Link to="/profile" className="w-full flex items-center cursor-pointer">
												<User className="mr-2 h-4 w-4 text-muted-foreground" />
												<span>Profile & Balances</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link to="/markets" className="w-full flex items-center cursor-pointer">
												<TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
												<span>Spot Markets</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												to="/market/BTC_USD"
												className="w-full flex items-center cursor-pointer"
											>
												<Activity className="mr-2 h-4 w-4 text-muted-foreground" />
												<span>Trading Console</span>
											</Link>
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator className="border-border/30" />
									<DropdownMenuItem
										onClick={handleLogout}
										variant="destructive"
										className="cursor-pointer text-destructive"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className="flex gap-2">
								<Link to="/login">
									<Button variant="ghost" size="sm">
										Log in
									</Button>
								</Link>
								<Link to="/signup">
									<Button size="sm">Sign up</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</header>
			<main>{children}</main>
		</div>
	);
}
