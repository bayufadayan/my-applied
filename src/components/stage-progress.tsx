"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Save, X } from "lucide-react";

const stageOrder = [
  "cv_screening",
  "hr_interview",
  "user_interview",
  "technical_test",
  "psikotes",
  "final_interview",
  "offering",
  "accepted",
  "rejected",
] as const;

type StageValue = (typeof stageOrder)[number] | "none";

const stageLabels: Record<string, string> = {
  cv_screening: "CV Screening",
  hr_interview: "HR Interview",
  user_interview: "User Interview",
  technical_test: "Technical Test",
  psikotes: "Psikotes",
  final_interview: "Final Interview",
  offering: "Offering",
  accepted: "Accepted",
  rejected: "Rejected",
  none: "Belum Dimulai",
  screening: "CV Screening",
  interview_hr: "HR Interview",
  interview_user: "User Interview",
  interview_technical: "Technical Test",
};

const stageAliases: Record<string, StageValue> = {
  screening: "cv_screening",
  cv_screening: "cv_screening",
  interview_hr: "hr_interview",
  hr_interview: "hr_interview",
  interview_user: "user_interview",
  user_interview: "user_interview",
  interview_technical: "technical_test",
  technical_test: "technical_test",
  psikotes: "psikotes",
  final_interview: "final_interview",
  offering: "offering",
  accepted: "accepted",
  rejected: "rejected",
  none: "none",
};

const stageColors: Record<string, { dot: string; line: string; text: string; bg: string }> = {
  cv_screening: {
    dot: "bg-sky-500 border-sky-500",
    line: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-900/20",
  },
  hr_interview: {
    dot: "bg-purple-500 border-purple-500",
    line: "bg-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  user_interview: {
    dot: "bg-violet-500 border-violet-500",
    line: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  technical_test: {
    dot: "bg-orange-500 border-orange-500",
    line: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  psikotes: {
    dot: "bg-amber-500 border-amber-500",
    line: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  final_interview: {
    dot: "bg-fuchsia-500 border-fuchsia-500",
    line: "bg-fuchsia-500",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20",
  },
  offering: {
    dot: "bg-emerald-500 border-emerald-500",
    line: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  accepted: {
    dot: "bg-green-500 border-green-500",
    line: "bg-green-500",
    text: "text-green-700 dark:text-green-300",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  rejected: {
    dot: "bg-red-500 border-red-500",
    line: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
};

interface StageProgressProps {
  applicationId: string;
  currentStage: string;
  className?: string;
  editable?: boolean;
  onUpdated?: (updatedApplication: { currentStage: string; [key: string]: unknown }) => void;
}

function normalizeStage(stage: string): StageValue {
  return stageAliases[stage] ?? "none";
}

export function StageProgress({
  applicationId,
  currentStage,
  className,
  editable = true,
  onUpdated,
}: StageProgressProps) {
  const normalizedStage = useMemo(() => normalizeStage(currentStage), [currentStage]);
  const [displayStage, setDisplayStage] = useState<StageValue>(normalizedStage);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStage, setSelectedStage] = useState<StageValue>(normalizedStage);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayStage(normalizedStage);
    setSelectedStage(normalizedStage);
  }, [normalizedStage]);

  const stageIndex = displayStage === "none" ? -1 : stageOrder.indexOf(displayStage as (typeof stageOrder)[number]);
  const progressPercent = stageIndex >= 0 ? ((stageIndex + 1) / stageOrder.length) * 100 : 0;
  const currentLabel = stageLabels[displayStage] || stageLabels.none;
  const currentColor = stageColors[displayStage] || stageColors.none;

  async function saveStage() {
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStage: selectedStage }),
      });

      if (!res.ok) {
        throw new Error("Failed to update stage");
      }

      const updatedApplication = await res.json();
      setDisplayStage(selectedStage);
      onUpdated?.(updatedApplication);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Gagal mengubah tahap");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Apply Progress</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">Progress Tahap Lamaran</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tahap aktif: {currentLabel}</p>
        </div>

        {editable && (
          <button
            type="button"
            onClick={() => setIsEditing((value) => !value)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {isEditing ? "Batal" : "Edit Tahap"}
          </button>
        )}
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${currentColor.line}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={`text-sm font-semibold ${currentColor.text}`}>{Math.round(progressPercent)}%</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {normalizedStage === "none" ? "Belum ada progress yang dipilih" : "Tahap bisa diubah kapan saja dari card ini"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {stageOrder.map((stage, index) => {
          const isCompleted = stageIndex >= index;
          const isActive = displayStage === stage;
          const stageColor = stageColors[stage];

          return (
            <button
              key={stage}
              type="button"
              disabled={!editable}
              onClick={() => {
                setSelectedStage(stage);
                if (!editable) return;
                setIsEditing(true);
              }}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? `${stageColor.bg} border-current shadow-sm`
                  : isCompleted
                  ? "bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60"
              } ${editable ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shrink-0 ${
                  isActive
                    ? `${stageColor.dot} text-white`
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </span>
              <span className={`text-sm font-medium leading-tight ${isActive ? stageColor.text : "text-gray-700 dark:text-gray-300"}`}>
                {stageLabels[stage]}
              </span>
            </button>
          );
        })}
      </div>

      {isEditing && editable && (
        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih tahap baru
            </label>
            <select
              value={selectedStage}
              onChange={(event) => setSelectedStage(event.target.value as StageValue)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Belum Dimulai</option>
              {stageOrder.map((stage) => (
                <option key={stage} value={stage}>
                  {stageLabels[stage]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={saveStage}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Menyimpan..." : "Simpan Tahap"}
          </button>
        </div>
      )}
    </div>
  );
}
