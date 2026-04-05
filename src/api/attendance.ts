import api from './axios.ts';

export interface AttendanceRecord {
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  status: 'Present' | 'Absent' | null;
}

export interface DailySummary {
  date: string;
  present: number;
  absent: number;
  records: {
    student: { _id: string; rollNo: string; name: string; email: string; profileImage: string | null };
    status: string;
  }[];
}

export interface AttendanceReport {
  institution: { _id: string; name: string; code: string };
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  totalRecords: number;
  attendanceRate: string;
  dailySummary: DailySummary[];
}

export const attendanceApi = {
  getByDate: async (institutionId: string, date: string) => {
    const { data } = await api.get('/attendance', { params: { institutionId, date } });
    return data.data as { date: string; students: AttendanceRecord[] };
  },

  mark: async (payload: {
    institutionId: string;
    date: string;
    records: { studentId: string; status: 'Present' | 'Absent' }[];
  }) => {
    const { data } = await api.post('/attendance', payload);
    return data;
  },

  markSingle: async (payload: {
    studentId: string;
    institutionId: string;
    date: string;
    status: 'Present' | 'Absent';
  }) => {
    const { data } = await api.post('/attendance/single', payload);
    return data;
  },

  getReport: async (params: {
    institutionId: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const { data } = await api.get('/attendance/report', { params });
    return data.data as AttendanceReport;
  },
};
