export enum ActivityStatus {
	TODO = "pending",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	DONE = "completed",
}

export enum ActivityPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	CRITICAL = "critical",
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
	AMBER = "amber",
	VIOLET = "violet",
	ROSE = "rose",
	GRAY = "gray",
}

export enum ProjectStatus {
	ACTIVE = "active",
	COMPLETED = "completed",
	ON_HOLD = "on_hold",
	CANCELLED = "cancelled",
}
