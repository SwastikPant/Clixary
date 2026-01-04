import api from './api';
import { Image } from '../types';

export const imagesService = {
  getAll: async (params?: any): Promise<any> => {
    const response = await api.get('/images/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  getById: async (id: number) => {
    const response = await api.get(`/images/${id}/`);
    return response.data;
  },

  getMyFavorites: async (): Promise<any> => {
    const response = await api.get('/images/my_favorites/');
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  getMyUploads: async (): Promise<any> => {
    const response = await api.get('/images/my_uploads/');
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  upload: async (formData: FormData) => {
    const response = await api.post('/images/bulk_upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  like: async (id: number) => {
    const response = await api.post(`/images/${id}/like/`);
    return response.data;
  },

  favorite: async (id: number) => {
    const response = await api.post(`/images/${id}/favorite/`);
    return response.data;
  },
};