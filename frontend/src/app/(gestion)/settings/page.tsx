"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/settings/usuarios";
import GeneralSettings from "@/components/settings/general";
import TagsSettings from "@/components/settings/categorias";
import AreasSettings from "@/components/settings/areas";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/types/enums";

export default function SettingsPage() {
	const { user } = useAuth();
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState("tags");

	useEffect(() => {
		const tab = searchParams.get("tab");
		if (tab && ["general", "users", "tags", "notifications"].includes(tab)) {
			setActiveTab(tab);
		}
	}, [searchParams]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Configuración</h1>
				<p className="text-muted-foreground">Administra la configuración y preferencias de la aplicación</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList>
					{user?.role === Role.ADMIN && <TabsTrigger value="general">General</TabsTrigger>}
					{user?.role === Role.ADMIN && <TabsTrigger value="users">Usuarios y Roles</TabsTrigger>}
					{<TabsTrigger value="tags">Categorías de Proyectos</TabsTrigger>}
					{user?.role === Role.ADMIN && <TabsTrigger value="areas">Áreas</TabsTrigger>}
				</TabsList>

				<TabsContent value="general" className="space-y-4">
					<GeneralSettings />
				</TabsContent>

				<TabsContent value="users" className="space-y-4">
					<UserManagement />
				</TabsContent>

				<TabsContent value="tags" className="space-y-4">
					<TagsSettings />
				</TabsContent>

				<TabsContent value="areas" className="space-y-4">
					<AreasSettings />
				</TabsContent>
			</Tabs>
		</div>
	);
}
