import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { institutionsApi, type Institution } from '../api/institutions.ts';
import { studentsApi } from '../api/students.ts';
import { attendanceApi } from '../api/attendance.ts';
import Loader from '../components/common/Loader.tsx';
import { todayISO } from '../utils/helpers.ts';

interface Stats {
  totalInstitutions: number;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className={`rounded-xl border ${color} bg-white p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const instRes = await institutionsApi.getAll({ limit: 100 });
        const instList = instRes.institutions;
        setInstitutions(instList.slice(0, 5));

        let totalStudents = 0;
        let presentToday = 0;
        let absentToday = 0;

        await Promise.all(
          instList.map(async (inst) => {
            const [stuRes, attRes] = await Promise.all([
              studentsApi.getByInstitution(inst._id, { limit: 1 }),
              attendanceApi.getByDate(inst._id, todayISO()).catch(() => ({ students: [] })),
            ]);
            totalStudents += stuRes.total;
            attRes.students?.forEach((s) => {
              if (s.status === 'Present') presentToday++;
              else if (s.status === 'Absent') absentToday++;
            });
          })
        );

        setStats({
          totalInstitutions: instRes.total,
          totalStudents,
          presentToday,
          absentToday,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Institutions" value={stats?.totalInstitutions ?? 0} icon="🏫" color="border-blue-200" />
        <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon="👨‍🎓" color="border-purple-200" />
        <StatCard label="Present Today" value={stats?.presentToday ?? 0} icon="✅" color="border-green-200" />
        <StatCard label="Absent Today" value={stats?.absentToday ?? 0} icon="❌" color="border-red-200" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { to: '/institutions', label: 'Manage Institutions', icon: '🏫', desc: 'Add, edit, delete institutions' },
          { to: '/attendance', label: 'Mark Attendance', icon: '✅', desc: 'Record today\'s attendance' },
          { to: '/attendance/report', label: 'View Reports', icon: '📊', desc: 'Analyse attendance trends' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5
              shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-slate-800">{item.label}</p>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent institutions */}
      {institutions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-800">Recent Institutions</h2>
            <Link to="/institutions" className="text-sm text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {institutions.map((inst) => (
              <li key={inst._id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="font-medium text-slate-800">{inst.name}</p>
                  <p className="text-xs text-slate-500">{inst.address}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {inst.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
