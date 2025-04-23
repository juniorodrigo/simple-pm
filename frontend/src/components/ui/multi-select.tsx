import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Option {
	value: string;
	label: string;
}

interface MultiSelectProps {
	options: Option[];
	selected: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
	className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Seleccionar items...", className }: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const handleUnselect = (item: string) => {
		onChange(selected.filter((i) => i !== item));
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className={`w-full justify-between ${selected.length > 1 ? "h-full" : "h-10"}`}>
					<div className="flex flex-wrap gap-1">
						{selected.length > 0 ? (
							selected.map((item) => {
								const option = options.find((option) => option.value === item);
								return (
									<div key={item} className="flex items-center mr-1 mb-1">
										<Badge variant="secondary" className="mr-1">
											{option?.label}
										</Badge>
										<div
											role="button"
											tabIndex={0}
											className="cursor-pointer rounded-full p-0.5 hover:bg-muted"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleUnselect(item);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === "Space") {
													e.preventDefault();
													handleUnselect(item);
												}
											}}
										>
											<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
										</div>
									</div>
								);
							})
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command className={className}>
					<CommandInput placeholder="Buscar..." />
					<CommandEmpty>No se encontraron resultados.</CommandEmpty>
					<CommandGroup className="max-h-64 overflow-auto">
						{options.map((option) => (
							<CommandItem
								key={option.value}
								onSelect={() => {
									onChange(selected.includes(option.value) ? selected.filter((item) => item !== option.value) : [...selected, option.value]);
									setOpen(true);
								}}
							>
								<Check className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")} />
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
