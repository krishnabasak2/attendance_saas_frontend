import api from './axios.ts';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data as { token: string; admin: { _id: string; name: string; email: string } };
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.data as { _id: string; name: string; email: string };
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};
