"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function ProfilePage() {
  const { user, loading, updateName, changePassword } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/name-login?redirect=/profile");
    } else if (user) {
      setName(user.name);
    }
  }, [user, loading, router]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setNameError("Name cannot be empty");
      return;
    }

    setNameError(null);
    setIsEditingName(false);

    try {
      await updateName(name.trim());
      setNameSuccess(true);
      showToast("Name updated successfully!", "success");
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update name";
      setNameError(errorMessage);
      showToast(errorMessage, "error");
      setIsEditingName(true);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmNewPassword
      );
      setPasswordSuccess(true);
      showToast("Password changed successfully!", "success");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to change password";
      setPasswordError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-brown">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-brown mb-8">Profile</h1>

        {/* Name Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-brown/10 mb-6">
          <h2 className="text-2xl font-semibold text-brown mb-4">Edit Name</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-2">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg bg-beige/50 text-brown/70 cursor-not-allowed"
              />
              <p className="text-xs text-brown/60 mt-1">
                {user.email ? "Email cannot be changed" : "No email (name-only account)"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-2">Name</label>
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                    placeholder="Enter your name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateName}
                      className="px-4 py-2 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
                    >
                      Save changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setName(user.name);
                        setNameError(null);
                      }}
                      className="px-4 py-2 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-brown font-medium">{user.name}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="px-4 py-2 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
              {nameError && (
                <p className="text-red-500 text-sm mt-2">{nameError}</p>
              )}
              {nameSuccess && (
                <p className="text-green-600 text-sm mt-2">Name updated successfully!</p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-brown/10">
          <h2 className="text-2xl font-semibold text-brown mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                placeholder="Enter new password (min 8 characters)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                placeholder="Confirm new password"
                required
              />
            </div>
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Password updated successfully!
              </div>
            )}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}

