import api from './api';
import { User } from '../types';

export const usersService = {
  search: async (query: string): Promise<User[]> => {
    const response = await api.get('/auth/users/', { params: { q: query } });
    return response.data;
  },
};

export default usersService;
