import api from './api';
import type { TaskDto, CreateTaskDto, UpdateTaskStatusDto } from '../types';

export const taskService = {
  getAll: async (): Promise<TaskDto[]> => {
    const response = await api.get<TaskDto[]>('/tasks');
    return response.data;
  },

  getByProjectId: async (projectId: string): Promise<TaskDto[]> => {
    const response = await api.get<TaskDto[]>(`/tasks/project/${projectId}`);
    return response.data;
  },

  getAssignedTasks: async (): Promise<TaskDto[]> => {
    const response = await api.get<TaskDto[]>('/tasks/assigned');
    return response.data;
  },

  getById: async (id: string): Promise<TaskDto> => {
    const response = await api.get<TaskDto>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskDto): Promise<TaskDto> => {
    const response = await api.post<TaskDto>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: { title: string; description: string }): Promise<void> => {
    await api.put(`/tasks/${id}`, data);
  },

  updateStatus: async (id: string, data: UpdateTaskStatusDto): Promise<void> => {
    await api.patch(`/tasks/${id}/status`, data);
  },

  assignUser: async (id: string, userId: string): Promise<void> => {
    // Boş string gelirse null gönder (Backend Guid? bekliyor)
    await api.patch(`/tasks/${id}/assign`, { assignedUserId: userId || null });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  }
};
