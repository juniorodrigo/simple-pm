"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, KanbanSquare, GanttChartSquare, FolderKanban, Settings, Menu, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
	const pathname = usePathname();
	const isMobile = useMobile();
	const [isOpen, setIsOpen] = useState(false);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const navigation = [
		{
			name: "Dashboard",
			href: "/",
			icon: LayoutDashboard,
			current: pathname === "/",
		},
		{
			name: "Projects",
			href: "/projects",
			icon: FolderKanban,
			current: pathname === "/projects" || pathname.startsWith("/projects/"),
		},
		{
			name: "Kanban",
			href: "/kanban",
			icon: KanbanSquare,
			current: pathname === "/kanban",
		},
		{
			name: "Gantt",
			href: "/gantt",
			icon: GanttChartSquare,
			current: pathname === "/gantt",
		},
		{
			name: "Settings",
			href: "/settings",
			icon: Settings,
			current: pathname === "/settings",
		},
	];

	const sidebarClasses = cn("bg-background h-full border-r flex-col z-30", isMobile ? "fixed transition-all duration-300 ease-in-out w-64" : "w-64 hidden md:flex");

	return (
		<>
			{isMobile && (
				<Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 md:hidden" onClick={toggleSidebar}>
					{isOpen ? <X /> : <Menu />}
				</Button>
			)}

			<div className={cn(sidebarClasses, isMobile && (isOpen ? "left-0" : "-left-64"))}>
				<div className="p-4 border-b">
					<h2 className="text-xl font-bold">Madrid Inmobiliaria</h2>
				</div>
				<nav className="flex-1 p-4 space-y-1">
					{navigation.map((item) => (
						<Link key={item.name} href={item.href} onClick={() => isMobile && setIsOpen(false)}>
							<Button
								variant={item.current ? "secondary" : "ghost"}
								className={cn("w-full justify-start", item.current ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground")}
							>
								<item.icon className="mr-2 h-5 w-5" />
								{item.name}
							</Button>
						</Link>
					))}
				</nav>
			</div>
		</>
	);
}
