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
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("IT");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/ticket-templates");
      if (res.ok) setTemplates(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/ticket-templates/${id}`, { method: "DELETE" });
      if (res.ok) fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (template: TicketTemplate) => {
    try {
      const res = await fetch(`/api/ticket-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !template.active }),
      });
      if (res.ok) fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/ticket-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          type,
          priority,
          category: category || null,
          titlePrefix: titlePrefix || null,
          bodyTemplate,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setName("");
        setDescription("");
        setCategory("");
        setTitlePrefix("");
        setBodyTemplate("");
        fetchTemplates();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create template.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ticket Templates</h1>
          <p className="text-slate-500 dark:text-slate-400">Pre-defined templates to help users submit consistent tickets.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "New Template"}
        </button>
      </div>

      {showForm && (
        <div className="card p-8 border-2 border-purple-500/20 bg-purple-50/30 dark:bg-purple-900/10 animate-slide-up">
          <h2 className="text-xl font-bold mb-6">Create Ticket Template</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Template Name</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Password Reset Request"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</label>
                <div className="flex gap-2">
                  {["IT", "HR"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-xl border-2 font-bold transition-all ${
                        type === t
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                <input
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="Internal description for admins"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority</label>
                <select
                  className="input-field"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category (IT only)</label>
                <input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Hardware"
                  disabled={type !== "IT"}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title Prefix</label>
                <input
                  value={titlePrefix}
                  onChange={e => setTitlePrefix(e.target.value)}
                  className="input-field"
                  placeholder="e.g. [PW RESET] "
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Body Template</label>
                <textarea
                  required
                  rows={6}
                  value={bodyTemplate}
                  onChange={e => setBodyTemplate(e.target.value)}
                  className="input-field font-mono text-sm resize-none"
                  placeholder="Please reset my password for..."
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 font-bold text-slate-500   transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary bg-purple-600  shadow-purple-600/20"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.length === 0 ? (
          <div className="card p-20 text-center col-span-2 border-dashed border-2">
            <div className="text-4xl mb-4 opacity-30">📄</div>
            <p className="text-slate-500 italic">No ticket templates created yet.</p>
          </div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="card p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{template.name}</h3>
                    <span className={`badge ${template.type === "IT" ? "badge-blue" : "badge-amber"}`}>
                      {template.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-all ${
                      template.active
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {template.active ? "Active" : "Inactive"}
                  </button>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{template.description}</p>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                    <span>Default Priority:</span>
                    <span className={
                      template.priority === "urgent" ? "text-red-500" :
                      template.priority === "high" ? "text-orange-500" :
                      template.priority === "medium" ? "text-blue-500" :
                      "text-slate-500"
                    }>{template.priority}</span>
                  </div>
                  {template.titlePrefix && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <span>Prefix:</span>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {template.titlePrefix}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-slate-300  transition-colors p-2"
                  aria-label="Delete template"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
