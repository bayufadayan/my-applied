"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link2, Eraser, Loader2 } from "lucide-react";

function formatUpdatedAt(value: string | null): string {
  if (!value) {
    return "Belum pernah disimpan";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function CatatEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const response = await fetch("/api/catat", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Gagal memuat catatan");
        }

        const data = await response.json();
        const initialContent = data.content || "";

        if (editorRef.current) {
          editorRef.current.innerHTML = initialContent || "<p><br></p>";
        }

        setContent(initialContent);
        setLastSavedAt(data.updatedAt);
      } catch (error) {
        console.error(error);
        setSaveError("Catatan gagal dimuat");
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }

    fetchNote();
  }, []);

  const saveNote = useCallback(async (nextContent: string) => {
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/catat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nextContent }),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan catatan");
      }

      const data = await response.json();
      setLastSavedAt(data.updatedAt ?? null);
    } catch (error) {
      console.error(error);
      setSaveError("Autosave gagal. Coba edit lagi untuk menyimpan ulang.");
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void saveNote(content);
    }, 900);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [content, initialized, saveNote]);

  function applyCommand(command: string) {
    editorRef.current?.focus();
    document.execCommand(command, false);
    setContent(editorRef.current?.innerHTML ?? "");
  }

  function insertLink() {
    editorRef.current?.focus();
    const url = window.prompt("Masukkan URL");
    if (!url) {
      return;
    }

    document.execCommand("createLink", false, url);
    setContent(editorRef.current?.innerHTML ?? "");
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat catatan...
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => applyCommand("bold")} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => applyCommand("italic")} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => applyCommand("underline")} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Underline">
          <Underline className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => applyCommand("insertUnorderedList")} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Bullet list">
          <List className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => applyCommand("insertOrderedList")} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Number list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" onClick={insertLink} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Insert link">
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => applyCommand("removeFormat")} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Clear format">
          <Eraser className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => setContent(editorRef.current?.innerHTML ?? "")}
        className="min-h-[65vh] p-5 outline-none text-gray-800 dark:text-gray-100 leading-7"
      />

      <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-gray-500 dark:text-gray-400">Terakhir disimpan: {formatUpdatedAt(lastSavedAt)}</p>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Menyimpan...
            </span>
          )}
          {!saving && !saveError && (
            <span className="text-green-600 dark:text-green-400">Tersimpan</span>
          )}
          {saveError && <span className="text-red-600 dark:text-red-400">{saveError}</span>}
        </div>
      </div>
    </section>
  );
}
