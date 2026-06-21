import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { refreshUser } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			toast.error("Please enter both username and password");
			return;
		}

		setIsLoading(true);

		try {
			await api.signin(username, password);
			await refreshUser();
			toast.success("Successfully logged in");
			navigate("/");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-center text-lg">Log in to Atlas</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Enter your username"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Logging in..." : "Log in"}
						</Button>
					</form>
					<p className="mt-4 text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link to="/signup" className="text-primary hover:underline">
							Sign up
						</Link>
					</p>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
