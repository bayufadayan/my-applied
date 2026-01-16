"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Platform {
  id: string;
  name: string;
}

interface JobApplication {
  id: string;
  companyName: string | null;
  position: string;
  jobType: string;
  workPolicy: string;
  salaryMin: number | null;
  salaryMax: number | null;
  jobDescription: string | null;
  appliedDate: Date;
  platformId: string | null;
  hrContact: string | null;
  status: string;
  currentStage: string;
  cvLink: string | null;
  jobLink: string | null;
  location: string | null;
  locationMapLink: string | null;
  notes: string | null;
}

interface ApplicationFormProps {
  application?: JobApplication | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationForm({
  application,
  onClose,
  onSuccess,
}: ApplicationFormProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: application?.companyName || "",
    position: application?.position || "",
    jobType: application?.jobType || "full_time",
    workPolicy: application?.workPolicy || "remote",
    salaryMin: application?.salaryMin?.toString() || "",
    salaryMax: application?.salaryMax?.toString() || "",
    jobDescription: application?.jobDescription || "",
    appliedDate: application?.appliedDate
      ? new Date(application.appliedDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    platformId: application?.platformId || "",
    hrContact: application?.hrContact || "",
    status: application?.status || "applied",
    currentStage: application?.currentStage || "none",
    cvLink: application?.cvLink || "",
    jobLink: application?.jobLink || "",
    location: application?.location || "",
    locationMapLink: application?.locationMapLink || "",
    notes: application?.notes || "",
  });

  useEffect(() => {
    fetchPlatforms();
  }, []);

  async function fetchPlatforms() {
    try {
      const res = await fetch("/api/platforms");
      if (res.ok) {
        const data = await res.json();
        setPlatforms(data);
      }
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        appliedDate: new Date(formData.appliedDate),
        platformId: formData.platformId || null,
        companyName: formData.companyName || null,
        jobDescription: formData.jobDescription || null,
        hrContact: formData.hrContact || null,
        cvLink: formData.cvLink || null,
        jobLink: formData.jobLink || null,
        notes: formData.notes || null,
      };

      const url = application
        ? `/api/applications/${application.id}`
        : "/api/applications";
      const method = application ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving application:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {application ? "Edit Lamaran" : "Tambah Lamaran Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Posisi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="Frontend Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="PT. Contoh Perusahaan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Lamar <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.appliedDate}
                onChange={(e) =>
                  setFormData({ ...formData, appliedDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <select
                value={formData.platformId}
                onChange={(e) =>
                  setFormData({ ...formData, platformId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              >
                <option value="">Pilih Platform</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jenis Pekerjaan <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.jobType}
                onChange={(e) =>
                  setFormData({ ...formData, jobType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              >
                <option value="full_time">Full Time</option>
                <option value="contract">Contract</option>
                <option value="part_time">Part Time</option>
                <option value="freelance">Freelance</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kebijakan Kerja <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.workPolicy}
                onChange={(e) =>
                  setFormData({ ...formData, workPolicy: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              >
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gaji Minimum (Rp)
              </label>
              <input
                type="number"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="5000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gaji Maximum (Rp)
              </label>
              <input
                type="number"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="8000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="test">Test</option>
                <option value="reject">Reject</option>
                <option value="offer">Offer</option>
                <option value="closed">Closed</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tahap Terakhir <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.currentStage}
                onChange={(e) =>
                  setFormData({ ...formData, currentStage: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              >
                <option value="none">None</option>
                <option value="cv_screening">CV Screening</option>
                <option value="hr_interview">HR Interview</option>
                <option value="user_interview">User Interview</option>
                <option value="technical_test">Technical Test</option>
                <option value="final_interview">Final Interview</option>
                <option value="offering">Offering</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kontak HR
              </label>
              <input
                type="text"
                value={formData.hrContact}
                onChange={(e) =>
                  setFormData({ ...formData, hrContact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="hr@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link CV
              </label>
              <input
                type="url"
                value={formData.cvLink}
                onChange={(e) =>
                  setFormData({ ...formData, cvLink: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="Jakarta Barat, Bogor, dll"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link Google Maps (Opsional)
              </label>
              <input
                type="url"
                value={formData.locationMapLink}
                onChange={(e) =>
                  setFormData({ ...formData, locationMapLink: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="https://maps.google.com/... atau https://goo.gl/maps/..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 Tip: Buka Google Maps, cari lokasi kantor, klik Share → Copy link
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link Lowongan
              </label>
              <input
                type="url"
                value={formData.jobLink}
                onChange={(e) =>
                  setFormData({ ...formData, jobLink: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="https://linkedin.com/jobs/..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Description
              </label>
              <textarea
                value={formData.jobDescription}
                onChange={(e) =>
                  setFormData({ ...formData, jobDescription: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="Deskripsi pekerjaan..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : application ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
