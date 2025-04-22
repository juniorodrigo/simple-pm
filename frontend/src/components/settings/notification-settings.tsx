"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function NotificationSettings() {
	const { toast } = useToast();
	const [settings, setSettings] = useState({
		emailNotifications: true,
		projectUpdates: true,
		activityAssignments: true,
		dueDateReminders: true,
		statusChanges: true,
		teamMemberJoined: false,
		weeklyDigest: true,
	});

	const handleSaveSettings = () => {
		// Here you would save the settings to your backend
		toast({
			title: "Configuración de notificaciones guardada",
			description: "Tus preferencias de notificación han sido actualizadas.",
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configuración de Notificaciones</CardTitle>
				<CardDescription>Configura cómo y cuándo recibes notificaciones</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="emailNotifications">Notificaciones por Email</Label>
						<div className="text-sm text-muted-foreground">Recibir notificaciones vía correo electrónico</div>
					</div>
					<Switch id="emailNotifications" checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })} />
				</div>

				<div className="border-t pt-6">
					<h3 className="text-sm font-medium mb-4">Notificaciones de Proyectos</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="projectUpdates">Actualizaciones de Proyectos</Label>
								<div className="text-sm text-muted-foreground">Notificar cuando los proyectos son actualizados</div>
							</div>
							<Switch id="projectUpdates" checked={settings.projectUpdates} onCheckedChange={(checked) => setSettings({ ...settings, projectUpdates: checked })} />
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="statusChanges">Cambios de Estado</Label>
								<div className="text-sm text-muted-foreground">Notificar cuando cambia el estado de un proyecto o actividad</div>
							</div>
							<Switch id="statusChanges" checked={settings.statusChanges} onCheckedChange={(checked) => setSettings({ ...settings, statusChanges: checked })} />
						</div>
					</div>
				</div>

				<div className="border-t pt-6">
					<h3 className="text-sm font-medium mb-4">Notificaciones de Actividades</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="activityAssignments">Asignación de Actividades</Label>
								<div className="text-sm text-muted-foreground">Notificar cuando te asignan a una actividad</div>
							</div>
							<Switch id="activityAssignments" checked={settings.activityAssignments} onCheckedChange={(checked) => setSettings({ ...settings, activityAssignments: checked })} />
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="dueDateReminders">Recordatorios de Fechas Límite</Label>
								<div className="text-sm text-muted-foreground">Notificar sobre actividades próximas a vencer y vencidas</div>
							</div>
							<Switch id="dueDateReminders" checked={settings.dueDateReminders} onCheckedChange={(checked) => setSettings({ ...settings, dueDateReminders: checked })} />
						</div>
					</div>
				</div>

				<div className="border-t pt-6">
					<h3 className="text-sm font-medium mb-4">Notificaciones de Equipo</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="teamMemberJoined">Nuevos Miembros del Equipo</Label>
								<div className="text-sm text-muted-foreground">Notificar cuando nuevos miembros se unen al equipo</div>
							</div>
							<Switch id="teamMemberJoined" checked={settings.teamMemberJoined} onCheckedChange={(checked) => setSettings({ ...settings, teamMemberJoined: checked })} />
						</div>
					</div>
				</div>

				<div className="border-t pt-6">
					<h3 className="text-sm font-medium mb-4">Notificaciones de Resumen</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="weeklyDigest">Resumen Semanal</Label>
								<div className="text-sm text-muted-foreground">Recibir un resumen semanal de actividades del proyecto</div>
							</div>
							<Switch id="weeklyDigest" checked={settings.weeklyDigest} onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })} />
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button onClick={handleSaveSettings}>Guardar Configuración de Notificaciones</Button>
			</CardFooter>
		</Card>
	);
}
