import api from './axios.ts';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  rollNo?: string;
  institutionId?: string;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, admin } = data.data as { token: string; admin: AuthUser };
    return { token, user: admin };
  },

  studentLogin: async (email: string, password: string) => {
    const { data } = await api.post('/auth/student/login', { email, password });
    const { token, student } = data.data as { token: string; student: AuthUser };
    return { token, user: student };
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.data as AuthUser;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};
