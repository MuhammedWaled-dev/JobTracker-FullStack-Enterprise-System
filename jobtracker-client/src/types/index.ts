// Enums
export const Role = {
  Admin: 'Admin',
  User: 'User'
} as const;
export type Role = typeof Role[keyof typeof Role];

export const TaskStatus = {
  Todo: 'Todo',
  Doing: 'Doing',
  Done: 'Done'
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// Entities & DTOs
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedUserId: string | null;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  projectId: string;
  assignedUserId: string | null;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

// Auth Responses
export interface AuthResponse {
  token: string;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginUserDto {
  email: string;
  password: string;
}
