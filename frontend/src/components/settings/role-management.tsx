import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Role } from "@/app/types/enums";

type RoleDefinition = {
	id: Role;
	name: string;
	description: string;
	permissions: string[];
};

interface RoleManagementProps {
	roles: RoleDefinition[];
	userCounts: Record<Role, number>;
	getRoleBadgeColor: (role: string) => string;
}

export function RoleManagement({ roles, userCounts, getRoleBadgeColor }: RoleManagementProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Gestión de Roles</CardTitle>
				<CardDescription>Ver y entender los diferentes roles y sus permisos</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{roles.map((role) => (
						<div key={role.id} className="border rounded-lg p-4">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className={getRoleBadgeColor(role.id)}>
										{role.name}
									</Badge>
									<span className="text-sm text-muted-foreground">{role.description}</span>
								</div>
								<Badge variant="outline">{userCounts[role.id]} usuarios</Badge>
							</div>
							<div className="mt-4">
								<h4 className="text-sm font-medium mb-2">Permisos:</h4>
								<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
									{role.permissions.map((permission, index) => (
										<li key={index} className="flex items-center text-sm">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											{permission}
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
