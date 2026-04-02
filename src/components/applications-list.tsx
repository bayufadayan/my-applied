"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ExternalLink, Eye, MapPin, ArrowUpDown, X, Download, CheckSquare, Square, Copy, Loader2, Pin, Menu, List, CheckCircle, XCircle, Calendar, Archive, RotateCcw } from "lucide-react";
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
  deadline: Date | null;
  platformId: string | null;
  hrContact: string | null;
  status: string;
  currentStage: string;
  cvLink: string | null;
  jobLink: string | null;
  location: string | null;
  locationMapLink: string | null;
  notes: string | null;
  isPinned: boolean;
  isArchived?: boolean;
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

function getDaysUntilDeadline(deadline: Date): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getDeadlineInfo(deadline: Date) {
  const daysLeft = getDaysUntilDeadline(deadline);
  
  if (daysLeft < 0) {
    return {
      text: `Lewat ${Math.abs(daysLeft)} hari`,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-300 dark:border-red-800",
      urgent: true
    };
  } else if (daysLeft === 0) {
    return {
      text: "Hari ini!",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-300 dark:border-red-800",
      urgent: true
    };
  } else if (daysLeft === 1) {
    return {
      text: "Besok",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-300 dark:border-orange-800",
      urgent: true
    };
  } else if (daysLeft <= 3) {
    return {
      text: `${daysLeft} hari lagi`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-300 dark:border-orange-800",
      urgent: true
    };
  } else if (daysLeft <= 7) {
    return {
      text: `${daysLeft} hari lagi`,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-300 dark:border-yellow-800",
      urgent: false
    };
  } else {
    return {
      text: `${daysLeft} hari lagi`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-300 dark:border-blue-800",
      urgent: false
    };
  }
}

