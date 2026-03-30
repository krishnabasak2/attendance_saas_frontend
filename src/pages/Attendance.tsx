import { useEffect, useState } from 'react';
import { institutionsApi, type Institution } from '../api/institutions.ts';
import { attendanceApi, type AttendanceRecord } from '../api/attendance.ts';
import Avatar from '../components/common/Avatar.tsx';
import Loader from '../components/common/Loader.tsx';
import { todayISO, getErrorMessage } from '../utils/helpers.ts';

export default function Attendance() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [date, setDate] = useState(todayISO());
  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  const [statuses, setStatuses] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    institutionsApi.getAll({ limit: 100 }).then((res) => {
      setInstitutions(res.institutions);
      if (res.institutions.length === 1) setSelectedInstitution(res.institutions[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedInstitution || !date) return;
    setLoadingStudents(true);
    setMessage('');
    setError('');
    attendanceApi
      .getByDate(selectedInstitution, date)
      .then((res) => {
        setStudents(res.students);
        const map: Record<string, 'Present' | 'Absent'> = {};
        res.students.forEach((s) => {
          if (s.status) map[s.studentId] = s.status;
        });
        setStatuses(map);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingStudents(false));
  }, [selectedInstitution, date]);

  const setAll = (status: 'Present' | 'Absent') => {
    const map: Record<string, 'Present' | 'Absent'> = {};
    students.forEach((s) => { map[s.studentId] = status; });
    setStatuses(map);
  };

  const handleSave = async () => {
    const records = students.map((s) => ({
      studentId: s.studentId,
      status: statuses[s.studentId] || 'Absent',
    }));
    if (records.length === 0) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await attendanceApi.mark({ institutionId: selectedInstitution, date, records });
      setMessage(`Attendance saved for ${records.length} student(s)!`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => statuses[s.studentId] === 'Present').length;
  const absentCount  = students.filter((s) => statuses[s.studentId] === 'Absent').length;
  const unmarkedCount = students.length - presentCount - absentCount;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Institution</label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select institution…</option>
              {institutions.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name} ({i.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {selectedInstitution && date && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loadingStudents ? (
            <Loader text="Loading students…" />
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No students in this institution. Add students first.
            </div>
          ) : (
            <>
              {/* Summary + bulk actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
                <div className="flex gap-4 text-sm">
                  <span className="font-medium text-slate-700">{students.length} students</span>
                  <span className="text-green-600 font-semibold">✅ {presentCount}</span>
                  <span className="text-red-500 font-semibold">❌ {absentCount}</span>
                  {unmarkedCount > 0 && (
                    <span className="text-slate-400">⬜ {unmarkedCount} unmarked</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAll('Present')}
                    className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold
                      text-green-700 hover:bg-green-100"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => setAll('Absent')}
                    className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold
                      text-red-700 hover:bg-red-100"
                  >
                    All Absent
                  </button>
                </div>
              </div>

              {/* Student rows */}
              <ul className="divide-y divide-slate-100">
                {students.map((s) => {
                  const status = statuses[s.studentId];
                  return (
                    <li
                      key={s.studentId}
                      className={`flex items-center justify-between px-5 py-3 transition-colors
                        ${status === 'Present'
                          ? 'bg-green-50/50'
                          : status === 'Absent'
                          ? 'bg-red-50/50'
                          : 'hover:bg-slate-50'
                        }`}
                    >
                      {/* Left: avatar + info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={s.profileImage} name={s.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-400">
                              {s.rollNo}
                            </span>
                            <span className="font-medium text-slate-800 truncate">{s.name}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{s.email}</p>
                        </div>
                      </div>

                      {/* Right: Present / Absent toggles */}
                      <div className="flex flex-shrink-0 gap-2 ml-3">
                        <button
                          onClick={() =>
                            setStatuses((p) => ({ ...p, [s.studentId]: 'Present' }))
                          }
                          className={`min-w-20 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors
                            ${status === 'Present'
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700'
                            }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() =>
                            setStatuses((p) => ({ ...p, [s.studentId]: 'Absent' }))
                          }
                          className={`min-w-20 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors
                            ${status === 'Absent'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                            }`}
                        >
                          Absent
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Save */}
              <div className="border-t border-slate-200 px-6 py-4">
                <button
                  onClick={handleSave}
                  disabled={saving || students.length === 0}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold
                    text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
