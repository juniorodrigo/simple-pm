"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OrganizationService } from "@/services/organization.service";
import { Organization } from "@/types/organization.type";

export default function GeneralSettings() {
	const { toast } = useToast();
	const [settings, setSettings] = useState<Organization>({
		organizationName: "",
		organizationLogo: "",
		defaultDateFormat: "DD/MM/AAAA",
		defaultTimeFormat: "12h",
		enableDarkMode: true,
		enableNotifications: true,
		defaultLanguage: "es",
	});

	useEffect(() => {
		const loadOrganizationInfo = async () => {
			const response = await OrganizationService.getOrganizationInfo();
			if (response.success && response.data) {
				setSettings((prevSettings) => ({
					...prevSettings,
					...response.data,
				}));
			}
		};
		loadOrganizationInfo();
	}, []);

	const handleSaveSettings = async () => {
		const response = await OrganizationService.updateOrganizationInfo(settings);
		if (response.success) {
			toast({
				title: "Configuración guardada",
				description: "La configuración se ha guardado exitosamente.",
			});
		} else {
			toast({
				title: "Error",
				description: "No se pudo guardar la configuración.",
				variant: "destructive",
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configuración General</CardTitle>
				<CardDescription>Administra configuración y preferencias generales</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="organizationName">Nombre de la Organización</Label>
					<Input id="organizationName" value={settings.organizationName} onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })} />
				</div>

				{/* Placeholder para futuros campos */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label>Campos adicionales</Label>
						<p className="text-sm text-muted-foreground">Placeholders para futura implementación</p>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button onClick={handleSaveSettings}>Guardar Configuración</Button>
			</CardFooter>
		</Card>
	);
}
