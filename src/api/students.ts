import api from './axios.ts';

export interface Student {
  _id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  institutionId: { _id: string; name: string; code: string } | string;
  createdAt: string;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface StudentFormData {
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: File | null;
}

function buildFormData(payload: Partial<StudentFormData>): FormData {
  const fd = new FormData();
  if (payload.rollNo !== undefined) fd.append('rollNo', payload.rollNo);
  if (payload.name !== undefined) fd.append('name', payload.name);
  if (payload.email !== undefined) fd.append('email', payload.email);
  if (payload.phone !== undefined) fd.append('phone', payload.phone);
  if (payload.profileImage) fd.append('profileImage', payload.profileImage);
  return fd;
}

export const studentsApi = {
  getByInstitution: async (
    institutionId: string,
    params?: { page?: number; limit?: number; search?: string }
  ) => {
    const { data } = await api.get(`/institutions/${institutionId}/students`, { params });
    return data.data as StudentListResponse;
  },

  getOne: async (institutionId: string, studentId: string) => {
    const { data } = await api.get(`/institutions/${institutionId}/students/${studentId}`);
    return data.data as Student;
  },

  create: async (institutionId: string, payload: StudentFormData) => {
    const { data } = await api.post(
      `/institutions/${institutionId}/students`,
      buildFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.data as Student;
  },

  update: async (institutionId: string, studentId: string, payload: Partial<StudentFormData>) => {
    const { data } = await api.put(
      `/institutions/${institutionId}/students/${studentId}`,
      buildFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.data as Student;
  },

  delete: async (institutionId: string, studentId: string) => {
    await api.delete(`/institutions/${institutionId}/students/${studentId}`);
  },
};
