import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function SignupPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { refreshUser } = useAuth();
	const navigate = useNavigate();

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			toast.error("Please enter both username and password");
			return;
		}

		setIsLoading(true);

		try {
			await api.signup(username, password);
			await refreshUser();
			toast.success("Account created successfully");
			navigate("/");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Signup failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-center text-lg">Create your account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSignup} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Choose a username"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Create a password"
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating account..." : "Create Account"}
						</Button>
					</form>
					<p className="mt-4 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link to="/login" className="text-primary hover:underline">
							Log in
						</Link>
					</p>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
