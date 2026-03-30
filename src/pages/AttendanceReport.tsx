import { useEffect, useState } from 'react';
import { institutionsApi, type Institution } from '../api/institutions.ts';
import { attendanceApi, type AttendanceReport, type DailySummary } from '../api/attendance.ts';
import Loader from '../components/common/Loader.tsx';
import { todayISO, formatDate, getErrorMessage } from '../utils/helpers.ts';

function getFirstOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

export default function AttendanceReport() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionId, setInstitutionId] = useState('');
  const [startDate, setStartDate] = useState(getFirstOfMonth());
  const [endDate, setEndDate] = useState(todayISO());

  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    institutionsApi.getAll({ limit: 100 }).then((res) => {
      setInstitutions(res.institutions);
      if (res.institutions.length === 1) setInstitutionId(res.institutions[0]._id);
    });
  }, []);

  const fetchReport = async () => {
    if (!institutionId) return;
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const data = await attendanceApi.getReport({ institutionId, startDate, endDate });
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Filter
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Institution</label>
            <select
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select…</option>
              {institutions.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name} ({i.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">From</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={todayISO()}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={!institutionId || loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold
                text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Loading…' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <Loader text="Generating report…" />}

      {report && !loading && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: 'Institution', value: report.institution.name, sub: report.institution.code, color: 'border-blue-200' },
              { label: 'Total Students', value: report.totalStudents, color: 'border-purple-200' },
              { label: 'Total Present', value: report.presentCount, color: 'border-green-200' },
              { label: 'Total Absent', value: report.absentCount, color: 'border-red-200' },
              { label: 'Attendance Rate', value: `${report.attendanceRate}%`, color: 'border-yellow-200' },
            ].map((card) => (
              <div key={card.label} className={`rounded-xl border ${card.color} bg-white p-4 shadow-sm`}>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-800 truncate">{card.value}</p>
                {card.sub && <p className="text-xs text-slate-400">{card.sub}</p>}
              </div>
            ))}
          </div>

          {/* Attendance rate bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex justify-between text-sm font-medium text-slate-700">
              <span>Overall Attendance Rate</span>
              <span>{report.attendanceRate}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-500"
                style={{ width: `${report.attendanceRate}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>{report.presentCount} present</span>
              <span>{report.absentCount} absent</span>
            </div>
          </div>

          {/* Daily breakdown */}
          {report.dailySummary.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-semibold text-slate-800">
                  Daily Breakdown ({report.dailySummary.length} days)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Present</th>
                      <th className="px-6 py-3">Absent</th>
                      <th className="px-6 py-3">Rate</th>
                      <th className="px-6 py-3">Breakdown</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.dailySummary.map((day: DailySummary) => {
                      const total = day.present + day.absent;
                      const rate = total > 0 ? ((day.present / total) * 100).toFixed(0) : '0';
                      const isExpanded = expandedDate === day.date;
                      return (
                        <>
                          <tr key={day.date} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-800">
                              {formatDate(day.date)}
                            </td>
                            <td className="px-6 py-3 text-green-600 font-semibold">{day.present}</td>
                            <td className="px-6 py-3 text-red-500 font-semibold">{day.absent}</td>
                            <td className="px-6 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold
                                  ${Number(rate) >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                              >
                                {rate}%
                              </span>
                            </td>
                            <td className="px-6 py-3 w-40">
                              <div className="flex h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="bg-green-500"
                                  style={{ width: `${(day.present / (total || 1)) * 100}%` }}
                                />
                                <div
                                  className="bg-red-400"
                                  style={{ width: `${(day.absent / (total || 1)) * 100}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <button
                                onClick={() => setExpandedDate(isExpanded ? null : day.date)}
                                className="text-xs text-indigo-600 hover:underline"
                              >
                                {isExpanded ? 'Hide' : 'Details'}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${day.date}-details`}>
                              <td colSpan={6} className="bg-slate-50 px-8 py-3">
                                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
                                  {day.records.map((r, i) => (
                                    <div
                                      key={i}
                                      className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs
                                        ${r.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                      <span>{r.status === 'Present' ? '✅' : '❌'}</span>
                                      <span className="truncate">{r.student?.name ?? '—'}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-400 shadow-sm">
              No attendance records found for the selected date range.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
