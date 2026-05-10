"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type PendingFile = {
  file: File;
  preview: string | null; // data URL for images, null for other types
  id: string;
};

function CreateTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as "IT" | "HR" | null;

  // Core fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  // KB Deflection & Templates
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [searchingKb, setSearchingKb] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // IT-specific fields
  const [category, setCategory] = useState<"Incident" | "Service Request" | "">("");
  const [softwareName, setSoftwareName] = useState("");
  const [affectedSystem, setAffectedSystem] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // File upload state
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState("");

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const newFiles: PendingFile[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return; // skip > 10MB
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      const isImage = imageTypes.includes(file.type);
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPendingFiles((prev) =>
            prev.map((pf) => (pf.id === id ? { ...pf, preview: e.target?.result as string } : pf))
          );
        };
        reader.readAsDataURL(file);
        newFiles.push({ file, preview: null, id });
      } else {
        newFiles.push({ file, preview: null, id });
      }
    });

    setPendingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Clipboard paste (Ctrl+V anywhere on the page)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) addFiles(imageFiles);
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  // KB Deflection effect
  useEffect(() => {
    if (!title.trim()) {
      setRelatedArticles([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingKb(true);
      try {
        const res = await fetch(`/api/kb/related?ticketType=${typeParam}&q=${encodeURIComponent(title)}`);
        if (res.ok) {
          setRelatedArticles(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingKb(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, typeParam]);

  // Templates effect
  useEffect(() => {
    if (!typeParam) return;
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`/api/ticket-templates?type=${typeParam}`);
        if (res.ok) {
          setTemplates(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTemplates();
  }, [typeParam]);

  const applyTemplate = (t: any) => {
    setTitle(t.titlePrefix ? t.titlePrefix + title : title);
    setDescription(t.bodyTemplate);
    setPriority(t.priority);
    if (t.category && typeParam === "IT") {
      setCategory(t.category);
    }
  };

  // Drag-and-drop handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create the ticket
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type: typeParam,
          priority,
          ...(typeParam === "IT" && { category: category || null, softwareName, affectedSystem, errorMessage }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create ticket.");
        setLoading(false);
        return;
      }

      const ticket = await res.json();

      // 2. Upload attachments if any
      if (pendingFiles.length > 0) {
        setUploadProgress(`Uploading ${pendingFiles.length} screenshot${pendingFiles.length > 1 ? "s" : ""}…`);
        await Promise.all(
          pendingFiles.map(async ({ file }) => {
            const fd = new FormData();
            fd.append("file", file);
            await fetch(`/api/tickets/${ticket.id}/attachments`, { method: "POST", body: fd });
          })
        );
      }

      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  // ── Selection Screen ───────────────────────────────────────────────────────
  if (!typeParam) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">How can we help you?</h1>
          <p className="text-xl text-slate-500">Select the type of support you need to get started.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/dashboard/create?type=IT"
            className="card p-10 text-center hover:scale-[1.02] transition-transform cursor-pointer border-2 hover:border-blue-400 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🖥️</div>
            <h2 className="text-2xl font-bold mb-3">IT Support</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Software crashes, errors, access issues, or system problems.
            </p>
          </Link>

          <Link
            href="/dashboard/create?type=HR"
            className="card p-10 text-center hover:scale-[1.02] transition-transform cursor-pointer border-2 hover:border-blue-400 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">👥</div>
            <h2 className="text-2xl font-bold mb-3">HR Support</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Wages, holidays, policies, or general HR queries.
            </p>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard" className="text-slate-500 font-bold hover:text-slate-900 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Ticket Form ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-slate uppercase tracking-widest text-[10px] !px-3 font-black">
              {typeParam} Support
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Submit {typeParam} Support Ticket
          </h1>
        </div>
        <Link href="/dashboard/create" className="text-slate-500 font-bold hover:text-slate-900 transition-colors">
          Change Type
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title + Description */}
          <div className="card p-8 space-y-6">
            {templates.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-bold text-slate-500">Templates:</span>
                {templates.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => applyTemplate(t)}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all">
                    {t.name}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {typeParam === "IT" ? "Issue Title" : "Request Title"}
              </label>
              <input
                type="text"
                required
                className="input-field !text-lg !py-4"
                placeholder={typeParam === "IT" ? "e.g. Teams crashes when joining a meeting" : "e.g. Question about holiday balance"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {relatedArticles.length > 0 && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-2 page-reveal">
                <p className="text-sm font-bold text-blue-800 mb-3">
                  💡 Before you submit — these articles might help:
                </p>
                <div className="space-y-1">
                  {relatedArticles.map(article => (
                    <a key={article.id} href={`/dashboard/kb?article=${article.id}`} target="_blank"
                       className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 transition-colors">
                      <span className="text-sm font-medium text-blue-700">{article.title}</span>
                      <span className="text-xs text-blue-400">{article.views} views →</span>
                    </a>
                  ))}
                </div>
                <button onClick={() => setRelatedArticles([])}
                  className="text-xs text-blue-400 hover:text-blue-600 mt-2 font-medium">
                  None of these help — continue with my ticket
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Detailed Description
              </label>
              <textarea
                required
                rows={6}
                className="input-field resize-none !py-4"
                placeholder={
                  typeParam === "IT"
                    ? "Describe what happened, when it started, and any steps you've already tried…"
                    : "Provide all relevant details to help us resolve this quickly…"
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* IT-specific fields */}
          {typeParam === "IT" && (
            <div className="card p-8 space-y-6">
              <div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1">Software Details</h2>
                <p className="text-xs text-slate-400 font-medium">Helps IT diagnose your issue faster — fill in what you know.</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Ticket Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Incident", "Service Request"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                        category === cat
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-black uppercase tracking-widest mb-0.5 opacity-70">
                        {cat === "Incident" ? "Something broke" : "Need something new"}
                      </span>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Software Name + Affected System */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                    Affected Software / App
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Microsoft Teams, Chrome, SAP"
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                    Operating System / Platform
                  </label>
                  <select
                    value={affectedSystem}
                    onChange={(e) => setAffectedSystem(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select platform…</option>
                    <option value="Windows 11">Windows 11</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="macOS">macOS</option>
                    <option value="Web Browser">Web Browser</option>
                    <option value="Mobile (iOS)">Mobile (iOS)</option>
                    <option value="Mobile (Android)">Mobile (Android)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Error Message <span className="text-slate-300 normal-case font-medium">(if any — copy & paste the exact text)</span>
                </label>
                <textarea
                  rows={3}
                  className="input-field resize-none font-mono text-xs !py-3"
                  placeholder={'e.g. "Something went wrong. Error code: 0x800704EC"'}
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Screenshot Upload */}
          <div className="card p-8 space-y-4">
            <div>
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1">Screenshots</h2>
              <p className="text-xs text-slate-400 font-medium">
                Paste a screenshot with <kbd className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[11px] font-mono">Ctrl+V</kbd>, drag & drop, or click to browse. Max 10MB per file.
              </p>
            </div>

            {/* Drop zone */}
            <div
              ref={dropZoneRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all select-none ${
                isDragging
                  ? "border-blue-500 bg-blue-50 scale-[1.01]"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="text-3xl">{isDragging ? "📥" : "📎"}</div>
              <p className="text-sm font-semibold text-slate-500 text-center">
                {isDragging ? "Drop to attach" : "Drop files here, paste a screenshot, or click to browse"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx,.xlsx"
                className="hidden"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
              />
            </div>

            {/* Thumbnails */}
            {pendingFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {pendingFiles.map(({ id, file, preview }) => (
                  <div key={id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-3 text-center">
                        <div className="text-2xl mb-1">📄</div>
                        <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[80px]">{file.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(id); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-semibold px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {(file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          <div className="card p-8 space-y-8">
            {/* Priority */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Priority Level</label>
              <div className="grid grid-cols-2 gap-3">
                {(["low", "medium", "high", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                      priority === p
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-bold text-center">{error}</p>
              </div>
            )}

            {uploadProgress && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-600 font-bold text-center">{uploadProgress}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4 shadow-xl shadow-blue-600/20"
            >
              {loading ? (uploadProgress || "Submitting…") : "Send Request →"}
            </button>

            <Link
              href="/dashboard"
              className="block text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </Link>
          </div>

          {/* Tip card */}
          <div className="card p-6 bg-blue-50/50 border-blue-100">
            <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3">
              {typeParam === "IT" ? "Tips for faster resolution" : "Notice"}
            </h3>
            {typeParam === "IT" ? (
              <ul className="space-y-2 text-sm text-blue-900/70 font-medium leading-relaxed">
                <li>• Include the exact error message if there is one</li>
                <li>• A screenshot speeds up diagnosis significantly</li>
                <li>• For urgent hardware issues, also visit the IT desk</li>
              </ul>
            ) : (
              <p className="text-sm text-blue-900/70 font-medium leading-relaxed">
                HR queries are processed within 24–48 business hours.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CreateTicketPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CreateTicketForm />
    </Suspense>
  );
}
