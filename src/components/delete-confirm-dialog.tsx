"use client";

interface JobApplication {
  id: string;
  position: string;
  companyName: string | null;
}

interface DeleteConfirmDialogProps {
  application: JobApplication;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  application,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Hapus Lamaran?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Apakah Anda yakin ingin menghapus lamaran{" "}
          <strong>{application.position}</strong>
          {application.companyName && ` di ${application.companyName}`}? Tindakan
          ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
