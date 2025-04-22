import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Clock, FolderKanban, GanttChartSquare, KanbanSquare, Tag } from "lucide-react";

export default function Dashboard() {
	// Mock data for dashboard
	const stats = [
		{ title: "Total Projects", value: "12", icon: FolderKanban },
		{ title: "In Progress", value: "5", icon: Clock },
		{ title: "Completed", value: "7", icon: ArrowRight },
	];

	const recentProjects = [
		{
			id: "1",
			name: "Infrastructure Upgrade",
			description: "Server infrastructure upgrade and migration",
			progress: 75,
			tags: ["Infrastructure", "Critical"],
		},
		{
			id: "2",
			name: "CRM Development",
			description: "Customer relationship management system development",
			progress: 45,
			tags: ["Development"],
		},
		{
			id: "3",
			name: "Network Maintenance",
			description: "Quarterly network maintenance and security updates",
			progress: 90,
			tags: ["Maintenance"],
		},
	];

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-3">
				{stats.map((stat, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="col-span-full md:col-span-2">
					<CardHeader>
						<CardTitle>Recent Projects</CardTitle>
						<CardDescription>Your most recently updated projects</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentProjects.map((project) => (
								<div key={project.id} className="border rounded-lg p-4">
									<div className="flex justify-between items-start mb-2">
										<div>
											<h3 className="font-medium">{project.name}</h3>
											<p className="text-sm text-muted-foreground">{project.description}</p>
										</div>
										<div className="text-sm font-medium">{project.progress}%</div>
									</div>
									<div className="w-full bg-secondary h-2 rounded-full mt-2">
										<div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }} />
									</div>
									<div className="flex gap-2 mt-3">
										{project.tags.map((tag, i) => (
											<span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
												{tag}
											</span>
										))}
									</div>
								</div>
							))}
						</div>
					</CardContent>
					<CardFooter>
						<Button asChild variant="ghost" className="w-full">
							<Link href="/projects">
								View all projects
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Quick Access</CardTitle>
						<CardDescription>Navigate to key sections</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button asChild variant="outline" className="w-full justify-start">
							<Link href="/kanban">
								<KanbanSquare className="mr-2 h-4 w-4" />
								Kanban Board
							</Link>
						</Button>
						<Button asChild variant="outline" className="w-full justify-start">
							<Link href="/gantt">
								<GanttChartSquare className="mr-2 h-4 w-4" />
								Gantt Chart
							</Link>
						</Button>
						<Button asChild variant="outline" className="w-full justify-start">
							<Link href="/tags">
								<Tag className="mr-2 h-4 w-4" />
								Manage Tags
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
