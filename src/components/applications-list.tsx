"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Eye, MapPin, ArrowUpDown, Search, X, Download, CheckSquare, Square, Copy } from "lucide-react";
import { ApplicationForm } from "./application-form";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { ApplicationDetail } from "./application-detail";
import { DashboardStats } from "./dashboard-stats";

interface Platform {
  id: string;
  name: string;
}

export interface JobApplication {
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
  unresponded: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const statusLabels = {
  applied: "Applied",
  interview: "Interview",
  test: "Test",
  reject: "Rejected",
  offer: "Offer",
  closed: "Closed",
  none: "None",
  unresponded: "Unresponded",
};

const sortOptions = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "status-high", label: "Status Prioritas Tertinggi" },
  { value: "status-low", label: "Status Prioritas Terendah" },
  { value: "company-az", label: "Perusahaan A-Z" },
  { value: "company-za", label: "Perusahaan Z-A" },
  { value: "position-az", label: "Posisi A-Z" },
  { value: "position-za", label: "Posisi Z-A" },
  { value: "salary-high", label: "Gaji Tertinggi" },
  { value: "salary-low", label: "Gaji Terendah" },
];

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
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [sortBy]);

  // Keyboard shortcut for quick add (Ctrl+N or Cmd+N)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setEditingApp(null);
        setShowForm(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch(`/api/applications?sortBy=${sortBy}`);
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

  // Search filter
  const searchFilteredApps = searchQuery.trim() === ""
    ? filteredApps
    : filteredApps.filter((app) => {
        const query = searchQuery.toLowerCase();
        const companyMatch = app.companyName?.toLowerCase().includes(query);
        const positionMatch = app.position.toLowerCase().includes(query);
        const locationMatch = app.location?.toLowerCase().includes(query);
        const platformMatch = app.platform?.name.toLowerCase().includes(query);
        
        return companyMatch || positionMatch || locationMatch || platformMatch;
      });

  // Additional filter by month and year
  const dateFilteredApps = searchFilteredApps.filter((app) => {
    const appDate = new Date(app.appliedDate);
    const appMonth = appDate.getMonth(); // 0-11
    const appYear = appDate.getFullYear();

    const monthMatch = selectedMonth === "all" || parseInt(selectedMonth) === appMonth;
    const yearMatch = selectedYear === "all" || parseInt(selectedYear) === appYear;

    return monthMatch && yearMatch;
  });

  // Get available years from applications
  const availableYears = Array.from(
    new Set(
      applications.map((app) => new Date(app.appliedDate).getFullYear())
    )
  ).sort((a, b) => b - a); // Descending order

  // Export to CSV function
  function exportToCSV() {
    if (applications.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    // CSV Headers
    const headers = [
      "No",
      "Perusahaan",
      "Posisi",
      "Status",
      "Tahap Terakhir",
      "Tanggal Lamar",
      "Platform",
      "Tipe Pekerjaan",
      "Work Policy",
      "Gaji Min",
      "Gaji Max",
      "Lokasi",
      "HR Contact",
      "CV Link",
      "Job Link",
      "Location Map Link",
      "Deskripsi Pekerjaan",
      "Catatan",
      "Dibuat Pada",
    ];

    // Convert applications to CSV rows
    const rows = applications.map((app, index) => {
      const appliedDate = new Date(app.appliedDate);
      const formattedDate = `${appliedDate.getDate()}/${appliedDate.getMonth() + 1}/${appliedDate.getFullYear()}`;
      
      return [
        index + 1,
        app.companyName || "-",
        app.position,
        app.status,
        app.currentStage,
        formattedDate,
        app.platform?.name || "-",
        app.jobType.replace("_", " "),
        app.workPolicy,
        app.salaryMin || "-",
        app.salaryMax || "-",
        app.location || "-",
        app.hrContact || "-",
        app.cvLink || "-",
        app.jobLink || "-",
        app.locationMapLink || "-",
        app.jobDescription ? `"${app.jobDescription.replace(/"/g, '""')}"` : "-",
        app.notes ? `"${app.notes.replace(/"/g, '""')}"` : "-",
        new Date(app.appliedDate).toLocaleString("id-ID"),
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const filename = `MyApplied_Export_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Bulk selection functions
  function toggleSelect(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === dateFilteredApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dateFilteredApps.map(app => app.id));
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    
    const confirmMsg = `Yakin ingin menghapus ${selectedIds.length} lamaran?`;
    if (!confirm(confirmMsg)) return;

    try {
      await Promise.all(
        selectedIds.map(id => 
          fetch(`/api/applications/${id}`, { method: "DELETE" })
        )
      );
      
      setApplications(applications.filter(app => !selectedIds.includes(app.id)));
      setSelectedIds([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      alert("Gagal menghapus beberapa lamaran");
    }
  }

  async function handleBulkUpdateStatus(newStatus: string) {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map(id => 
          fetch(`/api/applications/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      
      // Refresh data
      await fetchApplications();
      setSelectedIds([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error bulk updating:", error);
      alert("Gagal update beberapa lamaran");
    }
  }

  function handleDuplicate(app: JobApplication) {
    // Create a copy without the ID (so it creates new record)
    const duplicatedApp = {
      ...app,
      id: "", // Clear ID to create new record
      // Optionally modify some fields to indicate it's a duplicate
      companyName: app.companyName ? `${app.companyName} (Copy)` : null,
    };
    
    setEditingApp(duplicatedApp as JobApplication);
    setIsDuplicateMode(true);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Statistics */}
      <DashboardStats applications={applications} />

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {selectedIds.length} lamaran dipilih
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Batal Pilih
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bulk Status Update */}
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Ubah Status
                </button>
                {showBulkActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleBulkUpdateStatus("applied")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      Applied
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus("interview")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Interview
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus("test")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus("offer")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Offer
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus("reject")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus("closed")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Closed
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus("unresponded")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                    >
                      Unresponded
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk Delete */}
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Hapus Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Select All Checkbox */}
          {dateFilteredApps.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={selectedIds.length === dateFilteredApps.length ? "Batal Pilih Semua" : "Pilih Semua"}
            >
              {selectedIds.length === dateFilteredApps.length ? (
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
          <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lamaran Saya
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {dateFilteredApps.length} lamaran
          </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Semua Bulan</option>
            <option value="0">Januari</option>
            <option value="1">Februari</option>
            <option value="2">Maret</option>
            <option value="3">April</option>
            <option value="4">Mei</option>
            <option value="5">Juni</option>
            <option value="6">Juli</option>
            <option value="7">Agustus</option>
            <option value="8">September</option>
            <option value="9">Oktober</option>
            <option value="10">November</option>
            <option value="11">Desember</option>
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Semua Tahun</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOptions.find(opt => opt.value === sortBy)?.label || "Urut"}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      sortBy === option.value
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.value === sortBy && "✓ "}{option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={exportToCSV}
            disabled={applications.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export semua data ke CSV"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
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
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari perusahaan, posisi, lokasi, atau platform..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
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
          { value: "unresponded", label: "Unresponded" },
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
      {dateFilteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "all" && selectedMonth === "all" && selectedYear === "all"
              ? "Belum ada lamaran. Tambahkan lamaran pertama Anda!"
              : "Tidak ada lamaran yang sesuai dengan filter yang dipilih"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dateFilteredApps.map((app) => {
            // Different card styles based on status
            let cardClassName = "relative bg-white dark:bg-gray-800 border rounded-lg p-6 hover:shadow-lg transition-shadow";
            
            if (app.status === "reject") {
              cardClassName = "relative bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800 rounded-lg p-6 hover:shadow-lg transition-shadow";
            } else if (app.status === "unresponded") {
              cardClassName = "relative bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-300 dark:border-orange-800 rounded-lg p-6 hover:shadow-lg transition-shadow";
            } else if (app.status === "closed") {
              cardClassName = "relative bg-gray-200 dark:bg-gray-700/70 border-2 border-gray-400 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow opacity-60";
            }

            return (
            <div
              key={app.id}
              className={cardClassName}
            >
              {/* Checkbox for bulk selection */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(app.id);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {selectedIds.includes(app.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

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
                <button
                  onClick={() => handleDuplicate(app)}
                  className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  title="Duplikasi Lamaran"
                >
                  <Copy className="w-4 h-4" />
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
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ApplicationForm
          application={editingApp}
          onClose={() => {
            setShowForm(false);
            setEditingApp(null);
            setIsDuplicateMode(false);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingApp(null);
            setIsDuplicateMode(false);
            fetchApplications();
          }}
          isDuplicate={isDuplicateMode}
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

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingApp(null);
          setShowForm(true);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group z-40 hover:scale-110"
        title="Tambah Lamaran Baru (Ctrl+N)"
      >
        <Plus className="w-8 h-8" />
        <span className="absolute right-20 bg-gray-900 dark:bg-gray-700 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Tambah Lamaran (Ctrl+N)
        </span>
      </button>
    </div>
  );
}
