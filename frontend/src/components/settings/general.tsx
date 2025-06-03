"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Building, Globe, Clock, Calendar, Bell, Palette, Loader2, AlertTriangle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrganizationService } from "@/services/new/general.service";
import { Organization } from "@/types/organization.type";

export default function GeneralSettings() {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationError, setValidationError] = useState<string>("");
	const [settings, setSettings] = useState<Organization>({
		organizationName: "",
		organizationLogo: "",
		defaultDateFormat: "DD/MM/AAAA",
		defaultTimeFormat: "12h",
		enableDarkMode: true,
		enableNotifications: true,
		defaultLanguage: "es",
	});
	const [originalSettings, setOriginalSettings] = useState<Organization | null>(null);

	useEffect(() => {
		loadOrganizationInfo();
	}, []);

	const loadOrganizationInfo = async () => {
		try {
			setIsLoading(true);
			const response = await OrganizationService.getOrganizationInfo();

			if (response.success && response.data) {
				const orgData = response.data;
				setSettings(orgData);
				setOriginalSettings(orgData);
			} else {
				throw new Error(response.message || "Error al cargar la configuración");
			}
		} catch (error) {
			console.error("Error cargando configuración:", error);
			toast({
				title: "Error al cargar",
				description: "No se pudo cargar la configuración. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const validateForm = (): boolean => {
		setValidationError("");

		if (!settings.organizationName.trim()) {
			setValidationError("El nombre de la organización es obligatorio");
			return false;
		}

		if (settings.organizationName.trim().length < 2) {
			setValidationError("El nombre debe tener al menos 2 caracteres");
			return false;
		}

		if (settings.organizationName.trim().length > 100) {
			setValidationError("El nombre no puede exceder 100 caracteres");
			return false;
		}

		return true;
	};

	const hasChanges = (): boolean => {
		if (!originalSettings) return false;

		return JSON.stringify(settings) !== JSON.stringify(originalSettings);
	};

	const handleSaveSettings = async () => {
		if (!validateForm()) return;

		try {
			setIsSubmitting(true);
			const response = await OrganizationService.updateOrganizationInfo(settings);

			if (response.success) {
				setOriginalSettings(settings);
				toast({
					title: "¡Configuración guardada!",
					description: "La configuración se ha actualizado exitosamente.",
				});
			} else {
				throw new Error(response.message || "Error al guardar la configuración");
			}
		} catch (error) {
			console.error("Error guardando configuración:", error);
			toast({
				title: "Error al guardar",
				description: "No se pudo guardar la configuración. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReset = () => {
		if (originalSettings) {
			setSettings(originalSettings);
			setValidationError("");
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground">Cargando configuración...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-5xl mx-auto">
			{/* Información de la Organización */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg flex items-center space-x-2">
						<Building className="h-5 w-5" />
						<span>Información de la Organización</span>
					</CardTitle>
					<CardDescription>Configura los datos básicos de tu organización</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{validationError && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{validationError}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label htmlFor="organizationName" className="text-sm font-medium">
								Nombre de la Organización *
							</Label>
							<Input
								id="organizationName"
								value={settings.organizationName}
								onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
								placeholder="Ingresa el nombre de tu organización"
								maxLength={100}
							/>
							<p className="text-xs text-muted-foreground">{settings.organizationName.length}/100 caracteres</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="organizationLogo" className="text-sm font-medium">
								Logo de la Organización
							</Label>
							<Input id="organizationLogo" value={settings.organizationLogo} onChange={(e) => setSettings({ ...settings, organizationLogo: e.target.value })} placeholder="URL del logo (opcional)" disabled />
							<p className="text-xs text-muted-foreground">URL de la imagen del logo</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Configuración Regional */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg flex items-center space-x-2">
						<Globe className="h-5 w-5" />
						<span>Configuración Regional</span>
					</CardTitle>
					<CardDescription>Configura el idioma y formatos de fecha y hora</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="space-y-2">
							<Label htmlFor="defaultLanguage" className="text-sm font-medium flex items-center space-x-2">
								<Globe className="h-4 w-4" />
								<span>Idioma predeterminado</span>
							</Label>
							<Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })} disabled>
								<SelectTrigger>
									<SelectValue placeholder="Seleccionar idioma" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="es">
										<div className="flex items-center">
											<span className="mr-2">🇪🇸</span>
											Español
										</div>
									</SelectItem>
									<SelectItem value="en">
										<div className="flex items-center">
											<span className="mr-2">🇺🇸</span>
											English
										</div>
									</SelectItem>
									<SelectItem value="fr">
										<div className="flex items-center">
											<span className="mr-2">🇫🇷</span>
											Français
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="defaultDateFormat" className="text-sm font-medium flex items-center space-x-2">
								<Calendar className="h-4 w-4" />
								<span>Formato de fecha</span>
							</Label>
							<Select value={settings.defaultDateFormat} onValueChange={(value) => setSettings({ ...settings, defaultDateFormat: value })} disabled>
								<SelectTrigger>
									<SelectValue placeholder="Seleccionar formato" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
									<SelectItem value="MM/DD/AAAA">MM/DD/AAAA</SelectItem>
									<SelectItem value="AAAA-MM-DD">AAAA-MM-DD</SelectItem>
									<SelectItem value="DD-MM-AAAA">DD-MM-AAAA</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="defaultTimeFormat" className="text-sm font-medium flex items-center space-x-2">
								<Clock className="h-4 w-4" />
								<span>Formato de hora</span>
							</Label>
							<Select value={settings.defaultTimeFormat} onValueChange={(value) => setSettings({ ...settings, defaultTimeFormat: value })} disabled>
								<SelectTrigger>
									<SelectValue placeholder="Seleccionar formato" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="12h">
										<div className="flex items-center">
											<Clock className="h-4 w-4 mr-2" />
											12 horas (AM/PM)
										</div>
									</SelectItem>
									<SelectItem value="24h">
										<div className="flex items-center">
											<Clock className="h-4 w-4 mr-2" />
											24 horas
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Preferencias de Usuario */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg flex items-center space-x-2">
						<Settings className="h-5 w-5" />
						<span>Preferencias de Usuario</span>
					</CardTitle>
					<CardDescription>Configura las preferencias de experiencia de usuario</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="darkMode" className="text-sm font-medium flex items-center space-x-2">
									<Palette className="h-4 w-4" />
									<span>Modo oscuro</span>
								</Label>
								<p className="text-xs text-muted-foreground">Habilitar tema oscuro por defecto</p>
							</div>
							<Switch id="darkMode" checked={settings.enableDarkMode} onCheckedChange={(checked) => setSettings({ ...settings, enableDarkMode: checked })} disabled />
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="notifications" className="text-sm font-medium flex items-center space-x-2">
									<Bell className="h-4 w-4" />
									<span>Notificaciones</span>
								</Label>
								<p className="text-xs text-muted-foreground">Habilitar notificaciones del sistema</p>
							</div>
							<Switch id="notifications" checked={settings.enableNotifications} onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })} disabled />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Acciones */}
			<Card className="shadow-sm">
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row gap-3 justify-between">
						<div className="flex gap-3">
							<Button onClick={handleSaveSettings} disabled={isSubmitting || !hasChanges()} className="min-w-[140px]">
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Guardando...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Guardar Cambios
									</>
								)}
							</Button>

							<Button variant="outline" onClick={handleReset} disabled={isSubmitting || !hasChanges()}>
								Descartar Cambios
							</Button>
						</div>

						{hasChanges() && (
							<div className="flex items-center text-sm text-muted-foreground">
								<AlertTriangle className="h-4 w-4 mr-1" />
								Tienes cambios sin guardar
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
