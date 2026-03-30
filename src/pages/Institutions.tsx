import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { institutionsApi, type Institution } from '../api/institutions.ts';
import Loader from '../components/common/Loader.tsx';
import Modal from '../components/common/Modal.tsx';
import Pagination from '../components/common/Pagination.tsx';
import ConfirmDialog from '../components/common/ConfirmDialog.tsx';
import { formatDate, getErrorMessage } from '../utils/helpers.ts';

const emptyForm = { name: '', code: '', address: '' };

export default function Institutions() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await institutionsApi.getAll({ page, limit, search });
      setInstitutions(res.institutions);
      setTotal(res.total);
      setPages(res.pages);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (inst: Institution) => {
    setEditing(inst);
    setForm({ name: inst.name, code: inst.code, address: inst.address });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await institutionsApi.update(editing._id, form);
      } else {
        await institutionsApi.create(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await institutionsApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none
            focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:max-w-xs"
        />
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
            text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Institution
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <Loader />
        ) : institutions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            {search ? 'No institutions match your search.' : 'No institutions yet. Create one!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3 hidden md:table-cell">Address</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institutions.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{inst.name}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        {inst.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 hidden md:table-cell max-w-xs truncate">
                      {inst.address}
                    </td>
                    <td className="px-6 py-4 text-slate-500 hidden lg:table-cell">
                      {formatDate(inst.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => navigate(`/institutions/${inst._id}/students`)}
                          className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium
                            text-slate-700 hover:bg-slate-200"
                        >
                          Students
                        </button>
                        <button
                          onClick={() => openEdit(inst)}
                          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium
                            text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(inst)}
                          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium
                            text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && institutions.length > 0 && (
          <div className="px-6 pb-4">
            <Pagination page={page} pages={pages} total={total} limit={limit} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit Institution' : 'Add Institution'}
        onClose={() => setModalOpen(false)}
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name', 'code', 'address'] as const).map((field) => (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium capitalize text-slate-700">
                {field}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required
                placeholder={field === 'code' ? 'e.g. MIT001' : ''}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                  outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium
                text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold
                text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Institution"
        message={`Delete "${deleteTarget?.name}"? All students and attendance records will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
