"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Componente que usa useSearchParams
function LoginContent() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const authenticatedUser = await login(email, password);

			if (authenticatedUser) {
				toast({
					title: "¡Inicio de sesión exitoso!",
					description: "Bienvenido al sistema.",
				});

				// Redirigiendo a /kanban con recarga completa
				setTimeout(() => {
					window.location.href = "/projects";
				}, 100);
			} else {
				toast({
					variant: "destructive",
					title: "Error de autenticación",
					description: "Credenciales incorrectas. Inténtalo de nuevo.",
				});
				setIsLoading(false);
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Ocurrió un error durante el inicio de sesión.",
			});
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Iniciar sesión</CardTitle>
				<CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent>
					<div className="grid w-full items-center gap-4">
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="email">Correo electrónico</Label>
							<Input id="email" type="email" placeholder="tu@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
						</div>
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="password">Contraseña</Label>
							<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline" type="button" onClick={() => router.back()}>
						Cancelar
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Cargando..." : "Iniciar sesión"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

// Componente principal que envuelve con Suspense
export default function LoginPage() {
	return (
		<div className="flex h-screen items-center justify-center">
			<Suspense fallback={<div>Cargando...</div>}>
				<LoginContent />
			</Suspense>
		</div>
	);
}
