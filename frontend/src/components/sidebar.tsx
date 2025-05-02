"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, KanbanSquare, GanttChartSquare, FolderKanban, Settings, Menu, X, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
	const pathname = usePathname();
	const isMobile = useMobile();
	const [isOpen, setIsOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const navigation = [
		// {
		// 	name: "Dashboard",
		// 	href: "/",
		// 	icon: LayoutDashboard,
		// 	current: pathname === "/",
		// },
		// {
		// 	name: "Proyectos",
		// 	href: "/projects",
		// 	icon: FolderKanban,
		// 	current: pathname === "/projects" || pathname.startsWith("/projects/"),
		// },
		{
			name: "Proyectos",
			href: "/kanban",
			icon: KanbanSquare,
			current: pathname === "/kanban",
		},
		// {
		// 	name: "Línea de Tiempo",
		// 	href: "/timeline",
		// 	icon: GanttChartSquare,
		// 	current: pathname === "/gantt",
		// },
		{
			name: "Configuración",
			href: "/settings",
			icon: Settings,
			current: pathname === "/settings",
		},
	];

	const sidebarClasses = cn("bg-background h-full border-r flex-col z-30 transition-all duration-300 ease-in-out", isMobile ? "fixed" : "hidden md:flex", isCollapsed && !isMobile ? "w-20" : "w-64");

	return (
		<>
			{isMobile && (
				<Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 md:hidden" onClick={toggleSidebar}>
					{isOpen ? <X /> : <Menu />}
				</Button>
			)}

			<div className={cn(sidebarClasses, isMobile && (isOpen ? "left-0" : "-left-64"))}>
				<div className="p-4 border-b flex justify-between items-center">
					{(!isCollapsed || isMobile) && (
						<div className="flex items-center gap-4">
							<div className="flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-md bg-blue-900">
								<Lightbulb className="h-5 w-5 text-amber-400" />
							</div>
							<h2 className="text-xl font-bold">PMI</h2>
						</div>
					)}
					{!isMobile && (
						<Button variant="ghost" size="icon" onClick={toggleCollapse} className="ml-auto">
							{isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
						</Button>
					)}
				</div>
				<nav className="flex-1 p-4 space-y-3 overflow-y-auto">
					{navigation.map((item) => (
						<Link key={item.name} href={item.href} onClick={() => isMobile && setIsOpen(false)} className="block my-2">
							<Button
								variant={item.current ? "secondary" : "ghost"}
								className={cn(
									"w-full justify-start py-5",
									item.current ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
									isCollapsed && !isMobile && "justify-center px-2"
								)}
								title={isCollapsed && !isMobile ? item.name : undefined}
							>
								<item.icon className={cn("h-5 w-5", isCollapsed && !isMobile ? "mr-0" : "mr-2")} />
								{(!isCollapsed || isMobile) && item.name}
							</Button>
						</Link>
					))}
				</nav>
				<div className="p-3 border-t text-center">
					{!isCollapsed && <p className={cn("text-xs text-muted-foreground italic", isCollapsed && !isMobile ? "opacity-0" : "opacity-70")}>plataforma de gestión de proyectos de Madrid Inmobiliaria</p>}
				</div>
			</div>
		</>
	);
}
