import React, { useEffect, useState } from "react";
import { userService } from "../../services/fineService";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { UsersIcon, EyeIcon, XIcon, Trash2Icon } from "../../components/Icons";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [toggleTarget, setToggleTarget] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { addToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openUserDetails = async (userSummary) => {
    setSelectedUser(userSummary);
    setIsDetailModalOpen(true);
    setDetailsLoading(true);
    try {
      const details = await userService.getDetails(userSummary.id);
      setUserDetails(details);
    } catch (err) {
      addToast("Failed to load user records", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    try {
      const updated = await userService.toggleStatus(toggleTarget.id);
      addToast(
        `User "${toggleTarget.name}" account is now ${updated.active ? "Active" : "Blocked"}.`,
        "success"
      );
      setIsConfirmOpen(false);
      setToggleTarget(null);
      await loadUsers();
    } catch (err) {
      addToast("Failed to change account status", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await userService.delete(deleteTarget.id);
      addToast(`User "${deleteTarget.name}" has been permanently deleted.`, "success");
      setIsDeleteConfirmOpen(false);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to delete user";
      addToast(errMsg, "error");
    }
  };

  const filteredUsers = users.filter((u) => {
    return (
      !searchQuery.trim() ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">User Management</h1>
          <p className="text-slate-300 text-sm mt-1">Review reader accounts, loan counts, account states, and history.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter users by name, email, or phone number..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-pulse h-16"></div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
          <UsersIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Users Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Active Borrows</th>
                  <th className="px-6 py-4">Overdue</th>
                  <th className="px-6 py-4">Unpaid Fines</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-xs text-slate-400">{u.email}</span>
                        {u.phone && <span className="text-[11px] text-slate-500 block font-mono">{u.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        u.role === "ROLE_ADMIN"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}>
                        {u.role === "ROLE_ADMIN" ? "ADMIN" : "USER"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white">
                      {u.activeBorrowsCount || 0}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {u.overdueCount > 0 ? (
                        <span className="font-bold text-rose-400">{u.overdueCount}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">
                      {u.unpaidFinesTotal > 0 ? (
                        <span className="text-rose-400">₹{u.unpaidFinesTotal.toFixed(0)}</span>
                      ) : (
                        <span className="text-emerald-400">₹0</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        u.active
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {u.active ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openUserDetails(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                          title="View Records"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {u.role !== "ROLE_ADMIN" && (
                          <>
                            <button
                              onClick={() => {
                                setToggleTarget(u);
                                setIsConfirmOpen(true);
                              }}
                              className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                                u.active
                                  ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20"
                                  : "text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                              }`}
                            >
                              {u.active ? "Block" : "Activate"}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(u);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete User"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUser?.name}</h3>
                <p className="text-xs text-slate-400">{selectedUser?.email}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center text-slate-400">Loading user history...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    Active Book Loans
                  </h4>
                  {userDetails?.activeBorrows?.length === 0 ? (
                    <p className="text-xs text-slate-400">No books currently borrowed.</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetails?.activeBorrows?.map((b) => (
                        <div key={b.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{b.bookTitle}</span>
                          <span className="text-slate-400">Due: {b.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    Borrowing History
                  </h4>
                  {userDetails?.historyBorrows?.length === 0 ? (
                    <p className="text-xs text-slate-400">No completed loans.</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetails?.historyBorrows?.map((b) => (
                        <div key={b.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">{b.bookTitle}</span>
                          <span className="text-slate-400">Returned: {b.returnDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Block/Activate Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={toggleTarget?.active ? "Block User Account" : "Activate User Account"}
        message={
          toggleTarget?.active
            ? `Are you sure you want to block ${toggleTarget?.name}? They will be prevented from signing in and borrowing books.`
            : `Reactivate account for ${toggleTarget?.name}? They will be able to sign in normally.`
        }
        confirmText={toggleTarget?.active ? "Block Account" : "Activate Account"}
        isDanger={toggleTarget?.active}
        onConfirm={handleToggleStatus}
        onCancel={() => {
          setIsConfirmOpen(false);
          setToggleTarget(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${deleteTarget?.name}" (${deleteTarget?.email})? All their reservations, fines, and account records will be removed. This action cannot be undone.`}
        confirmText="Delete User"
        isDanger={true}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
