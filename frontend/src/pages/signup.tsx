import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "@/context/AuthContext";

export function SignupPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { setUser } = useAuth();
	const navigate = useNavigate();

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch("http://localhost:8000/signup", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			setUser({ id: data.id, username: data.username });
			navigate("/");
		} catch (e) {
			console.error(e);
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
						<Button type="submit" className="w-full">
							Create Account
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
