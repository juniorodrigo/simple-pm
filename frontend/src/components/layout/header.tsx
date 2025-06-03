"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

export default function Header() {
	const { user, logout } = useAuth();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const pathname = usePathname();

	const handleLogout = () => {
		logout();
	};

	// Obtener las iniciales del usuario
	const getUserInitials = () => {
		if (!user) return "";
		return `${user.name.charAt(0)}${user.lastname.charAt(0)}`;
	};

	return (
		<header className="border-b bg-background py-2 px-4 flex items-center justify-between">
			<div className="flex items-center">
				{/* <h1 className="text-xl font-semibold hidden md:block">
					{pathname === "/" && "Dashboard"}
					{pathname === "/projects" && "Proyectos"}
					{pathname === "/kanban" && "Kanban General"}
					{pathname === "/timeline" && "Proyectos por Etapas"}
					{pathname === "/settings" && "Configuración"}
					{pathname.startsWith("/projects/") && "Detalles del Proyecto"}
				</h1> */}
			</div>

			<div className="">
				{user && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									{/* Eliminamos la referencia a profileImage que no existe */}
									<AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">
										{user.name} {user.lastname}
									</p>
									<p className="text-xs leading-none text-muted-foreground">{user.email}</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-xs capitalize">Rol: {user.role}</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</header>
	);
}
