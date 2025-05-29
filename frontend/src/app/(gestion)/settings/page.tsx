"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/settings/user-settings";
import GeneralSettings from "@/components/settings/general-settings";
import TagsSettings from "@/components/settings/tags-settings";
import AreasSettings from "@/components/settings/areas-settings";

export default function SettingsPage() {
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState("general");

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
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="users">Usuarios y Roles</TabsTrigger>
					<TabsTrigger value="tags">Categorías de Proyectos</TabsTrigger>
					<TabsTrigger value="areas">Áreas</TabsTrigger>
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
