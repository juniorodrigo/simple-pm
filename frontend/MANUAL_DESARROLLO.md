# MANUAL DE DESARROLLO - SISTEMA DE GESTIÓN DE PROYECTOS

## ÍNDICE GENERAL

1. [Introducción y Arquitectura](#1-introducción-y-arquitectura)
2. [Configuración del Entorno de Desarrollo](#2-configuración-del-entorno-de-desarrollo)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Tecnologías y Stack Técnico](#4-tecnologías-y-stack-técnico)
5. [Arquitectura Frontend](#5-arquitectura-frontend)
6. [Gestión de Estado y Contextos](#6-gestión-de-estado-y-contextos)
7. [Componentes y UI](#7-componentes-y-ui)
8. [Servicios y API](#8-servicios-y-api)
9. [Tipos y Validaciones](#9-tipos-y-validaciones)
10. [Autenticación y Autorización](#10-autenticación-y-autorización)
11. [Patrones de Desarrollo](#11-patrones-de-desarrollo)
12. [Flujos de Desarrollo](#12-flujos-de-desarrollo)
13. [Testing y Calidad](#13-testing-y-calidad)
14. [Optimización y Performance](#14-optimización-y-performance)
15. [Deployment y DevOps](#15-deployment-y-devops)
16. [Contribución y Estándares](#16-contribución-y-estándares)

---

## 1. INTRODUCCIÓN Y ARQUITECTURA

### 1.1 Visión General del Sistema

El sistema de gestión de proyectos está desarrollado con **Next.js 15** usando **App Router** y **TypeScript**. La aplicación implementa una arquitectura moderna basada en componentes reutilizables, gestión de estado con React Context, y una API REST para comunicación con el backend.

### 1.2 Principios Arquitectónicos

- **Separación de responsabilidades**: Lógica de negocio separada de presentación
- **Componentes reutilizables**: UI modular con Radix UI y shadcn/ui
- **Tipado fuerte**: TypeScript en toda la aplicación
- **Gestión centralizada de estado**: React Context para autenticación y estado global
- **Validación de datos**: Zod para esquemas y validaciones
- **Performance**: Optimizaciones con React memo, lazy loading y Code Splitting

### 1.3 Arquitectura de Capas

```
┌─────────────────────────────────────┐
│           PRESENTACIÓN              │
│   Components • Pages • Layouts      │
├─────────────────────────────────────┤
│            LÓGICA DE NEGOCIO        │
│    Contexts • Hooks • Utils         │
├─────────────────────────────────────┤
│            SERVICIOS                │
│      API Calls • Data Fetching      │
├─────────────────────────────────────┤
│            DATOS                    │
│    Types • Schemas • Validations    │
└─────────────────────────────────────┘
```

---

## 2. CONFIGURACIÓN DEL ENTORNO DE DESARROLLO

### 2.1 Prerrequisitos

- **Node.js**: v18.0.0 o superior
- **PNPM**: v8.0.0 o superior (gestor de paquetes recomendado)
- **Git**: Para control de versiones
- **VS Code**: Editor recomendado con extensiones TypeScript y ESLint

### 2.2 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd app-proyectos/frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en modo desarrollo
pnpm dev
```

### 2.3 Scripts Disponibles

```json
{
	"dev": "next dev --turbopack -p 4141", // Desarrollo con Turbopack
	"build": "next build", // Build de producción
	"start": "next start -p 4141", // Servidor de producción
	"lint": "next lint" // Linting del código
}
```

### 2.4 Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_HOST=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

---

## 3. ESTRUCTURA DEL PROYECTO

### 3.1 Estructura de Directorios

```
frontend/
├── public/                     # Archivos estáticos
│   ├── icons/                 # Iconos de la aplicación
│   └── images/                # Imágenes públicas
├── src/
│   ├── app/                   # App Router (Next.js 13+)
│   │   ├── (gestion)/         # Rutas agrupadas de gestión
│   │   │   ├── projects/      # Páginas de proyectos
│   │   │   └── settings/      # Páginas de configuración
│   │   ├── api/               # API Routes
│   │   ├── login/             # Página de login
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes reutilizables
│   │   ├── layout/            # Componentes de layout
│   │   ├── project/           # Componentes específicos de proyectos
│   │   ├── projects/          # Componentes de listado de proyectos
│   │   ├── settings/          # Componentes de configuración
│   │   └── ui/                # Componentes de UI base (shadcn/ui)
│   ├── contexts/              # React Contexts
│   ├── hooks/                 # Custom Hooks
│   ├── lib/                   # Utilidades y helpers
│   ├── services/              # Servicios para API calls
│   ├── types/                 # Definiciones de tipos TypeScript
│   └── middleware.ts          # Middleware de Next.js
├── components.json            # Configuración de shadcn/ui
├── next.config.ts            # Configuración de Next.js
├── package.json              # Dependencias y scripts
├── tailwind.config.js        # Configuración de Tailwind CSS
└── tsconfig.json             # Configuración de TypeScript
```

### 3.2 Convenciones de Nomenclatura

- **Archivos de componentes**: PascalCase (`ProjectCard.tsx`)
- **Archivos de páginas**: kebab-case o PascalCase según App Router
- **Archivos de utilidades**: camelCase (`utils.ts`)
- **Archivos de tipos**: camelCase con `.type.ts` (`project.type.ts`)
- **Archivos de servicios**: camelCase con `.service.ts` (`project.service.ts`)

---

## 4. TECNOLOGÍAS Y STACK TÉCNICO

### 4.1 Core Technologies

- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de UI con React Server Components
- **TypeScript 5**: Tipado estático
- **Tailwind CSS 4**: Framework de CSS utility-first

### 4.2 UI y Componentes

- **Radix UI**: Componentes accesibles y sin estilos
- **shadcn/ui**: Sistema de componentes basado en Radix UI
- **Lucide React**: Iconos SVG
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de esquemas

### 4.3 Gestión de Estado

- **React Context**: Estado global de autenticación
- **React Hooks**: Estado local de componentes
- **React Query** (futuro): Para cache de datos del servidor

### 4.4 Funcionalidades Específicas

- **@dnd-kit**: Drag and drop para Kanban
- **Recharts**: Gráficos y visualizaciones
- **date-fns**: Manipulación de fechas
- **React Day Picker**: Selector de fechas

### 4.5 Desarrollo y Calidad

- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Turbopack**: Bundler rápido para desarrollo

---

## 5. ARQUITECTURA FRONTEND

### 5.1 App Router Structure

```typescript
// app/layout.tsx - Layout principal
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body className={inter.className}>
				<AuthProvider>
					<ThemeProvider>
						{children}
						<Toaster />
					</ThemeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
```

### 5.2 Rutas Agrupadas

```
app/
├── (gestion)/              # Grupo de rutas autenticadas
│   ├── layout.tsx         # Layout con sidebar
│   ├── projects/
│   │   ├── page.tsx       # Listado de proyectos
│   │   └── [id]/
│   │       └── page.tsx   # Detalle de proyecto
│   └── settings/
│       └── page.tsx       # Configuración
└── login/
    ├── layout.tsx         # Layout simple para login
    └── page.tsx           # Página de login
```

### 5.3 Server Components vs Client Components

```typescript
// Server Component (por defecto)
export default async function ProjectsPage() {
	// Fetch inicial en el servidor
	const projects = await getProjects();

	return (
		<div>
			<ProjectsClientView initialProjects={projects} />
		</div>
	);
}

// Client Component (cuando necesitas interactividad)
("use client");
export default function ProjectsClientView({ initialProjects }) {
	const [projects, setProjects] = useState(initialProjects);
	// Lógica interactiva...
}
```

---

## 6. GESTIÓN DE ESTADO Y CONTEXTOS

### 6.1 Context de Autenticación

```typescript
// contexts/auth-context.tsx
interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<User | null>;
	logout: () => void;
	isLoading: boolean;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Implementación de login, logout, etc.

	return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};
```

### 6.2 Custom Hooks

```typescript
// hooks/use-project.ts
export function useProject(projectId: string) {
	const [project, setProject] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProject = async () => {
			try {
				const response = await ProjectsService.getSingleProject(projectId);
				if (response.success) {
					setProject(response.data);
				}
			} catch (error) {
				console.error("Error fetching project:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProject();
	}, [projectId]);

	return { project, loading, setProject };
}
```

---

## 7. COMPONENTES Y UI

### 7.1 Estructura de Componentes

```typescript
// components/project/project-card.tsx
interface ProjectCardProps {
	project: Project;
	onEdit?: (project: Project) => void;
	onDelete?: (projectId: string) => void;
	isViewer?: boolean;
}

export const ProjectCard = memo(({ project, onEdit, onDelete, isViewer }: ProjectCardProps) => {
	// Implementación del componente
	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				<CardTitle>{project.name}</CardTitle>
				<CardDescription>{project.description}</CardDescription>
			</CardHeader>
			<CardContent>{/* Contenido del proyecto */}</CardContent>
			<CardFooter>
				{!isViewer && (
					<>
						<Button onClick={() => onEdit?.(project)}>Editar</Button>
						<Button variant="destructive" onClick={() => onDelete?.(project.id)}>
							Eliminar
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	);
});
```

### 7.2 Componentes de UI Base (shadcn/ui)

```typescript
// components/ui/button.tsx
const buttonVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline: "border border-input hover:bg-accent",
			// ... más variantes
		},
		size: {
			default: "h-10 px-4 py-2",
			sm: "h-9 rounded-md px-3",
			lg: "h-11 rounded-md px-8",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});
```

### 7.3 Componentes Compuestos

```typescript
// components/project/kanban-board.tsx
interface KanbanBoardProps {
	activities: BaseActivity[];
	stages: BaseStage[];
	onActivityChange: (activities: BaseActivity[]) => void;
	onActivityClick?: (activity: BaseActivity) => void;
	isViewer?: boolean;
}

export default function KanbanBoard({ activities, stages, onActivityChange, isViewer }: KanbanBoardProps) {
	// Lógica de drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		})
	);

	return (
		<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
			<div className="flex gap-4 overflow-x-auto">
				{stages.map((stage) => (
					<DroppableColumn key={stage.id} stage={stage}>
						{getActivitiesForStage(stage.id).map((activity) => (
							<DraggableActivityCard key={activity.id} activity={activity} />
						))}
					</DroppableColumn>
				))}
			</div>
		</DndContext>
	);
}
```

---

## 8. SERVICIOS Y API

### 8.1 Estructura de Servicios

```typescript
// services/project.service.ts
const HOST = env.NEXT_PUBLIC_HOST;

export const ProjectsService = {
	async getProjects(userId: string | null): Promise<ApiResponse> {
		try {
			const response = await fetch(`/api/is/projects?userId=${userId}`);
			return await response.json();
		} catch (error) {
			return { success: false, message: "Error fetching projects" };
		}
	},

	async createProject(project: ProjectCreate): Promise<ApiResponse> {
		try {
			const response = await fetch(`/api/is/projects`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(project),
			});
			return await response.json();
		} catch (error) {
			return { success: false, message: "Error creating project" };
		}
	},

	async updateProject(projectId: string, project: ProjectUpdate): Promise<ApiResponse> {
		try {
			const response = await fetch(`/api/is/projects/${projectId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(project),
			});
			return await response.json();
		} catch (error) {
			return { success: false, message: "Error updating project" };
		}
	},
};
```

### 8.2 API Routes (Next.js)

```typescript
// app/api/is/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		const response = await fetch(`${process.env.BACKEND_URL}/projects?userId=${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
	}
}
```

### 8.3 Manejo de Errores

```typescript
// lib/api-client.ts
export class ApiClient {
	private static async handleResponse(response: Response): Promise<ApiResponse> {
		try {
			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					message: data.message || `HTTP error! status: ${response.status}`,
					statusCode: response.status,
				};
			}

			return { success: true, data: data.data, message: data.message };
		} catch (error) {
			return {
				success: false,
				message: "Error parsing response",
				statusCode: response.status,
			};
		}
	}
}
```

---

## 9. TIPOS Y VALIDACIONES

### 9.1 Definición de Tipos

```typescript
// types/new/project.type.ts
import { z } from "zod";
import { ProjectStatus } from "../enums";

export const ProjectSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	status: z.nativeEnum(ProjectStatus),
	managerUserId: z.string(),
	categoryId: z.string(),
	areaId: z.string().optional(),
	archived: z.boolean().default(false),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectCreateSchema = ProjectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema> & {
	team: User[];
	manager?: User;
};
```

### 9.2 Validaciones de Formularios

```typescript
// components/projects/project-form.tsx
const formSchema = z
	.object({
		name: z.string().min(2, "Debe tener al menos dos caracteres"),
		description: z.string().max(500, "No puede exceder los 500 caracteres").optional(),
		startDate: z.date().optional(),
		endDate: z.date().optional(),
		teamMembers: z.array(z.string()).min(1, "Se requiere al menos un miembro"),
		managerId: z.string().min(1, "Se requiere un responsable"),
		categoryId: z.string().min(1, "Se requiere una categoría"),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate;
			}
			return true;
		},
		{
			message: "La fecha de fin debe ser posterior a la fecha de inicio",
			path: ["endDate"],
		}
	);

type FormData = z.infer<typeof formSchema>;
```

### 9.3 Enums y Constantes

```typescript
// types/enums.ts
export enum ProjectStatus {
	PENDING = "pending",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	COMPLETED = "completed",
	ARCHIVED = "archived",
}

export const ProjectStatusLabels = {
	[ProjectStatus.PENDING]: "Pendiente",
	[ProjectStatus.IN_PROGRESS]: "En Progreso",
	[ProjectStatus.REVIEW]: "En Revisión",
	[ProjectStatus.COMPLETED]: "Completado",
	[ProjectStatus.ARCHIVED]: "Archivado",
} as const;

export enum Role {
	ADMIN = "admin",
	VIEWER = "viewer",
	EDITOR = "editor",
	GERENTE_AREA = "gerente_area",
	GERENTE_GENERAL = "gerente_general",
}
```

---

## 10. AUTENTICACIÓN Y AUTORIZACIÓN

### 10.1 Flujo de Autenticación

```typescript
// contexts/auth-context.tsx
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

const login = async (email: string, password: string): Promise<User | null> => {
	try {
		setIsLoading(true);
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();

		if (data.success) {
			setUser(data.user);
			// Token se guarda automáticamente en httpOnly cookie
			return data.user;
		}
		return null;
	} catch (error) {
		console.error("Login error:", error);
		return null;
	} finally {
		setIsLoading(false);
	}
};
```

### 10.2 Middleware de Autenticación

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;
	const { pathname } = request.nextUrl;

	// Permitir rutas públicas
	if (publicRoutes.includes(pathname)) {
		return NextResponse.next();
	}

	// Redirigir a login si no hay token
	if (!token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 10.3 Control de Acceso por Roles

```typescript
// hooks/use-permissions.ts
export function usePermissions() {
	const { user } = useAuth();

	const canCreateProject = useMemo(() => {
		return user?.role !== Role.VIEWER;
	}, [user?.role]);

	const canEditProject = useMemo(() => {
		return user?.role !== Role.VIEWER;
	}, [user?.role]);

	const canDeleteProject = useMemo(() => {
		return user?.role === Role.ADMIN || user?.role === Role.GERENTE_GENERAL;
	}, [user?.role]);

	const canManageUsers = useMemo(() => {
		return user?.role === Role.ADMIN || user?.role === Role.GERENTE_GENERAL;
	}, [user?.role]);

	return {
		canCreateProject,
		canEditProject,
		canDeleteProject,
		canManageUsers,
	};
}
```

---

## 11. PATRONES DE DESARROLLO

### 11.1 Patrón de Composición de Componentes

```typescript
// Componente base
interface CardProps {
	children: React.ReactNode;
	className?: string;
}

export const Card = ({ children, className }: CardProps) => <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>{children}</div>;

// Componentes compuestos
export const CardHeader = ({ children, className }: CardProps) => <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;

export const CardContent = ({ children, className }: CardProps) => <div className={cn("p-6 pt-0", className)}>{children}</div>;

// Uso
<Card>
	<CardHeader>
		<CardTitle>Título</CardTitle>
	</CardHeader>
	<CardContent>Contenido</CardContent>
</Card>;
```

### 11.2 Patrón de Render Props

```typescript
// components/data-fetcher.tsx
interface DataFetcherProps<T> {
	fetcher: () => Promise<ApiResponse<T>>;
	children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
}

export function DataFetcher<T>({ fetcher, children }: DataFetcherProps<T>) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetcher();
				if (response.success) {
					setData(response.data);
				} else {
					setError(response.message || "Error fetching data");
				}
			} catch (err) {
				setError("Unexpected error");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [fetcher]);

	return <>{children(data, loading, error)}</>;
}

// Uso
<DataFetcher fetcher={() => ProjectsService.getProjects(userId)}>
	{(projects, loading, error) => {
		if (loading) return <Loading />;
		if (error) return <Error message={error} />;
		return <ProjectsList projects={projects} />;
	}}
</DataFetcher>;
```

### 11.3 Patrón de Higher-Order Components (HOCs)

```typescript
// hocs/with-auth.tsx
export function withAuth<P extends object>(Component: React.ComponentType<P>, requiredRoles?: Role[]) {
	return function AuthenticatedComponent(props: P) {
		const { user, isLoading } = useAuth();
		const router = useRouter();

		useEffect(() => {
			if (!isLoading && !user) {
				router.push("/login");
			}
		}, [user, isLoading, router]);

		if (isLoading) {
			return <div>Cargando...</div>;
		}

		if (!user) {
			return null;
		}

		if (requiredRoles && !requiredRoles.includes(user.role)) {
			return <div>No tienes permisos para acceder a esta página</div>;
		}

		return <Component {...props} />;
	};
}

// Uso
export default withAuth(ProjectsPage, [Role.ADMIN, Role.EDITOR]);
```

---

## 12. FLUJOS DE DESARROLLO

### 12.1 Flujo de Desarrollo de Nuevas Funcionalidades

1. **Análisis de requisitos**

   - Revisar manual de funcionalidades
   - Definir casos de uso
   - Identificar componentes necesarios

2. **Diseño de tipos**

   ```typescript
   // 1. Definir tipos en types/
   export interface NewFeature {
   	id: string;
   	name: string;
   	// ... otros campos
   }
   ```

3. **Creación de servicios**

   ```typescript
   // 2. Crear servicios en services/
   export const NewFeatureService = {
   	getAll: () => Promise<ApiResponse<NewFeature[]>>,
   	create: (data: CreateNewFeature) => Promise<ApiResponse<NewFeature>>,
   	// ... otros métodos
   };
   ```

4. **Desarrollo de componentes**

   ```typescript
   // 3. Crear componentes en components/
   export const NewFeatureComponent = ({ data }: Props) => {
   	// Implementación
   };
   ```

5. **Integración en páginas**
   ```typescript
   // 4. Integrar en app/
   export default function NewFeaturePage() {
   	return <NewFeatureComponent />;
   }
   ```

### 12.2 Flujo de Gestión de Estado

```typescript
// 1. Estado local para UI
const [isModalOpen, setIsModalOpen] = useState(false);

// 2. Estado de datos con custom hook
const { projects, loading, error, refetch } = useProjects();

// 3. Estado global con context (solo para datos críticos)
const { user } = useAuth();

// 4. Optimistic updates
const handleCreateProject = async (data: ProjectCreate) => {
	// Optimistic update
	setProjects((prev) => [...prev, { ...data, id: tempId }]);

	try {
		const response = await ProjectsService.create(data);
		if (response.success) {
			// Reemplazar con datos reales
			setProjects((prev) => prev.map((p) => (p.id === tempId ? response.data : p)));
		}
	} catch (error) {
		// Revertir cambio optimista
		setProjects((prev) => prev.filter((p) => p.id !== tempId));
	}
};
```

### 12.3 Flujo de Validación de Formularios

```typescript
// 1. Definir schema de validación
const schema = z.object({
	name: z.string().min(1, "Requerido"),
	email: z.string().email("Email inválido"),
});

// 2. Configurar React Hook Form
const form = useForm<FormData>({
	resolver: zodResolver(schema),
	defaultValues: {
		name: "",
		email: "",
	},
});

// 3. Manejar envío
const onSubmit = async (data: FormData) => {
	try {
		const response = await Service.create(data);
		if (response.success) {
			toast.success("Creado exitosamente");
			form.reset();
		} else {
			toast.error(response.message);
		}
	} catch (error) {
		toast.error("Error inesperado");
	}
};

// 4. Renderizar formulario
<Form {...form}>
	<form onSubmit={form.handleSubmit(onSubmit)}>
		<FormField
			control={form.control}
			name="name"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Nombre</FormLabel>
					<FormControl>
						<Input {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</form>
</Form>;
```

---

## 13. TESTING Y CALIDAD

### 13.1 Configuración de Testing

```json
// package.json
{
	"devDependencies": {
		"@testing-library/react": "^14.0.0",
		"@testing-library/jest-dom": "^6.0.0",
		"@testing-library/user-event": "^14.0.0",
		"jest": "^29.0.0",
		"jest-environment-jsdom": "^29.0.0"
	},
	"scripts": {
		"test": "jest",
		"test:watch": "jest --watch",
		"test:coverage": "jest --coverage"
	}
}
```

### 13.2 Tests de Componentes

```typescript
// __tests__/components/project-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectCard } from "@/components/project/project-card";
import { mockProject } from "../mocks/project.mock";

describe("ProjectCard", () => {
	it("renders project information correctly", () => {
		render(<ProjectCard project={mockProject} />);

		expect(screen.getByText(mockProject.name)).toBeInTheDocument();
		expect(screen.getByText(mockProject.description)).toBeInTheDocument();
	});

	it("calls onEdit when edit button is clicked", () => {
		const onEdit = jest.fn();
		render(<ProjectCard project={mockProject} onEdit={onEdit} />);

		fireEvent.click(screen.getByText("Editar"));
		expect(onEdit).toHaveBeenCalledWith(mockProject);
	});

	it("hides action buttons for viewer role", () => {
		render(<ProjectCard project={mockProject} isViewer={true} />);

		expect(screen.queryByText("Editar")).not.toBeInTheDocument();
		expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
	});
});
```

### 13.3 Tests de Servicios

```typescript
// __tests__/services/project.service.test.ts
import { ProjectsService } from "@/services/project.service";

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("ProjectsService", () => {
	beforeEach(() => {
		mockFetch.mockClear();
	});

	it("gets projects successfully", async () => {
		const mockProjects = [{ id: 1, name: "Test Project" }];
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true, data: mockProjects }),
		} as Response);

		const result = await ProjectsService.getProjects("user-1");

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockProjects);
	});

	it("handles network errors", async () => {
		mockFetch.mockRejectedValueOnce(new Error("Network error"));

		const result = await ProjectsService.getProjects("user-1");

		expect(result.success).toBe(false);
	});
});
```

### 13.4 Tests de Integración

```typescript
// __tests__/integration/project-flow.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/contexts/auth-context";
import ProjectsPage from "@/app/(gestion)/projects/page";

// Mock de servicios
jest.mock("@/services/project.service");

describe("Project Management Flow", () => {
	it("allows creating a new project", async () => {
		render(
			<AuthProvider>
				<ProjectsPage />
			</AuthProvider>
		);

		// Abrir modal de creación
		fireEvent.click(screen.getByText("Nuevo Proyecto"));

		// Llenar formulario
		fireEvent.change(screen.getByLabelText("Nombre"), {
			target: { value: "Nuevo Proyecto" },
		});

		// Enviar formulario
		fireEvent.click(screen.getByText("Crear"));

		// Verificar que el proyecto aparece en la lista
		await waitFor(() => {
			expect(screen.getByText("Nuevo Proyecto")).toBeInTheDocument();
		});
	});
});
```

### 13.5 Linting y Formateo

```json
// .eslintrc.json
{
	"extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
	"rules": {
		"@typescript-eslint/no-unused-vars": "error",
		"@typescript-eslint/no-explicit-any": "warn",
		"prefer-const": "error",
		"no-console": "warn"
	}
}
```

```json
// .prettierrc
{
	"semi": true,
	"singleQuote": false,
	"tabWidth": 2,
	"trailingComma": "es5",
	"printWidth": 120
}
```

---

## 14. OPTIMIZACIÓN Y PERFORMANCE

### 14.1 Optimización de Componentes

```typescript
// Memo para prevenir re-renders innecesarios
export const ProjectCard = memo(({ project, onEdit }: ProjectCardProps) => {
	return <Card>{/* Contenido del componente */}</Card>;
});

// useMemo para cálculos costosos
const expensiveCalculation = useMemo(() => {
	return projects.reduce((acc, project) => {
		return acc + calculateProjectProgress(project);
	}, 0);
}, [projects]);

// useCallback para funciones estables
const handleProjectEdit = useCallback((project: Project) => {
	setEditingProject(project);
	setIsModalOpen(true);
}, []);
```

### 14.2 Lazy Loading y Code Splitting

```typescript
// Lazy loading de componentes
const ProjectGanttChart = lazy(() => import("@/components/project/gantt-chart"));
const ProjectKanbanBoard = lazy(() => import("@/components/project/kanban-board"));

// Uso con Suspense
<Suspense fallback={<div>Cargando vista...</div>}>{activeView === "gantt" ? <ProjectGanttChart projects={projects} /> : <ProjectKanbanBoard projects={projects} />}</Suspense>;

// Dynamic imports para módulos pesados
const handleExportData = async () => {
	const { exportToExcel } = await import("@/lib/export-utils");
	exportToExcel(projects);
};
```

### 14.3 Optimización de Imágenes

```typescript
// next/image para optimización automática
import Image from "next/image";

<Image
	src="/logo.png"
	alt="Logo"
	width={200}
	height={100}
	priority // Para imágenes above-the-fold
	placeholder="blur"
	blurDataURL="data:image/jpeg;base64,..."
/>;
```

### 14.4 Virtual Scrolling para Listas Grandes

```typescript
// Para listas con muchos elementos
import { VariableSizeList as List } from "react-window";

const ProjectVirtualList = ({ projects }: { projects: Project[] }) => {
	const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
		<div style={style}>
			<ProjectCard project={projects[index]} />
		</div>
	);

	return (
		<List
			height={600}
			itemCount={projects.length}
			itemSize={() => 200} // Altura de cada item
		>
			{Row}
		</List>
	);
};
```

---

## 15. DEPLOYMENT Y DEVOPS

### 15.1 Build de Producción

```bash
# Build optimizado
pnpm build

# Verificar build
pnpm start

# Análisis del bundle
pnpm build && npx @next/bundle-analyzer
```

### 15.2 Variables de Entorno por Ambiente

```env
# .env.development
NEXT_PUBLIC_HOST=http://localhost:4141
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development

# .env.production
NEXT_PUBLIC_HOST=https://app.madrid-inmobiliaria.com
NEXT_PUBLIC_API_URL=https://api.madrid-inmobiliaria.com
NODE_ENV=production
```

### 15.3 Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 15.4 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
 push:
  branches: [main]

jobs:
 test:
  runs-on: ubuntu-latest
  steps:
   - uses: actions/checkout@v3
   - uses: actions/setup-node@v3
     with:
      node-version: 18
      cache: "pnpm"

   - run: pnpm install
   - run: pnpm test
   - run: pnpm build

 deploy:
  needs: test
  runs-on: ubuntu-latest
  steps:
   - uses: actions/checkout@v3

   - name: Deploy to production
     run: |
      # Scripts de deployment
      echo "Deploying to production..."
```

---

## 16. CONTRIBUCIÓN Y ESTÁNDARES

### 16.1 Git Workflow

```bash
# Crear feature branch
git checkout -b feature/new-project-view

# Commits con formato convencional
git commit -m "feat: add project kanban view"
git commit -m "fix: resolve project deletion bug"
git commit -m "docs: update API documentation"

# Push y Pull Request
git push origin feature/new-project-view
```

### 16.2 Convenciones de Commit

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formateo, no afecta lógica
- `refactor:` Refactoring de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

### 16.3 Code Review Checklist

- [ ] El código sigue las convenciones de TypeScript
- [ ] Los componentes están tipados correctamente
- [ ] Se manejan los estados de error y loading
- [ ] Los formularios tienen validación adecuada
- [ ] Se usan los componentes de UI existentes
- [ ] El código es accesible (a11y)
- [ ] Se agregaron tests necesarios
- [ ] La documentación está actualizada

### 16.4 Estructura de Pull Request

```markdown
## Descripción

Breve descripción de los cambios realizados.

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Actualización de documentación

## Checklist

- [ ] El código compila sin errores
- [ ] Los tests pasan
- [ ] Se actualizó la documentación
- [ ] Se probó en diferentes navegadores

## Screenshots (si aplica)

Capturas de pantalla de los cambios en la UI.
```

### 16.5 Documentación de Componentes

````typescript
/**
 * Componente para mostrar una tarjeta de proyecto
 *
 * @param project - Datos del proyecto a mostrar
 * @param onEdit - Callback cuando se edita el proyecto
 * @param onDelete - Callback cuando se elimina el proyecto
 * @param isViewer - Si true, oculta las acciones de edición
 *
 * @example
 * ```tsx
 * <ProjectCard
 *   project={project}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   isViewer={user.role === 'viewer'}
 * />
 * ```
 */
export const ProjectCard = ({ project, onEdit, onDelete, isViewer }: ProjectCardProps) => {
	// Implementación...
};
````

---

## CONCLUSIÓN

Este manual proporciona una guía completa para el desarrollo y mantenimiento del sistema de gestión de proyectos. La arquitectura modular y las convenciones establecidas permiten un desarrollo escalable y mantenible.

### Próximos Pasos

1. **Implementar React Query** para mejor gestión de cache y sincronización
2. **Agregar más tests** especialmente de integración
3. **Optimizar performance** con técnicas avanzadas
4. **Mejorar accesibilidad** según estándares WCAG
5. **Implementar PWA** para uso offline

### Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Guía de TypeScript](https://www.typescriptlang.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)

---

_Manual de Desarrollo v1.0 - Sistema de Gestión de Proyectos Madrid Inmobiliaria_
