import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/auth-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function SignupPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<AuthLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-center text-lg">Create your account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
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
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm Password</Label>
							<Input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm your password"
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
