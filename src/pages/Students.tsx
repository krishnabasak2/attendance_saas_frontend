import { useEffect, useState, useCallback, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsApi, type Student } from '../api/students.ts';
import { institutionsApi, type Institution } from '../api/institutions.ts';
import Avatar from '../components/common/Avatar.tsx';
import Loader from '../components/common/Loader.tsx';
import Modal from '../components/common/Modal.tsx';
import Pagination from '../components/common/Pagination.tsx';
import ConfirmDialog from '../components/common/ConfirmDialog.tsx';
import { formatDate, getErrorMessage } from '../utils/helpers.ts';

const emptyForm = { rollNo: '', name: '', email: '', phone: '' };

export default function Students() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const fetchData = useCallback(async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const [instData, stuData] = await Promise.all([
        institutionsApi.getOne(institutionId),
        studentsApi.getByInstitution(institutionId, { page, limit, search }),
      ]);
      setInstitution(instData);
      setStudents(stuData.students);
      setTotal(stuData.total);
      setPages(stuData.pages);
    } finally {
      setLoading(false);
    }
  }, [institutionId, page, limit, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ rollNo: s.rollNo, name: s.name, email: s.email, phone: s.phone });
    setImageFile(null);
    setImagePreview(s.profileImage ?? null);
    setFormError('');
    setModalOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!institutionId) return;
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, profileImage: imageFile ?? undefined };
      if (editing) {
        await studentsApi.update(institutionId, editing._id, payload);
      } else {
        await studentsApi.create(institutionId, payload);
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
    if (!deleteTarget || !institutionId) return;
    try {
      await studentsApi.delete(institutionId, deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate('/institutions')} className="hover:text-indigo-600">
          Institutions
        </button>
        <span>/</span>
        <span className="font-medium text-slate-800">{institution?.name ?? '…'}</span>
        {institution?.code && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
            {institution.code}
          </span>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search by name, roll no, email or phone…"
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
          + Add Student
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <Loader />
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            {search ? 'No students match your search.' : 'No students yet. Add one!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Roll No</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 hidden md:table-cell">Phone</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Enrolled</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono font-semibold text-slate-700">
                        {s.rollNo}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={s.profileImage} name={s.name} size="md" />
                        <span className="font-medium text-slate-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600 hidden sm:table-cell">{s.email}</td>
                    <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{s.phone}</td>
                    <td className="px-6 py-3 text-slate-500 hidden lg:table-cell">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium
                            text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
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

        {!loading && students.length > 0 && (
          <div className="px-6 pb-4">
            <Pagination page={page} pages={pages} total={total} limit={limit} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit Student' : 'Enroll Student'}
        onClose={() => setModalOpen(false)}
        size="md"
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile image picker */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-200"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                  👤
                </div>
              )}
              {imagePreview && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center
                    rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-700">Profile Photo</p>
              <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5
                text-xs font-medium text-slate-600 hover:bg-slate-50">
                {imagePreview ? 'Change photo' : 'Upload photo'}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP — max 2 MB</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Roll Number</label>
              <input
                type="text"
                value={form.rollNo}
                onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))}
                required
                placeholder="e.g. CS2024001"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                  outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                  outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="john@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

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
              {saving ? 'Saving…' : editing ? 'Update' : 'Enroll'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Student"
        message={`Remove "${deleteTarget?.name}" (${deleteTarget?.rollNo})? All attendance records will be permanently deleted.`}
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
