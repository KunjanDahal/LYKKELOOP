"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Add User Form
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [addError, setAddError] = useState<string | null>(null);

  // Edit User Form
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  // Reset Password Form
  const [resetFormData, setResetFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [resetError, setResetError] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    // Validation
    if (!addFormData.name || !addFormData.email || !addFormData.password || !addFormData.confirmPassword) {
      setAddError("All fields are required");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(addFormData.email)) {
      setAddError("Invalid email format");
      return;
    }

    if (addFormData.password.length < 8) {
      setAddError("Password must be at least 8 characters");
      return;
    }

    if (addFormData.password !== addFormData.confirmPassword) {
      setAddError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addFormData.name,
          email: addFormData.email,
          password: addFormData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      showToast("User created successfully!", "success");
      setShowAddModal(false);
      setAddFormData({ name: "", email: "", password: "", confirmPassword: "" });
      fetchUsers();
    } catch (error: any) {
      setAddError(error.message || "Failed to create user");
      showToast(error.message || "Failed to create user", "error");
    }
  };

  // Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editFormData.name || editFormData.name.trim().length === 0) {
      setEditError("Name cannot be empty");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(editFormData.email)) {
      setEditError("Invalid email format");
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      showToast("User updated successfully!", "success");
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      setEditError(error.message || "Failed to update user");
      showToast(error.message || "Failed to update user", "error");
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetFormData.newPassword || !resetFormData.confirmNewPassword) {
      setResetError("Both password fields are required");
      return;
    }

    if (resetFormData.newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }

    if (resetFormData.newPassword !== resetFormData.confirmNewPassword) {
      setResetError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser?.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: resetFormData.newPassword,
          confirmNewPassword: resetFormData.confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      showToast("Password reset successfully!", "success");
      setShowResetModal(false);
      setSelectedUser(null);
      setResetFormData({ newPassword: "", confirmNewPassword: "" });
    } catch (error: any) {
      setResetError(error.message || "Failed to reset password");
      showToast(error.message || "Failed to reset password", "error");
    }
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ name: user.name, email: user.email });
    setEditError(null);
    setShowEditModal(true);
  };

  // Open Reset Modal
  const openResetModal = (user: User) => {
    setSelectedUser(user);
    setResetFormData({ newPassword: "", confirmNewPassword: "" });
    setResetError(null);
    setShowResetModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brown mb-2">Users</h1>
          <p className="text-brown/70 text-sm sm:text-base">Manage user accounts and credentials.</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setAddFormData({ name: "", email: "", password: "", confirmPassword: "" });
            setAddError(null);
          }}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-sm sm:text-base mt-4 sm:mt-0 w-full sm:w-auto"
        >
          Add user
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 sm:py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown text-sm sm:text-base"
        />
      </div>

      {/* Users - Desktop Table / Mobile Cards */}
      <div className="bg-white rounded-2xl shadow-md border border-brown/10 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-brown/70 text-sm sm:text-base">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-brown/70 text-sm sm:text-base">
            {searchTerm ? "No users found matching your search." : "No users found."}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-beige border-b border-brown/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Created</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-brown">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brown/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-beige/30 transition-colors">
                      <td className="px-6 py-4 text-brown font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-brown/80">{user.email}</td>
                      <td className="px-6 py-4 text-brown/70 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="px-4 py-2 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openResetModal(user)}
                            className="px-4 py-2 bg-rose/20 text-rose rounded-full hover:bg-rose/30 transition-colors font-medium text-sm"
                          >
                            Reset password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-brown/10">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-beige/30 transition-colors">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-brown text-sm sm:text-base mb-1">{user.name}</h3>
                      <p className="text-brown/70 text-xs sm:text-sm break-all">{user.email}</p>
                      <p className="text-brown/60 text-xs mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1.5 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-xs sm:text-sm flex-1 min-w-[80px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openResetModal(user)}
                        className="px-3 py-1.5 bg-rose/20 text-rose rounded-full hover:bg-rose/30 transition-colors font-medium text-xs sm:text-sm flex-1 min-w-[120px]"
                      >
                        Reset password
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal
          title="Add User"
          onClose={() => {
            setShowAddModal(false);
            setAddError(null);
          }}
        >
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Name</label>
              <input
                type="text"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Email</label>
              <input
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Password</label>
              <input
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Confirm Password</label>
              <input
                type="password"
                value={addFormData.confirmPassword}
                onChange={(e) => setAddFormData({ ...addFormData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {addError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-sm sm:text-base"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError(null);
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal
          title="Edit User"
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            setEditError(null);
          }}
        >
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {editError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-sm sm:text-base"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setEditError(null);
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <Modal
          title={`Reset Password for ${selectedUser.name}`}
          onClose={() => {
            setShowResetModal(false);
            setSelectedUser(null);
            setResetError(null);
          }}
        >
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-brown/70 text-sm mb-4">
              Enter a new password for this user. The current password will not be shown.
            </p>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">New Password</label>
              <input
                type="password"
                value={resetFormData.newPassword}
                onChange={(e) => setResetFormData({ ...resetFormData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                placeholder="Enter new password (min 8 characters)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Confirm New Password</label>
              <input
                type="password"
                value={resetFormData.confirmNewPassword}
                onChange={(e) =>
                  setResetFormData({ ...resetFormData, confirmNewPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                placeholder="Confirm new password"
                required
              />
            </div>
            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {resetError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-sm sm:text-base"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedUser(null);
                  setResetError(null);
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-brown/70 hover:text-brown transition-colors z-10"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-brown mb-4 sm:mb-6 pr-8">{title}</h2>
        {children}
      </div>
    </div>
  );
}


