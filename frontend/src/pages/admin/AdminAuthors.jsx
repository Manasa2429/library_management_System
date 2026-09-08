import React, { useEffect, useState } from "react";
import { authorService } from "../../services/authorService";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { FeatherIcon, PlusIcon, Edit3Icon, Trash2Icon, XIcon } from "../../components/Icons";

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [formData, setFormData] = useState({ name: "", biography: "" });
  const [submitting, setSubmitting] = useState(false);

  const [deleteAuthor, setDeleteAuthor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { addToast } = useToast();

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const data = await authorService.getAllWithCounts();
      setAuthors(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load authors", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const openAddModal = () => {
    setEditingAuthor(null);
    setFormData({ name: "", biography: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (a) => {
    setEditingAuthor(a);
    setFormData({ name: a.name || "", biography: a.biography || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAuthor) {
        await authorService.update(editingAuthor.id, formData);
        addToast(`Author "${formData.name}" updated!`, "success");
      } else {
        await authorService.create(formData);
        addToast(`Author "${formData.name}" added!`, "success");
      }
      setIsModalOpen(false);
      await loadAuthors();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save author";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAuthor) return;
    try {
      await authorService.delete(deleteAuthor.id);
      addToast(`Author "${deleteAuthor.name}" removed.`, "info");
      setIsDeleteModalOpen(false);
      setDeleteAuthor(null);
      await loadAuthors();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete author";
      addToast(msg, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Author Directory</h1>
          <p className="text-slate-300 text-sm mt-1">Manage author profiles and catalog contributions.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" /> Add Author
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-pulse h-16"></div>
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
          <FeatherIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Authors Listed</h3>
          <p className="text-xs text-slate-400 mt-1">Add authors to link them to books.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Author Name</th>
                  <th className="px-6 py-4">Biography</th>
                  <th className="px-6 py-4">Published Titles</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {authors.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-bold text-white">{a.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-md truncate">
                      {a.biography || "No biography available."}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {a.bookCount || 0} books
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(a)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Author"
                        >
                          <Edit3Icon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteAuthor(a);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete Author"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingAuthor ? "Edit Author" : "Add New Author"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Robert C. Martin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Biography / Notes
                </label>
                <textarea
                  rows="3"
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Notable background or accomplishments..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingAuthor ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Author"
        message={`Delete author "${deleteAuthor?.name}"?`}
        confirmText="Delete Author"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteAuthor(null);
        }}
      />
    </div>
  );
}
