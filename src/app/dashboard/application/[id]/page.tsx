"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, Building2, Briefcase, DollarSign, MapPin, 
  User, FileText, StickyNote, ExternalLink, Edit, Trash2, Clock,
  CheckCircle2, AlertCircle, XCircle, Circle, Target, TrendingUp, Loader2
} from "lucide-react";

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
  platform?: Platform | null;
}

const statusConfig = {
  applied: {
    label: "Applied",
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-800 dark:text-blue-200",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: Circle,
  },
  interview: {
    label: "Interview",
    color: "bg-purple-500",
    lightColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-800 dark:text-purple-200",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: AlertCircle,
  },
  test: {
    label: "Test",
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50 dark:bg-yellow-900/20",
    textColor: "text-yellow-800 dark:text-yellow-200",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: FileText,
  },
  offer: {
    label: "Offer",
    color: "bg-green-500",
    lightColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-800 dark:text-green-200",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle2,
  },
  reject: {
    label: "Rejected",
    color: "bg-red-500",
    lightColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-800 dark:text-red-200",
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-500",
    lightColor: "bg-gray-50 dark:bg-gray-900/20",
    textColor: "text-gray-800 dark:text-gray-200",
    borderColor: "border-gray-200 dark:border-gray-800",
    icon: Circle,
  },
  unresponded: {
    label: "Unresponded",
    color: "bg-orange-500",
    lightColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-800 dark:text-orange-200",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: Clock,
  },
  none: {
    label: "None",
    color: "bg-gray-400",
    lightColor: "bg-gray-50 dark:bg-gray-900/20",
    textColor: "text-gray-800 dark:text-gray-200",
    borderColor: "border-gray-200 dark:border-gray-800",
    icon: Circle,
  },
};

const stageLabels: Record<string, string> = {
  cv_screening: "CV Screening",
  hr_interview: "HR Interview",
  user_interview: "User Interview",
  technical_test: "Technical Test",
  psikotes: "Psikotes",
  final_interview: "Final Interview",
  offering: "Offering",
  rejected: "Rejected",
  accepted: "Accepted",
  none: "None",
};

function formatSalary(amount: number): string {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)} jt`;
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)} rb`;
  }
  return `Rp ${amount}`;
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

function getDaysAgo(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - new Date(date).getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}

function getDeadlineInfo(deadline: Date) {
  const now = new Date();
  const diffTime = new Date(deadline).getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
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

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchApplication() {
    try {
      const res = await fetch(`/api/applications/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
      } else {
        setError("Lamaran tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal memuat data lamaran");
      console.error("Error fetching application:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus lamaran ini?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Gagal menghapus lamaran");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const statusInfo = statusConfig[application.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header dengan Gradient */}
      <div className={`${statusInfo.color} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusIcon className="w-8 h-8" />
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {statusInfo.label}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{application.position}</h1>
              <p className="text-xl text-white/90">
                {application.companyName || "Perusahaan tidak disebutkan"}
              </p>
              <p className="text-sm text-white/70 mt-2">
                Dilamar {getDaysAgo(application.appliedDate)} · {formatDate(application.appliedDate)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/dashboard?edit=${application.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deadline Card */}
            {application.deadline && (() => {
              const deadlineInfo = getDeadlineInfo(application.deadline);
              return (
                <div className={`${deadlineInfo.bgColor} border-2 ${deadlineInfo.borderColor} rounded-xl p-6 ${deadlineInfo.urgent ? 'animate-pulse' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{deadlineInfo.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold ${deadlineInfo.color}`}>
                        Deadline Lamaran
                      </h3>
                      <p className={`text-2xl font-bold ${deadlineInfo.color}`}>
                        {deadlineInfo.text}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(application.deadline)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Current Stage */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tahap Saat Ini
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stageLabels[application.currentStage] || application.currentStage}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            {/* Job Description */}
            {application.jobDescription && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Deskripsi Pekerjaan
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {application.jobDescription}
                </p>
              </div>
            )}

            {/* Notes */}
            {application.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-sm border-2 border-amber-200 dark:border-amber-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <StickyNote className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Catatan
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {application.notes}
                </p>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Link & Dokumen
              </h2>
              <div className="space-y-3">
                {application.jobLink && (
                  <a
                    href={application.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="flex-1 text-gray-900 dark:text-white font-medium">
                      Lihat Lowongan
                    </span>
                    <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
                {application.cvLink && (
                  <a
                    href={application.cvLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="flex-1 text-gray-900 dark:text-white font-medium">
                      Lihat CV
                    </span>
                    <ArrowLeft className="w-4 h-4 text-green-600 dark:text-green-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
                {application.locationMapLink && (
                  <a
                    href={application.locationMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors group"
                  >
                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="flex-1 text-gray-900 dark:text-white font-medium">
                      Buka di Maps
                    </span>
                    <ArrowLeft className="w-4 h-4 text-orange-600 dark:text-orange-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Info Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Informasi Detail
              </h2>

              {application.platform && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {application.platform.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tipe Pekerjaan</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {application.jobType.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kebijakan Kerja</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {application.workPolicy}
                  </p>
                </div>
              </div>

              {application.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lokasi</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {application.location}
                    </p>
                  </div>
                </div>
              )}

              {(application.salaryMin || application.salaryMax) && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Range Gaji</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {application.salaryMin && application.salaryMax
                        ? `${formatSalary(application.salaryMin)} - ${formatSalary(application.salaryMax)}`
                        : application.salaryMin
                        ? `${formatSalary(application.salaryMin)}+`
                        : `Up to ${formatSalary(application.salaryMax!)}`}
                    </p>
                  </div>
                </div>
              )}

              {application.hrContact && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kontak HR</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {application.hrContact}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Melamar</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(application.appliedDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
