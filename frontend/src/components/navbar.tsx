import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../lib/theme-provider";

export function Navbar() {
	const [open, setOpen] = useState(false);
	const { theme, toggleTheme } = useTheme();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
				<Link to="/" className="text-lg font-semibold tracking-tight">
					Atlas
				</Link>

				<nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
					<a href="#features" className="transition-colors hover:text-foreground">
						Features
					</a>
					<Link to="/market/BTC_USD" className="transition-colors hover:text-foreground">
						Market
					</Link>
				</nav>

				<div className="hidden items-center gap-3 sm:flex">
					<Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle Theme" className="mr-1">
						{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					</Button>
					<Link to="/login">
						<Button variant="ghost" size="sm">Log in</Button>
					</Link>
					<Link to="/signup">
						<Button size="sm">Sign up</Button>
					</Link>
				</div>

				<button
					className="sm:hidden text-muted-foreground"
					onClick={() => setOpen(!open)}
				>
					{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
				</button>
			</div>

			{open && (
				<div className="border-t bg-background px-6 py-4 sm:hidden">
					<nav className="flex flex-col gap-3 text-sm">
						<a href="#features" className="text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Features</a>
						<Link to="/market/BTC_USD" className="text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Market</Link>
						<div className="flex items-center justify-between gap-3 pt-2 border-t">
							<span className="text-xs text-muted-foreground">Theme</span>
							<Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle Theme">
								{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</Button>
						</div>
						<div className="flex gap-3 pt-2 border-t">
							<Link to="/login" className="flex-1"><Button variant="ghost" size="sm" className="w-full">Log in</Button></Link>
							<Link to="/signup" className="flex-1"><Button size="sm" className="w-full">Sign up</Button></Link>
						</div>
					</nav>
				</div>
			)}
		</header>
	);
}

export default Navbar;
