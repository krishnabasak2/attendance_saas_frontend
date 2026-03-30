import api from './axios.ts';

export interface Institution {
  _id: string;
  name: string;
  code: string;
  address: string;
  createdAt: string;
}

export interface InstitutionListResponse {
  institutions: Institution[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export const institutionsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get('/institutions', { params });
    return data.data as InstitutionListResponse;
  },

  getOne: async (id: string) => {
    const { data } = await api.get(`/institutions/${id}`);
    return data.data as Institution;
  },

  getStats: async (id: string) => {
    const { data } = await api.get(`/institutions/${id}/stats`);
    return data.data as {
      institution: Institution;
      totalStudents: number;
      presentToday: number;
      absentToday: number;
      markedToday: number;
    };
  },

  create: async (payload: Pick<Institution, 'name' | 'code' | 'address'>) => {
    const { data } = await api.post('/institutions', payload);
    return data.data as Institution;
  },

  update: async (id: string, payload: Partial<Pick<Institution, 'name' | 'code' | 'address'>>) => {
    const { data } = await api.put(`/institutions/${id}`, payload);
    return data.data as Institution;
  },

  delete: async (id: string) => {
    await api.delete(`/institutions/${id}`);
  },
};
