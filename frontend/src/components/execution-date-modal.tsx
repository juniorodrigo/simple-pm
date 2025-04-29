"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ActivitysService } from "@/services/activity.service";
import { BaseActivity } from "@/app/types/activity.type";

type DateRange = {
	from: Date;
	to?: Date;
};

type ExecutionDateModalProps = {
	activity: BaseActivity | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (updatedActivity: BaseActivity) => void;
};

export default function ExecutionDateModal({ activity, isOpen, onClose, onSuccess }: ExecutionDateModalProps) {
	const { toast } = useToast();
	const [dateRange, setDateRange] = useState<DateRange>({
		from: new Date(),
		to: new Date(),
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Reiniciar el estado cuando cambia la actividad
	useEffect(() => {
		if (activity) {
			const startDate = activity.executedStartDate ? new Date(activity.executedStartDate) : new Date();
			const endDate = activity.executedEndDate ? new Date(activity.executedEndDate) : new Date();
			setDateRange({
				from: startDate,
				to: endDate,
			});
		}
	}, [activity]);

	const handleSubmit = async () => {
		if (!activity) return;

		try {
			setIsSubmitting(true);

			// Preparar la actividad actualizada con las fechas de ejecución
			const updatedActivity: BaseActivity = {
				...activity,
				executedStartDate: dateRange.from,
				executedEndDate: dateRange.to || dateRange.from,
			};

			// Llamar al servicio para actualizar la actividad
			const response = await ActivitysService.updateActivity(activity.id, updatedActivity);

			if (response.success) {
				toast({
					title: "Fechas de ejecución registradas",
					description: "Las fechas de ejecución se han guardado correctamente",
				});
				onSuccess(updatedActivity);
			} else {
				toast({
					title: "Error",
					description: "No se pudieron guardar las fechas de ejecución",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error al guardar fechas de ejecución:", error);
			toast({
				title: "Error",
				description: "Ocurrió un error inesperado",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
			onClose();
		}
	};

	// Omitir registro de fechas de ejecución
	const handleSkip = () => {
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Fechas de ejecución</DialogTitle>
					<DialogDescription>Por favor, registra las fechas reales en que se ejecutó la actividad.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<div className="text-sm font-medium">Actividad completada:</div>
						<div className="text-sm">{activity?.title || ""}</div>
					</div>

					<div className="space-y-2">
						<div className="text-sm font-medium">Selecciona las fechas de ejecución:</div>

						<Popover>
							<PopoverTrigger asChild>
								<Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() ? (
											<>
												{format(dateRange.from, "PPP", { locale: es })} - {format(dateRange.to, "PPP", { locale: es })}
											</>
										) : (
											<>Un solo día: {format(dateRange.from, "PPP", { locale: es })}</>
										)
									) : (
										<span>Selecciona fechas</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<div className="p-2 text-xs text-muted-foreground">Selecciona las fechas reales en que se ejecutó la actividad</div>
								<Calendar
									initialFocus
									mode="range"
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={(range) => {
										if (range?.from) {
											setDateRange({
												from: range.from,
												to: range.to || range.from,
											});
										}
									}}
									locale={es}
									numberOfMonths={2}
								/>
							</PopoverContent>
						</Popover>

						<div className="flex justify-between text-xs text-muted-foreground">
							<p>Inicio real: {format(dateRange.from, "PPP", { locale: es })}</p>
							<p>Fin real: {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "Igual que inicio"}</p>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleSkip} disabled={isSubmitting}>
						Omitir
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? "Guardando..." : "Guardar fechas"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
