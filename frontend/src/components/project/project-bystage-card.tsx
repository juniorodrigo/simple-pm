import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Stage {
	id: string;
	name: string;
	progress: number;
	color: string;
	startDate: string;
	endDate: string;
}

interface ProjectCardProps {
	project: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
		progress: number;
		stages: Stage[];
	};
}

export function ProjectCard({ project }: ProjectCardProps) {
	const getStageColorClass = (color: string) => {
		switch (color) {
			case "red":
				return "bg-red-50 text-red-800 border-red-200";
			case "green":
				return "bg-green-50 text-green-800 border-green-200";
			case "blue":
				return "bg-blue-50 text-blue-800 border-blue-200";
			case "yellow":
				return "bg-yellow-50 text-yellow-800 border-yellow-200";
			case "purple":
				return "bg-purple-50 text-purple-800 border-purple-200";
			case "pink":
				return "bg-pink-50 text-pink-800 border-pink-200";
			case "gray":
				return "bg-gray-50 text-gray-800 border-gray-200";
			default:
				return "bg-gray-50 text-gray-800 border-gray-200";
		}
	};

	const getProgressColor = (progress: number) => {
		if (progress > 66) return "bg-green-500/40";
		if (progress > 33) return "bg-yellow-500/40";
		return "bg-primary/40";
	};

	const handleCardClick = () => {
		window.location.href = `/projects/${project.id}`;
	};

	return (
		<Card className="h-full hover:shadow-md transition-shadow cursor-pointer p-2" onClick={handleCardClick}>
			<CardHeader className="pb-2">
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>{project.name}</CardTitle>
						<CardDescription>
							{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
						</CardDescription>
					</div>
					<div className="text-right">
						<div className="text-sm font-medium">Overall Progress</div>
						<div className="text-2xl font-bold">{project.progress}%</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{project.stages.map((stage) => (
						<div key={stage.id} className="space-y-1">
							<div className="flex justify-between items-center">
								<div className="flex items-center">
									<Badge variant="outline" className={getStageColorClass(stage.color)}>
										{stage.name}
									</Badge>
									<span className="text-sm ml-2">
										{new Date(stage.startDate).toLocaleDateString()} - {new Date(stage.endDate).toLocaleDateString()}
									</span>
								</div>
								<span className="text-sm font-medium">{stage.progress}%</span>
							</div>
							<div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
								{stage.progress > 0 && <div className={`h-full rounded-full transition-all duration-500 ease-in-out ${getProgressColor(stage.progress)}`} style={{ width: `${stage.progress}%` }} />}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
