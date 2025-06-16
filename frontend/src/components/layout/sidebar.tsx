"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KanbanSquare, Settings, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/types/enums";

export default function Sidebar() {
	const pathname = usePathname();

	const isMobile = useMobile();
	const { user, logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(true);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const handleLogout = () => {
		logout();
	};

	// Obtener las iniciales del usuario
	const getUserInitials = () => {
		if (!user) return "";
		return `${user.name.charAt(0)}${user.lastname.charAt(0)}`;
	};

	const navigation = [
		{
			name: "Proyectos",
			href: "/proyectos",
			icon: KanbanSquare,
			current: pathname === "/proyectos" || pathname.startsWith("/proyectos/"),
		},
	];

	if (user?.role != Role.VIEWER) {
		navigation.push({
			name: "Configuración",
			href: "/configuracion",
			icon: Settings,
			current: pathname === "/configuracion",
		});
	}

	const sidebarClasses = cn("bg-background h-full border-r flex-col z-30 transition-all duration-300 ease-in-out", isMobile ? "fixed" : "hidden md:flex", isCollapsed && !isMobile ? "w-20" : "w-64");

	return (
		<TooltipProvider>
			{isMobile && (
				<Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 md:hidden" onClick={toggleSidebar}>
					{isOpen ? <X /> : <Menu />}
				</Button>
			)}

			<div className={cn(sidebarClasses, isMobile && (isOpen ? "left-0" : "-left-64"))}>
				<div className="p-4 border-b">
					{isCollapsed && !isMobile ? (
						<div className="flex items-center justify-between">
							<div className="flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-md overflow-hidden">
								<Image src="/logo.jpeg" alt="Logo" width={32} height={32} className="object-contain" />
							</div>
							<Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-6 w-6">
								<ChevronRight size={14} />
							</Button>
						</div>
					) : (
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-4">
								<div className="flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-md overflow-hidden">
									<Image src="/logo.jpeg" alt="Logo" width={32} height={32} className="object-contain" />
								</div>
								<h2 className="text-sm font-bold">Gestión de Proyectos</h2>
							</div>
							{!isMobile && (
								<Button variant="ghost" size="icon" onClick={toggleCollapse}>
									<ChevronLeft size={20} />
								</Button>
							)}
						</div>
					)}
				</div>

				<nav className="flex-1 p-4 space-y-3 overflow-y-auto">
					{navigation.map((item) => (
						<Link key={item.name} href={item.href} onClick={() => isMobile && setIsOpen(false)} className="block my-2">
							{isCollapsed && !isMobile ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant={item.current ? "secondary" : "ghost"}
											className={cn("w-full justify-center px-2 py-5", item.current ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground")}
										>
											<item.icon className="h-5 w-5" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="right" className="ml-2">
										<p>{item.name}</p>
									</TooltipContent>
								</Tooltip>
							) : (
								<Button
									variant={item.current ? "secondary" : "ghost"}
									className={cn("w-full justify-start py-5", item.current ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground")}
								>
									<item.icon className="h-5 w-5 mr-2" />
									{item.name}
								</Button>
							)}
						</Link>
					))}
				</nav>
				<div className="p-3 border-t text-center">
					{!isCollapsed && <p className={cn("text-xs text-muted-foreground italic", isCollapsed && !isMobile ? "opacity-0" : "opacity-70")}>Plataforma de gestión de proyectos de Madrid Inmobiliaria</p>}
				</div>

				{/* Avatar y información del usuario */}
				{user && (
					<div className="p-2 border-t">
						{!isCollapsed || isMobile ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="w-full justify-start p-1 h-auto">
										<div className="flex items-center gap-2 min-w-0 w-full">
											<Avatar className="h-8 w-8 flex-shrink-0">
												<AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
											</Avatar>
											<div className="flex flex-col items-start min-w-0 flex-1">
												<p className="text-sm font-medium leading-none truncate w-full">
													{user.name} {user.lastname}
												</p>
												<p className="text-xs leading-none text-muted-foreground mt-1 truncate w-full">{user.email}</p>
											</div>
										</div>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="start" forceMount>
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
						) : (
							<div className="flex justify-center py-1">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
											<Avatar className="h-8 w-8">
												<AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56" align="start" forceMount>
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
							</div>
						)}
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}
