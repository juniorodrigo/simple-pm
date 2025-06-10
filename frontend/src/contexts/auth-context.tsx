"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { User } from "@/data/users";
import HOST from "@/lib/host";

type AuthenticatedUser = Omit<User, "password">;

interface AuthContextType {
	user: AuthenticatedUser | null;
	login: (email: string, password: string) => Promise<AuthenticatedUser | null>;
	logout: () => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthenticatedUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		// Verificar si hay un usuario en cookies al cargar
		const userJson = getCookie("user");

		if (userJson) {
			try {
				const userData = JSON.parse(String(userJson)) as AuthenticatedUser;
				setUser(userData);
			} catch (error) {
				console.error("Error parsing user data from cookie:", error);
				deleteCookie("user");
			}
		}

		setIsLoading(false);
	}, []);

	const login = async (email: string, password: string): Promise<AuthenticatedUser | null> => {
		console.log("trying to login", email, password);

		try {
			const response = await fetch(`${HOST}/config/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				console.error("Login failed:", response.status, response.statusText);
				return null;
			}

			const { data } = await response.json();
			console.log("user found", data);

			const { password: _, ...authenticatedUser } = data;

			// Actualizar el estado de forma síncrona
			setUser(authenticatedUser);

			// Guardar en cookie
			setCookie("user", JSON.stringify(authenticatedUser), {
				maxAge: 60 * 60 * 24, // 1 día
			});

			return authenticatedUser;
		} catch (error) {
			console.error("Error during login:", error);
			return null;
		}
	};

	const logout = () => {
		setUser(null);
		deleteCookie("user");
		router.push("/login");
	};

	return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
