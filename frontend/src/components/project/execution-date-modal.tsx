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
import { BaseActivity } from "@/types/activity.type";
import { ActivityStatus } from "@/types/enums";

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
	const [forceOpen, setForceOpen] = useState(true);
	const [cancelled, setCancelled] = useState(false);

	// Determinar si estamos pidiendo fecha de inicio o fin basado en el estado al que se está cambiando
	const isStartDate = activity?.status === ActivityStatus.IN_PROGRESS;

	// Reiniciar el estado cuando cambia la actividad
	useEffect(() => {
		if (activity) {
			const date = isStartDate ? (activity.executedStartDate ? new Date(activity.executedStartDate) : new Date()) : activity.executedEndDate ? new Date(activity.executedEndDate) : new Date();
			setDateRange({ from: date, to: date });
			setForceOpen(true);
			setCancelled(false);
		}
	}, [activity, isStartDate]);

	const handleSubmit = async () => {
		if (!activity) return;
		try {
			setIsSubmitting(true);
			const updatedActivity: BaseActivity = {
				...activity,
				executedStartDate: isStartDate ? dateRange.from : activity.executedStartDate,
				executedEndDate: !isStartDate ? dateRange.from : activity.executedEndDate,
			};
			const response = await ActivitysService.updateActivity(activity.id, updatedActivity);
			if (response.success) {
				toast({
					title: isStartDate ? "Fecha de inicio registrada" : "Fecha de fin registrada",
					description: isStartDate ? "La fecha de inicio se ha guardado correctamente" : "La fecha de fin se ha guardado correctamente",
				});
				setForceOpen(false);
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
		}
	};

	const handleCancel = () => {
		setCancelled(true);
		setForceOpen(false);
		onClose();
	};

	const handleOpenChange = (open: boolean) => {
		if (!open && forceOpen && !cancelled) {
			toast({
				title: "Debes ingresar la fecha",
				description: "Para continuar, primero debes guardar la fecha de ejecución o cancelar.",
				variant: "destructive",
			});
			return;
		}
		if (!open && (!forceOpen || cancelled)) {
			setCancelled(false);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen && forceOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{isStartDate ? "Fecha de inicio" : "Fecha de fin"}</DialogTitle>
					<DialogDescription>{isStartDate ? "Por favor, registra la fecha real en que comenzó la actividad." : "Por favor, registra la fecha real en que se completó la actividad."}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<div className="text-sm font-medium">Actividad:</div>
						<div className="text-sm">{activity?.title || ""}</div>
					</div>
					<div className="space-y-2">
						<div className="text-sm font-medium">Selecciona la fecha:</div>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? format(dateRange.from, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<div className="p-2 text-xs text-muted-foreground">{isStartDate ? "Selecciona la fecha real en que comenzó la actividad" : "Selecciona la fecha real en que se completó la actividad"}</div>
								<Calendar
									initialFocus
									mode="single"
									defaultMonth={dateRange?.from}
									selected={dateRange.from}
									onSelect={(date) => {
										if (date) {
											setDateRange({ from: date, to: date });
										}
									}}
									locale={es}
									numberOfMonths={1}
									disabled={(date) => date > new Date()}
								/>
							</PopoverContent>
						</Popover>
						<div className="text-xs text-muted-foreground">
							<p>
								{isStartDate ? "Inicio real: " : "Fin real: "}
								{format(dateRange.from, "PPP", { locale: es })}
							</p>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting || !dateRange.from}>
						{isSubmitting ? "Guardando..." : "Guardar fecha"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
