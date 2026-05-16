"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError("Current password is required to set a new password.");
        return;
      }
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile.");
      } else {
        setSuccess("Profile updated successfully.");
        // Update session
        update({ name });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge badge-slate !px-4 !py-2 !text-sm">Account Settings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Profile</h1>
        </div>
      </div>

      <div className="card p-8 md:p-10 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-black text-slate-900 dark:text-white flex items-center justify-center text-3xl font-bold">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400">{session?.user?.email}</p>
            <div className="mt-2">
              <span className="badge badge-slate capitalize">{session?.user?.role?.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-700" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="name">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Your Name"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Leave blank if you don't want to change it.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
