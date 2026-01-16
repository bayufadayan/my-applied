"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Eye, MapPin } from "lucide-react";
import { ApplicationForm } from "./application-form";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { ApplicationDetail } from "./application-detail";

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
  platform?: Platform | null;
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  interview: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  test: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  reject: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  none: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

const statusLabels = {
  applied: "Applied",
  interview: "Interview",
  test: "Test",
  reject: "Rejected",
  offer: "Offer",
  closed: "Closed",
  none: "None",
};

function formatSalary(amount: number): string {
  if (amount >= 1000000) {
    const jt = amount / 1000000;
    return jt % 1 === 0 ? `${jt}jt` : `${jt.toFixed(1)}jt`;
  } else if (amount >= 1000) {
    const rb = amount / 1000;
    return rb % 1 === 0 ? `${rb}rb` : `${rb.toFixed(1)}rb`;
  }
  return `${amount}`;
}

function formatDate(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const d = new Date(date);
  const dayName = days[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${dayName}, ${day} ${month} ${year}`;
}

export function ApplicationsList() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<JobApplication | null>(null);
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setApplications(applications.filter((app) => app.id !== id));
        setDeletingApp(null);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  }

  const filteredApps =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lamaran Saya
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {filteredApps.length} lamaran
          </p>
        </div>
        <button
          onClick={() => {
            setEditingApp(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Lamaran
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "Semua" },
          { value: "applied", label: "Applied" },
          { value: "interview", label: "Interview" },
          { value: "test", label: "Test" },
          { value: "offer", label: "Offer" },
          { value: "reject", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === tab.value
                ? "bg-blue-600 text-white dark:bg-blue-500"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications Grid/Table */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "all"
              ? "Belum ada lamaran. Tambahkan lamaran pertama Anda!"
              : `Tidak ada lamaran dengan status ${statusLabels[filter as keyof typeof statusLabels]}`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {app.position}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {app.companyName || "Perusahaan tidak disebutkan"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[app.status as keyof typeof statusColors]
                  }`}
                >
                  {statusLabels[app.status as keyof typeof statusLabels]}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>📅</span>
                  <span>{formatDate(app.appliedDate)}</span>
                </div>
                {app.platform && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>🌐</span>
                    <span>{app.platform.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>💼</span>
                  <span className="capitalize">
                    {app.jobType.replace("_", " ")}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{app.workPolicy}</span>
                </div>
                {(app.salaryMin || app.salaryMax) && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>💰</span>
                    <span>
                      {app.salaryMin && app.salaryMax
                        ? `${formatSalary(app.salaryMin)} - ${formatSalary(app.salaryMax)}`
                        : app.salaryMin
                        ? `${formatSalary(app.salaryMin)}+`
                        : `Up to ${formatSalary(app.salaryMax!)}`}
                    </span>
                  </div>
                )}
                {app.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{app.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewingApp(app)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Detail
                </button>
                {app.locationMapLink && (
                  <a
                    href={app.locationMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    title="Buka di Google Maps"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                )}
                {app.cvLink && (
                  <a
                    href={app.cvLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Lihat CV"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {app.jobLink && (
                  <a
                    href={app.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Lihat Lowongan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setEditingApp(app);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingApp(app)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ApplicationForm
          application={editingApp}
          onClose={() => {
            setShowForm(false);
            setEditingApp(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingApp(null);
            fetchApplications();
          }}
        />
      )}

      {/* Detail Modal */}
      {viewingApp && (
        <ApplicationDetail
          application={viewingApp}
          onClose={() => setViewingApp(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingApp && (
        <DeleteConfirmDialog
          application={deletingApp}
          onConfirm={() => handleDelete(deletingApp.id)}
          onCancel={() => setDeletingApp(null)}
        />
      )}
    </div>
  );
}
