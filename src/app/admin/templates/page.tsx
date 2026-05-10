"use client";

import { useEffect, useState } from "react";

type TicketTemplate = {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: string;
  category: string | null;
  titlePrefix: string | null;
  bodyTemplate: string;
  active: boolean;
  createdAt: string;
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-300 border border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  medium: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  low: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export default function TicketTemplatesPage() {
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "IT" as "IT" | "HR",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    category: "",
    titlePrefix: "",
    bodyTemplate: "",
    active: true,
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ticket-templates");
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ticket-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({
          name: "",
          description: "",
          type: "IT",
          priority: "medium",
          category: "",
          titlePrefix: "",
          bodyTemplate: "",
          active: true,
        });
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/ticket-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/ticket-templates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16 page-reveal">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Ticket Templates</h1>
          <p className="text-white/30 mt-1 text-sm font-medium">Manage templates for common issues</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn-primary"
        >
          {isFormOpen ? "Close Form" : "＋ Add Template"}
        </button>
      </div>

      {/* Add Template Form */}
      {isFormOpen && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 page-reveal">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Create New Template</h2>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. Password Reset"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Description</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. For standard password reset requests"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Type</label>
                <div className="flex gap-3">
                  {(["IT", "HR"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all capitalize ${
                        formData.type === t
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-3 px-1 rounded-xl text-xs font-bold border transition-all capitalize ${
                        formData.priority === p
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Category (Optional)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. Access"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Title Prefix (Optional)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. [PW-RESET] "
                  value={formData.titlePrefix}
                  onChange={(e) => setFormData({ ...formData, titlePrefix: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Body Template</label>
                <textarea
                  required
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors font-mono text-sm"
                  placeholder="Write the default body content for this template..."
                  value={formData.bodyTemplate}
                  onChange={(e) => setFormData({ ...formData, bodyTemplate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 justify-end">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-6"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Title Prefix</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {templates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-white/40 italic">
                  No templates found. Create one to help users.
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id} className="text-sm text-white/80 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-bold">{template.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      template.type === "IT" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {template.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[template.priority]}`}>
                      {template.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60">{template.category || "—"}</td>
                  <td className="px-6 py-4 font-mono text-xs text-white/60">{template.titlePrefix || "—"}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(template.id, template.active)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        template.active
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      }`}
                    >
                      {template.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-400 hover:text-red-300 font-bold text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
