"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

	return (
		<header className="border-b bg-background p-4 flex items-center justify-between">
			<div className="flex items-center">
				<h1 className="text-xl font-semibold hidden md:block">
					{pathname === "/" && "Dashboard"}
					{pathname === "/projects" && "Proyectos"}
					{pathname === "/kanban" && "Kanban General"}
					{pathname === "/timeline" && "Proyectos por Etapas"}
					{pathname === "/settings" && "Configuración"}
					{pathname.startsWith("/projects/") && "Detalles del Proyecto"}
				</h1>
			</div>

			<div className="flex items-center space-x-2">
				{isSearchOpen ? (
					<div className="relative w-64">
						<Input type="text" placeholder="Search..." className="pr-8" autoFocus onBlur={() => setIsSearchOpen(false)} />
						<Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
					</div>
				) : (
					<Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
						<Search className="h-5 w-5" />
					</Button>
				)}
				<Button variant="ghost" size="icon">
					<Bell className="h-5 w-5" />
				</Button>

				{user && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarFallback>
										{user.name.charAt(0)}
										{user.lastname.charAt(0)}
									</AvatarFallback>
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
