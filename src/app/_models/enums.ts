export enum RoleType {
	SUPERADMIN = 0,
	GROUPADMIN = 1,
	SCHOOLADMIN = 2,
	REVIEWER = 3,
	TEACHER = 4
}

export enum LengthType {
	OBJECTIVE = 0,
	SHORT = 1,
	BRIEF = 2,
	LONG = 3
}

export enum DifficultyType {
	EASY = 0,
	MEDIUM = 1,
	HARD = 2
}

export enum ResponseStatus {
	SUCCESS = 204,
	ERROR = 402,
	FORBIDDEN = 403
}
export enum QuestionStatus {
	NEW = 0,
	TRANSIT = 1,
	REMOVE = 2,
	APPROVED = 3,
	REJECTED = 4,
	PENDING = 5,
	OBSOLETE = 6
}

export enum TestPaperStatus {
	DRAFT = 0,
	RELEASE = 1
}
