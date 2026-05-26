import api from './api';
import type { ProjectDto, CreateProjectDto } from '../types';

export const projectService = {
  getAll: async (): Promise<ProjectDto[]> => {
    const response = await api.get<ProjectDto[]>('/projects');
    return response.data;
  },

  getById: async (id: string): Promise<ProjectDto> => {
    const response = await api.get<ProjectDto>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectDto): Promise<ProjectDto> => {
    const response = await api.post<ProjectDto>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: CreateProjectDto): Promise<void> => {
    await api.put(`/projects/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};
