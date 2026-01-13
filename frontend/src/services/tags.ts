import api from './api';

export const tagsService = {
  getAll: async () => {
    const response = await api.get('/tags/');
    return response.data;
  },

  getPopular: async () => {
    const response = await api.get('/tags/popular/');
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get('/tags/search/', { params: { q: query } });
    return response.data;
  },

  addToImage: async (imageId: number, tagName: string) => {
    const response = await api.post(`/images/${imageId}/add_tag/`, {
      tag_name: tagName,
    });
    return response.data;
  },


  addUserToImage: async (imageId: number, userId: number) => {
    const response = await api.post(`/images/${imageId}/add_user_tag/`, {
      user_id: userId,
    });
    return response.data;
  },

  removeUserFromImage: async (imageId: number, userId: number) => {
    const response = await api.delete(`/images/${imageId}/remove_user_tag/`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  removeFromImage: async (imageId: number, tagId: number) => {
    const response = await api.delete(`/images/${imageId}/remove_tag/`, {
      params: { tag_id: tagId },
    });
    return response.data;
  },
};