"use client";

import { X, ExternalLink, Calendar, Building2, Briefcase, DollarSign, MapPin, User, FileText, StickyNote } from "lucide-react";

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

interface ApplicationDetailProps {
  application: JobApplication;
  onClose: () => void;
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

const stageLabels = {
  screening: "Screening",
  interview_hr: "Interview HR",
  interview_user: "Interview User",
  interview_technical: "Interview Technical",
  offering: "Offering",
  negotiation: "Negotiation",
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

export function ApplicationDetail({ application, onClose }: ApplicationDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {application.position}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {application.companyName || "Perusahaan tidak disebutkan"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Stage */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                statusColors[application.status as keyof typeof statusColors]
              }`}
            >
              Status: {statusLabels[application.status as keyof typeof statusLabels]}
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              Stage: {stageLabels[application.currentStage as keyof typeof stageLabels]}
            </span>
          </div>

          {/* Main Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Melamar</p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {formatDate(application.appliedDate)}
                </p>
              </div>
            </div>

            {application.platform && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Platform</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {application.platform.name}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipe Pekerjaan</p>
                <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">
                  {application.jobType.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kebijakan Kerja</p>
                <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">
                  {application.workPolicy}
                </p>
              </div>
            </div>

            {(application.salaryMin || application.salaryMax) && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg md:col-span-2">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Range Gaji</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
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
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg md:col-span-2">
                <User className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kontak HR</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {application.hrContact}
                  </p>
                </div>
              </div>
            )}

            {application.location && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg md:col-span-2">
                <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lokasi</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {application.location}
                    </p>
                    {application.locationMapLink && (
                      <a
                        href={application.locationMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          {application.jobDescription && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Deskripsi Pekerjaan
                </h3>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {application.jobDescription}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Catatan
                </h3>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {application.cvLink && (
              <a
                href={application.cvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat CV
              </a>
            )}
            {application.jobLink && (
              <a
                href={application.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat Lowongan
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
