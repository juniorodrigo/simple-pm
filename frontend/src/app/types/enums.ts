export enum ActivityStatus {
	PENDING = "pending",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
}

export enum ActivityPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
}

export enum Role {
	EDITOR = "editor",
	ADMIN = "admin",
	VIEWER = "viewer",
}

export enum UserActionType {
	LOGIN = "login",
	LOGOUT = "logout",
	CREATE_PROJECT = "create_project",
}

export enum Colors {
	RED = "red",
	GREEN = "green",
	BLUE = "blue",
	YELLOW = "yellow",
	PURPLE = "purple",
	ORANGE = "orange",
	PINK = "pink",
	BROWN = "brown",
	GRAY = "gray",
	WHITE = "white",
	CYAN = "cyan",
	CORAL = "coral",
}

export enum ProjectStatus {
	ACTIVE = "active",
	COMPLETED = "completed",
	ON_HOLD = "on_hold",
	CANCELLED = "cancelled",
}
