import api from './api';

export const profileService = {
  updateProfile: async (data: {
    bio?: string;
    batch?: string;
    department?: string;
  }) => {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },
};