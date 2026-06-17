import type { UserBalance } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
	id: string;
	username: string;
	balance: UserBalance;
} | null;

type AuthContext = {
	user: User;
	setUser: (user: User) => void;
	loading: boolean;
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getMe = async () => {
			try {
				setLoading(true);
				const res = await fetch("http://localhost:8000/me", {
					credentials: "include",
				});

				if (!res.ok) {
					setUser(null);
					return;
				}

				const data = await res.json();
				const { userId, username, balance } = data;
				setUser({
					id: userId,
					username,
					balance,
				});
			} catch (e) {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		getMe();
	}, []);

	return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be inside AuthProvider");

	return context;
};
