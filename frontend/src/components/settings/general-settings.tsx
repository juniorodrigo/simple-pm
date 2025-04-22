"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// import Image from "next/image";

export default function GeneralSettings() {
	const { toast } = useToast();
	const [settings, setSettings] = useState({
		organizationName: "Systems Department",
		organizationLogo: "",
		defaultDateFormat: "DD/MM/AAAA",
		defaultTimeFormat: "12h",
		enableDarkMode: true,
		enableNotifications: true,
		defaultLanguage: "es",
	});

	const handleSaveSettings = () => {
		// Here you would save the settings to your backend
		toast({
			title: "Settings saved",
			description: "Your settings have been saved successfully.",
		});
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="defaultDateFormat">Formato de Fecha Predeterminado</Label>
						<Select disabled value={settings.defaultDateFormat} onValueChange={(value) => setSettings({ ...settings, defaultDateFormat: value })}>
							<SelectTrigger id="defaultDateFormat">
								<SelectValue placeholder="Seleccionar formato de fecha" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="MM/DD/AAAA">MM/DD/AAAA</SelectItem>
								<SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
								<SelectItem value="AAAA-MM-DD">AAAA-MM-DD</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="defaultTimeFormat">Formato de Hora Predeterminado</Label>
						<Select disabled value={settings.defaultTimeFormat} onValueChange={(value) => setSettings({ ...settings, defaultTimeFormat: value })}>
							<SelectTrigger id="defaultTimeFormat">
								<SelectValue placeholder="Seleccionar formato de hora" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="12h">12 horas (AM/PM)</SelectItem>
								<SelectItem value="24h">24 horas</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="defaultLanguage">Idioma Predeterminado</Label>
					<Select disabled value={settings.defaultLanguage} onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}>
						<SelectTrigger id="defaultLanguage">
							<SelectValue placeholder="Seleccionar idioma" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="en">Inglés</SelectItem>
							<SelectItem value="es">Español</SelectItem>
							<SelectItem value="fr">Francés</SelectItem>
							<SelectItem value="de">Alemán</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="darkMode">Dark Mode</Label>
						<div className="text-sm text-muted-foreground">Enable dark mode for the application</div>
					</div>
					<Switch disabled id="darkMode" checked={settings.enableDarkMode} onCheckedChange={(checked) => setSettings({ ...settings, enableDarkMode: checked })} />
				</div>
			</CardContent>
			<CardFooter>
				<Button onClick={handleSaveSettings}>Save Settings</Button>
			</CardFooter>
		</Card>
	);
}
