import api from './api';
import type { RegisterUserDto, LoginUserDto, AuthResponse } from '../types';

export const authService = {
  register: async (data: RegisterUserDto): Promise<void> => {
    await api.post('/auth/register', data);
  },

  login: async (data: LoginUserDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }
};