export function ApplicationsList() {
  const router = useRouter();
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
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);
  const [bulkArchiveLoading, setBulkArchiveLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showOnlyWithDeadline, setShowOnlyWithDeadline] = useState(false);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Listen to header search input
  useEffect(() => {
    const handleHeaderSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSearchQuery(customEvent.detail);
    };

    window.addEventListener('header-search-change', handleHeaderSearch);
    return () => window.removeEventListener('header-search-change', handleHeaderSearch);
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch(`/api/applications?sortBy=${sortBy}&includeArchived=true`);
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

  const filteredApps = (() => {
    if (filter === "archived") {
      return applications.filter((app) => app.isArchived);
    }

    const activeApplications = applications.filter((app) => !app.isArchived);

    if (filter === "all") {
      return activeApplications;
    } else if (filter === "active") {
      // Active = all except unresponded, reject, and none
      return activeApplications.filter(
        (app) => !["unresponded", "reject", "none"].includes(app.status)
      );
    } else if (filter === "non-active") {
      // Non-Active = only unresponded and reject
      return activeApplications.filter((app) =>
        ["unresponded", "reject"].includes(app.status)
      );
    } else if (filter === "planned") {
      // Planned = only none
      return activeApplications.filter((app) => app.status === "none");
    } else {
      // Individual status filter
      return activeApplications.filter((app) => app.status === filter);
    }
  })();

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

  // Filter by deadline
  let finalFilteredApps = showOnlyWithDeadline
    ? dateFilteredApps.filter((app) => app.deadline !== null)
    : dateFilteredApps;

  // Sort by deadline proximity when deadline filter is active
  if (showOnlyWithDeadline) {
    finalFilteredApps = [...finalFilteredApps].sort((a, b) => {
      const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      const now = new Date().getTime();
      
      // Calculate absolute difference from now
      const diffA = Math.abs(deadlineA - now);
      const diffB = Math.abs(deadlineB - now);
      
      return diffA - diffB; // Closest deadline first
    });
  }

  // Get available years from applications
  const availableYears = Array.from(
    new Set(
      filteredApps.map((app) => new Date(app.appliedDate).getFullYear())
    )
  ).sort((a, b) => b - a); // Descending order

  // Export to CSV function
  function exportToCSV() {
    if (filteredApps.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    setExportLoading(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
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
    const rows = filteredApps.map((app, index) => {
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
      } finally {
        setExportLoading(false);
      }
    }, 100);
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

  async function runBulkWithConcurrency(
    ids: string[],
    worker: (id: string) => Promise<Response>,
    concurrency = 4
  ) {
    for (let i = 0; i < ids.length; i += concurrency) {
      const chunk = ids.slice(i, i + concurrency);
      await Promise.all(chunk.map(worker));
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    
    const confirmMsg = `Yakin ingin menghapus ${selectedIds.length} lamaran?`;
    if (!confirm(confirmMsg)) return;

    setBulkDeleteLoading(true);
    try {
      await runBulkWithConcurrency(selectedIds, (id) =>
        fetch(`/api/applications/${id}`, { method: "DELETE" })
      );
      
      setApplications(applications.filter(app => !selectedIds.includes(app.id)));
      setSelectedIds([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      alert("Gagal menghapus beberapa lamaran");
    } finally {
      setBulkDeleteLoading(false);
    }
  }

  async function handleBulkUpdateStatus(newStatus: string) {
    if (selectedIds.length === 0) return;

    setBulkStatusLoading(true);
    try {
      await runBulkWithConcurrency(selectedIds, (id) =>
        fetch(`/api/applications/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      );
      
      // Refresh data
      await fetchApplications();
      setSelectedIds([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error bulk updating:", error);
      alert("Gagal update beberapa lamaran");
    } finally {
      setBulkStatusLoading(false);
    }
  }

  async function handleBulkArchive() {
    if (selectedIds.length === 0) return;

    setBulkArchiveLoading(true);
    try {
      await runBulkWithConcurrency(selectedIds, (id) =>
        fetch(`/api/applications/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: true }),
        })
      );

      await fetchApplications();
      setSelectedIds([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error bulk archiving:", error);
      alert("Gagal mengarsipkan beberapa lamaran");
    } finally {
      setBulkArchiveLoading(false);
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

  async function togglePin(app: JobApplication) {
    setPinningId(app.id);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPinned: !app.isPinned,
        }),
      });

      if (res.ok) {
        const updatedApp = await res.json();
        setApplications(applications.map((a) => 
          a.id === app.id ? { ...a, isPinned: updatedApp.isPinned } : a
        ));
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    } finally {
      setPinningId(null);
    }
  }

  async function handleArchive(app: JobApplication) {
    setArchivingId(app.id);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isArchived: true,
        }),
      });

      if (res.ok) {
        setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, isArchived: true } : a)));
      }
    } catch (error) {
      console.error("Error archiving application:", error);
      alert("Gagal mengarsipkan lamaran");
    } finally {
      setArchivingId(null);
    }
  }

  async function handleUnarchive(app: JobApplication) {
    setArchivingId(app.id);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isArchived: false,
        }),
      });

      if (res.ok) {
        setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, isArchived: false } : a)));
      }
    } catch (error) {
      console.error("Error unarchiving application:", error);
      alert("Gagal mengembalikan lamaran dari arsip");
    } finally {
      setArchivingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  // Calculate counts for each filter category
  const counts = {
    all: applications.filter((app) => !app.isArchived).length,
    active: applications.filter((app) => !app.isArchived).filter(
      (app) => !["unresponded", "reject", "none"].includes(app.status)
    ).length,
    nonActive: applications.filter((app) => !app.isArchived).filter((app) =>
      ["unresponded", "reject"].includes(app.status)
    ).length,
    planned: applications.filter((app) => !app.isArchived && app.status === "none").length,
    applied: applications.filter((app) => !app.isArchived && app.status === "applied").length,
    interview: applications.filter((app) => !app.isArchived && app.status === "interview").length,
    test: applications.filter((app) => !app.isArchived && app.status === "test").length,
    offer: applications.filter((app) => !app.isArchived && app.status === "offer").length,
    reject: applications.filter((app) => !app.isArchived && app.status === "reject").length,
    unresponded: applications.filter((app) => !app.isArchived && app.status === "unresponded")
      .length,
    closed: applications.filter((app) => !app.isArchived && app.status === "closed").length,
    none: applications.filter((app) => !app.isArchived && app.status === "none").length,
    archived: applications.filter((app) => app.isArchived).length,
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          sidebar-scroll
          fixed inset-y-0 left-0 z-40
          w-64 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          overflow-y-auto
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ 
          height: 'calc(100vh - 56px)',
          top: '56px'
        }}
      >
        <div className="p-3 space-y-1">
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-end mb-2">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Special Filters */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setFilter("all");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <List className="w-3.5 h-3.5" />
                Semua
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "all"
                    ? "bg-white/20"
                    : "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("active");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "active"
                  ? "bg-green-600 text-white dark:bg-green-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Active
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "active"
                    ? "bg-white/20"
                    : "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                {counts.active}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("non-active");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "non-active"
                  ? "bg-red-600 text-white dark:bg-red-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <XCircle className="w-3.5 h-3.5" />
                Non-Active
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "non-active"
                    ? "bg-white/20"
                    : "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                {counts.nonActive}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("planned");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "planned"
                  ? "bg-purple-600 text-white dark:bg-purple-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Planned
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "planned"
                    ? "bg-white/20"
                    : "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                {counts.planned}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("archived");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "archived"
                  ? "bg-amber-600 text-white dark:bg-amber-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Archive className="w-3.5 h-3.5" />
                Arsip
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "archived"
                    ? "bg-white/20"
                    : "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                {counts.archived}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-3 border-t-2 border-gray-300 dark:border-gray-600"></div>

          {/* Status Filters */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-1.5">
              By Status
            </p>

            <button
              onClick={() => {
                setFilter("applied");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "applied"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">Applied</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "applied"
                    ? "bg-white/20"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {counts.applied}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("interview");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "interview"
                  ? "bg-purple-600 text-white dark:bg-purple-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">Interview</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "interview"
                    ? "bg-white/20"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                }`}
              >
                {counts.interview}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("test");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "test"
                  ? "bg-yellow-600 text-white dark:bg-yellow-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">Test</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "test"
                    ? "bg-white/20"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {counts.test}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("offer");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "offer"
                  ? "bg-green-600 text-white dark:bg-green-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">Offer</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "offer"
                    ? "bg-white/20"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}
              >
                {counts.offer}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("reject");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "reject"
                  ? "bg-red-600 text-white dark:bg-red-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">Rejected</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "reject"
                    ? "bg-white/20"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {counts.reject}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("unresponded");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "unresponded"
                  ? "bg-orange-600 text-white dark:bg-orange-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">Unresponded</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "unresponded"
                    ? "bg-white/20"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                }`}
              >
                {counts.unresponded}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("closed");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "closed"
                  ? "bg-gray-600 text-white dark:bg-gray-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">Closed</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "closed"
                    ? "bg-white/20"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {counts.closed}
              </span>
            </button>

            <button
              onClick={() => {
                setFilter("none");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                filter === "none"
                  ? "bg-gray-600 text-white dark:bg-gray-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-sm font-medium">None</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === "none"
                    ? "bg-white/20"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {counts.none}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dashboard Statistics */}
      <DashboardStats applications={applications.filter((app) => !app.isArchived)} />

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
                  disabled={bulkStatusLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkStatusLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {bulkStatusLoading ? "Mengupdate..." : "Ubah Status"}
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

              <button
                onClick={handleBulkArchive}
                disabled={bulkArchiveLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkArchiveLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                {bulkArchiveLoading ? "Mengarsipkan..." : "Arsipkan Terpilih"}
              </button>

              {/* Bulk Delete */}
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkDeleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {bulkDeleteLoading ? "Menghapus..." : "Hapus Terpilih"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Filter"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Select All Checkbox */}
          {dateFilteredApps.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={
                selectedIds.length === dateFilteredApps.length
                  ? "Batal Pilih Semua"
                  : "Pilih Semua"
              }
            >
              {selectedIds.length === dateFilteredApps.length ? (
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}

          <div className="flex-1">
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

          {/* Deadline Filter Toggle */}
          <button
            onClick={() => setShowOnlyWithDeadline(!showOnlyWithDeadline)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border-2 ${
              showOnlyWithDeadline
                ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600 dark:border-purple-500"
                : "bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            }`}
            title="Filter hanya yang punya deadline (terurut dari deadline terdekat)"
          >
            <span className="text-sm font-medium">Punya Deadline</span>
            {showOnlyWithDeadline && (
              <span className="ml-1 bg-white/20 px-2 py-0.5 rounded text-xs">
                {
                  dateFilteredApps.filter((app) => app.deadline !== null)
                    .length
                }
              </span>
            )}
          </button>

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                "Urut"}
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
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={exportToCSV}
            disabled={filteredApps.length === 0 || exportLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={filter === "archived" ? "Export data arsip ke CSV" : "Export data aktif ke CSV"}
          >
            {exportLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {exportLoading ? "Exporting..." : "Export CSV"}
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

      {/* Applications Grid/Table */}
      {finalFilteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "all" && selectedMonth === "all" && selectedYear === "all" && !showOnlyWithDeadline
              ? "Belum ada lamaran. Tambahkan lamaran pertama Anda!"
              : "Tidak ada lamaran yang sesuai dengan filter yang dipilih"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Applications */}
          {finalFilteredApps.some(app => app.isPinned) && (
            <>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0">
                {finalFilteredApps.filter(app => app.isPinned).map((app) => {
                  // Different card styles based on status
                  let cardClassName = "relative flex flex-col bg-white dark:bg-gray-800 border rounded-lg p-5 hover:shadow-lg transition-shadow";
                  
                  if (app.status === "applied") {
                    cardClassName = "relative flex flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]";
                  } else if (app.status === "offer") {
                    cardClassName = "relative flex flex-col bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-2 border-green-400 dark:border-green-600 rounded-lg p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]";
                  } else if (app.status === "none") {
                    cardClassName = "relative flex flex-col bg-gray-50 dark:bg-gray-900/30 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow";
                  } else if (app.status === "reject") {
                    cardClassName = "relative flex flex-col bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800 rounded-lg p-5 hover:shadow-lg transition-shadow";
                  } else if (app.status === "unresponded") {
                    cardClassName = "relative flex flex-col bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-300 dark:border-orange-800 rounded-lg p-5 hover:shadow-lg transition-shadow";
                  } else if (app.status === "closed") {
                    cardClassName = "relative flex flex-col bg-gray-200 dark:bg-gray-700/70 border-2 border-gray-400 dark:border-gray-600 rounded-lg p-5 hover:shadow-lg transition-shadow opacity-60";
                  }

                  return (
                  <div
                    key={app.id}
                    className={`${cardClassName} cursor-pointer min-w-0 w-full`}
                    onClick={() => setViewingApp(app)}
                  >
              {/* Checkbox for bulk selection */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(app.id);
                  }}
                  className={`p-1 rounded transition-colors ${
                    app.status === "applied" || app.status === "offer"
                      ? "hover:bg-white/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {selectedIds.includes(app.id) ? (
                    <CheckSquare className={`w-5 h-5 ${
                      app.status === "applied"
                        ? "text-white"
                        : app.status === "offer"
                        ? "text-white"
                        : "text-blue-600 dark:text-blue-400"
                    }`} />
                  ) : (
                    <Square className={`w-5 h-5 ${
                      app.status === "applied"
                        ? "text-blue-100"
                        : app.status === "offer"
                        ? "text-green-100"
                        : "text-gray-400"
                    }`} />
                  )}
                </button>
              </div>

              <div className="flex items-start justify-between mb-4 gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-lg mb-1 wrap-break-word ${
                    app.status === "applied" || app.status === "offer"
                      ? "text-white" 
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {app.position}
                  </h3>
                  <p className={`text-sm wrap-break-word ${
                    app.status === "applied"
                      ? "text-blue-50"
                      : app.status === "offer"
                      ? "text-green-50"
                      : "text-gray-600 dark:text-gray-400"
                  }`}>
                    {app.companyName || "Perusahaan tidak disebutkan"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
                    app.status === "applied" || app.status === "offer"
                      ? "bg-white/20 text-white backdrop-blur-sm"
                      : statusColors[app.status as keyof typeof statusColors]
                  }`}
                >
                  {statusLabels[app.status as keyof typeof statusLabels]}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4 min-w-0">
                <div className={`flex items-center gap-2 ${
                  app.status === "applied"
                    ? "text-blue-50"
                    : app.status === "offer"
                    ? "text-green-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  <span className="wrap-break-word">{formatDate(app.appliedDate)}</span>
                </div>
                
                {/* Deadline Display */}
                {app.deadline && (() => {
                  const deadlineInfo = getDeadlineInfo(app.deadline);
                  return (
                    <div className={`flex items-center gap-2 ${
                      deadlineInfo.urgent ? 'animate-pulse' : ''
                    }`}>
                      <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                        app.status === "applied" || app.status === "offer"
                          ? "bg-white/10 backdrop-blur-sm border-white/30 text-white font-semibold"
                          : `${deadlineInfo.bgColor} ${deadlineInfo.borderColor} ${deadlineInfo.color} font-semibold`
                      }`}>
                        <div className="flex flex-col">
                          <span className="text-xs opacity-80">Deadline:</span>
                          <span className="text-sm font-bold">{deadlineInfo.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {app.platform && (
                  <div className={`flex items-center gap-2 min-w-0 ${
                    app.status === "applied"
                      ? "text-blue-50"
                      : app.status === "offer"
                      ? "text-green-50"
                      : "text-gray-600 dark:text-gray-400"
                  }`}>
                    <span className="shrink-0">🌐</span>
                    <span className="wrap-break-word">{app.platform.name}</span>
                  </div>
                )}
                <div className={`flex items-center gap-2 flex-wrap ${
                  app.status === "applied"
                    ? "text-blue-50"
                    : app.status === "offer"
                    ? "text-green-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  <span className="shrink-0">💼</span>
                  <span className="capitalize">
                    {app.jobType.replace("_", " ")}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{app.workPolicy}</span>
                </div>
                {(app.salaryMin || app.salaryMax) && (
                  <div className={`flex items-center gap-2 flex-wrap ${
                    app.status === "applied"
                      ? "text-blue-50"
                      : app.status === "offer"
                      ? "text-green-50"
                      : "text-gray-600 dark:text-gray-400"
                  }`}>
                    <span className="shrink-0">💰</span>
                    <span className="wrap-break-word">
                      {app.salaryMin && app.salaryMax
                        ? `${formatSalary(app.salaryMin)} - ${formatSalary(app.salaryMax)}`
                        : app.salaryMin
                        ? `${formatSalary(app.salaryMin)}+`
                        : `Up to ${formatSalary(app.salaryMax!)}`}
                    </span>
                  </div>
                )}
                {app.location && (
                  <div className={`flex items-center gap-2 min-w-0 ${
                    app.status === "applied"
                      ? "text-blue-50"
                      : app.status === "offer"
                      ? "text-green-50"
                      : "text-gray-600 dark:text-gray-400"
                  }`}>
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="wrap-break-word">{app.location}</span>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {app.notes && (
                <div className={`mt-3 px-3 py-2 rounded-lg ${
                  app.status === "applied"
                    ? "bg-blue-500/20 border border-blue-400/30"
                    : app.status === "offer"
                    ? "bg-green-500/20 border border-green-400/30"
                    : "bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                }`}>
                  <div className="flex items-start gap-2">
                    <span className={`text-sm mt-0.5 ${
                      app.status === "applied" || app.status === "offer"
                        ? "text-white/80"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>📝</span>
                    <p className={`text-sm flex-1 truncate ${
                      app.status === "applied"
                        ? "text-blue-50"
                        : app.status === "offer"
                        ? "text-green-50"
                        : "text-gray-700 dark:text-gray-300"
                    }`} title={app.notes}>
                      {app.notes}
                    </p>
                  </div>
                </div>
              )}

              <div className={`space-y-2 pt-4 mt-auto border-t ${
                app.status === "applied"
                  ? "border-blue-400/30"
                  : app.status === "offer"
                  ? "border-green-400/30"
                  : "border-gray-200 dark:border-gray-700"
              }`}>
                {/* Detail Button - Full Width */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/application/${app.id}`);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                >
                  <Eye className="w-4 h-4" />
                  <span>Lihat Detail</span>
                </button>
                
                {/* Other Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(app);
                  }}
                  disabled={pinningId === app.id}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    pinningId === app.id
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : app.isPinned 
                      ? "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600" 
                      : "bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                  } text-white`}
                  title={pinningId === app.id ? "Loading..." : (app.isPinned ? "Unpin" : "Pin")}
                >
                  {pinningId === app.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pin className={`w-4 h-4 ${app.isPinned ? 'fill-current' : ''}`} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(app);
                  }}
                  className="p-2 rounded-lg transition-colors bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shrink-0"
                  title="Duplikasi Lamaran"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {app.locationMapLink && (
                  <a
                    href={app.locationMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg transition-colors bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white shrink-0"
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
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg transition-colors bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white shrink-0"
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
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shrink-0"
                    title="Lihat Lowongan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingApp(app);
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg transition-colors bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white shrink-0"
                  title="Edit Lamaran"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (app.isArchived) {
                      handleUnarchive(app);
                    } else {
                      handleArchive(app);
                    }
                  }}
                  disabled={archivingId === app.id}
                  className={`p-2 rounded-lg transition-colors text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                    app.isArchived
                      ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                  }`}
                  title={
                    archivingId === app.id
                      ? app.isArchived
                        ? "Mengembalikan..."
                        : "Mengarsipkan..."
                      : app.isArchived
                      ? "Kembalikan dari Arsip"
                      : "Arsipkan Lamaran"
                  }
                >
                  {archivingId === app.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : app.isArchived ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingApp(app);
                  }}
                  className="p-2 rounded-lg transition-colors bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white shrink flex-1 flex justify-center"
                  title="Hapus Lamaran"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
        {finalFilteredApps.some(app => !app.isPinned) && (
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-gray-300 dark:border-gray-600">
              <Pin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Lamaran Lainnya
              </span>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
          </div>
        )}
      </>
          )}
          
          {/* Non-Pinned Applications */}
          {finalFilteredApps.some(app => !app.isPinned) && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0">
              {finalFilteredApps.filter(app => !app.isPinned).map((app) => {
                // Different card styles based on status
                let cardClassName = "relative flex flex-col bg-white dark:bg-gray-800 border rounded-lg p-5 hover:shadow-lg transition-shadow";
                
                if (app.status === "applied") {
                  cardClassName = "relative flex flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]";
                } else if (app.status === "offer") {
                  cardClassName = "relative flex flex-col bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-2 border-green-400 dark:border-green-600 rounded-lg p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]";
                } else if (app.status === "none") {
                  cardClassName = "relative flex flex-col bg-gray-50 dark:bg-gray-900/30 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow";
                } else if (app.status === "reject") {
                  cardClassName = "relative flex flex-col bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800 rounded-lg p-5 hover:shadow-lg transition-shadow";
                } else if (app.status === "unresponded") {
                  cardClassName = "relative flex flex-col bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-300 dark:border-orange-800 rounded-lg p-5 hover:shadow-lg transition-shadow";
                } else if (app.status === "closed") {
                  cardClassName = "relative flex flex-col bg-gray-200 dark:bg-gray-700/70 border-2 border-gray-400 dark:border-gray-600 rounded-lg p-5 hover:shadow-lg transition-shadow opacity-60";
                }

                return (
                <div
                  key={app.id}
                  className={`${cardClassName} cursor-pointer min-w-0 w-full`}
                  onClick={() => setViewingApp(app)}
                >
            {/* Checkbox for bulk selection */}
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(app.id);
                }}
                className={`p-1 rounded transition-colors ${
                  app.status === "applied" || app.status === "offer"
                    ? "hover:bg-white/20"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {selectedIds.includes(app.id) ? (
                  <CheckSquare className={`w-5 h-5 ${
                    app.status === "applied"
                      ? "text-white"
                      : app.status === "offer"
                      ? "text-white"
                      : "text-blue-600 dark:text-blue-400"
                  }`} />
                ) : (
                  <Square className={`w-5 h-5 ${
                    app.status === "applied"
                      ? "text-blue-100"
                      : app.status === "offer"
                      ? "text-green-100"
                      : "text-gray-400"
                  }`} />
                )}
              </button>
            </div>

            <div className="flex items-start justify-between mb-4 gap-2 min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg mb-1 wrap-break-word ${
                  app.status === "applied" || app.status === "offer"
                    ? "text-white" 
                    : "text-gray-900 dark:text-white"
                }`}>
                  {app.position}
                </h3>
                <p className={`text-sm wrap-break-word ${
                  app.status === "applied"
                    ? "text-blue-50"
                    : app.status === "offer"
                    ? "text-green-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  {app.companyName || "Perusahaan tidak disebutkan"}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
                  app.status === "applied" || app.status === "offer"
                    ? "bg-white/20 text-white backdrop-blur-sm"
                    : statusColors[app.status as keyof typeof statusColors]
                }`}
              >
                {statusLabels[app.status as keyof typeof statusLabels]}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4 min-w-0">
              <div className={`flex items-center gap-2 ${
                app.status === "applied"
                  ? "text-blue-50"
                  : app.status === "offer"
                  ? "text-green-50"
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                <span className="wrap-break-word">{formatDate(app.appliedDate)}</span>
              </div>
              
              {/* Deadline Display */}
              {app.deadline && (() => {
                const deadlineInfo = getDeadlineInfo(app.deadline);
                return (
                  <div className={`flex items-center gap-2 ${
                    deadlineInfo.urgent ? 'animate-pulse' : ''
                  }`}>
                    <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                      app.status === "applied" || app.status === "offer"
                        ? "bg-white/10 backdrop-blur-sm border-white/30 text-white font-semibold"
                        : `${deadlineInfo.bgColor} ${deadlineInfo.borderColor} ${deadlineInfo.color} font-semibold`
                    }`}>
                      <div className="flex flex-col">
                        <span className="text-xs opacity-80">Deadline:</span>
                        <span className="text-sm font-bold">{deadlineInfo.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {app.platform && (
                <div className={`flex items-center gap-2 min-w-0 ${
                  app.status === "applied"
                    ? "text-blue-50"
                    : app.status === "offer"
                    ? "text-green-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  <span className="shrink-0">🌐</span>
                  <span className="wrap-break-word">{app.platform.name}</span>
                </div>
              )}
              <div className={`flex items-center gap-2 flex-wrap ${
                app.status === "applied"
                  ? "text-blue-50"
                  : app.status === "offer"
                  ? "text-green-50"
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                <span className="shrink-0">💼</span>
                <span className="capitalize">
                  {app.jobType.replace("_", " ")}
                </span>
                <span>•</span>
                <span className="capitalize">{app.workPolicy}</span>
              </div>
              {(app.salaryMin || app.salaryMax) && (
                <div className={`flex items-center gap-2 flex-wrap ${
                  app.status === "applied"
                    ? "text-blue-50"
                    : app.status === "offer"
                    ? "text-green-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  <span className="shrink-0">💰</span>
                  <span className="wrap-break-word">
                    {app.salaryMin && app.salaryMax
                      ? `${formatSalary(app.salaryMin)} - ${formatSalary(app.salaryMax)}`
                      : app.salaryMin
                      ? `${formatSalary(app.salaryMin)}+`
                      : `Up to ${formatSalary(app.salaryMax!)}`}
                  </span>
                </div>
              )}
              {app.location && (
                <div className={`flex items-center gap-2 min-w-0 ${
                  app.status === "applied"
                    ? "text-blue-50"
                    : app.status === "offer"
                    ? "text-green-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="wrap-break-word">{app.location}</span>
                </div>
              )}
            </div>

            {/* Notes Section */}
            {app.notes && (
              <div className={`mt-3 px-3 py-2 rounded-lg ${
                app.status === "applied"
                  ? "bg-blue-500/20 border border-blue-400/30"
                  : app.status === "offer"
                  ? "bg-green-500/20 border border-green-400/30"
                  : "bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
              }`}>
                <div className="flex items-start gap-2">
                  <span className={`text-sm mt-0.5 ${
                    app.status === "applied" || app.status === "offer"
                      ? "text-white/80"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>📝</span>
                  <p className={`text-sm flex-1 truncate ${
                    app.status === "applied"
                      ? "text-blue-50"
                      : app.status === "offer"
                      ? "text-green-50"
                      : "text-gray-700 dark:text-gray-300"
                  }`} title={app.notes ?? undefined}>
                    {app.notes}
                  </p>
                </div>
              </div>
            )}

            <div className={`space-y-2 pt-4 mt-auto border-t ${
              app.status === "applied"
                ? "border-blue-400/30"
                : app.status === "offer"
                ? "border-green-400/30"
                : "border-gray-200 dark:border-gray-700"
            }`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/application/${app.id}`);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Detail</span>
              </button>
              
              <div className="flex flex-wrap items-center gap-2 justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(app);
                  }}
                  disabled={pinningId === app.id}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    pinningId === app.id
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : app.isPinned 
                      ? "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600" 
                      : "bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                  } text-white`}
                  title={pinningId === app.id ? "Loading..." : (app.isPinned ? "Unpin" : "Pin")}
                >
                  {pinningId === app.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pin className={`w-4 h-4 ${app.isPinned ? 'fill-current' : ''}`} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(app);
                  }}
                  className="p-2 rounded-lg transition-colors bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shrink-0"
                  title="Duplikasi Lamaran"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {app.locationMapLink && (
                  <a
                    href={app.locationMapLink ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg transition-colors bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white shrink-0"
                    title="Buka di Google Maps"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                )}
                {app.cvLink && (
                  <a
                    href={app.cvLink ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg transition-colors bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white shrink-0"
                    title="Lihat CV"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {app.jobLink && (
                  <a
                    href={app.jobLink ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shrink-0"
                    title="Lihat Lowongan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingApp(app);
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg transition-colors bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white shrink-0"
                  title="Edit Lamaran"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (app.isArchived) {
                      handleUnarchive(app);
                    } else {
                      handleArchive(app);
                    }
                  }}
                  disabled={archivingId === app.id}
                  className={`p-2 rounded-lg transition-colors text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                    app.isArchived
                      ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                  }`}
                  title={
                    archivingId === app.id
                      ? app.isArchived
                        ? "Mengembalikan..."
                        : "Mengarsipkan..."
                      : app.isArchived
                      ? "Kembalikan dari Arsip"
                      : "Arsipkan Lamaran"
                  }
                >
                  {archivingId === app.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : app.isArchived ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingApp(app);
                  }}
                  className="p-2 rounded-lg transition-colors bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white shrink flex-1 flex justify-center"
                  title="Hapus Lamaran"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
          )}
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
      </div>
    </div>
  );
}
