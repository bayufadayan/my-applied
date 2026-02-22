"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Zap, Loader2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
}

interface ApplicationFormProps {
  application?: JobApplication | null;
  onClose: () => void;
  onSuccess: () => void;
  isDuplicate?: boolean;
}

export function ApplicationForm({
  application,
  onClose,
  onSuccess,
  isDuplicate = false,
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [customPlatformName, setCustomPlatformName] = useState("");
  const [isQuickAddMode, setIsQuickAddMode] = useState(false);
  const [includeDeadline, setIncludeDeadline] = useState(!!application?.deadline);
  const [formData, setFormData] = useState({
    companyName: application?.companyName || "",
    position: application?.position || "",
    jobType: application?.jobType || "full_time",
    workPolicy: application?.workPolicy || "remote",
    salaryMin: application?.salaryMin?.toString() || "",
    salaryMax: application?.salaryMax?.toString() || "",
    jobDescription: application?.jobDescription || "",
    appliedDate: application?.appliedDate ? new Date(application.appliedDate) : new Date(),
    deadline: application?.deadline ? new Date(application.deadline) : new Date(),
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

  // Position suggestions
  const positionSuggestions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Data Analyst",
    "UI/UX Designer",
    "Product Manager",
    "Project Manager",
    "QA Engineer",
    "Software Engineer",
    "System Analyst",
    "IT Support",
    "Network Engineer",
    "Database Administrator",
    "Security Engineer",
    "Cloud Engineer",
    "Machine Learning Engineer",
    "Business Analyst",
  ];

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
    
    // Only submit when on final step (skip this check in Quick Add Mode)
    if (!isQuickAddMode && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    setLoading(true);

    try {
      let finalPlatformId = formData.platformId;

      // Create custom platform if "other" is selected
      if (formData.platformId === "other" && customPlatformName.trim()) {
        const platformRes = await fetch("/api/platforms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: customPlatformName.trim() }),
        });
        
        if (platformRes.ok) {
          const newPlatform = await platformRes.json();
          finalPlatformId = newPlatform.id;
        }
      }

      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin.replace(/\D/g, "")) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax.replace(/\D/g, "")) : null,
        appliedDate: formData.appliedDate,
        deadline: includeDeadline ? formData.deadline : null,
        platformId: finalPlatformId === "other" ? null : finalPlatformId || null,
        companyName: formData.companyName || null,
        jobDescription: formData.jobDescription || null,
        hrContact: formData.hrContact || null,
        cvLink: formData.cvLink || null,
        jobLink: formData.jobLink || null,
        notes: formData.notes || null,
      };

      const url = application && !isDuplicate
        ? `/api/applications/${application.id}`
        : "/api/applications";
      const method = application && !isDuplicate ? "PUT" : "POST";

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

  // Toggle Quick Add Mode
  function toggleQuickAddMode() {
    setIsQuickAddMode(!isQuickAddMode);
    // Reset to step 1 when switching modes
    setCurrentStep(1);
  }

  const steps = [
    { number: 1, label: "Info Dasar" },
    { number: 2, label: "Detail Pekerjaan" },
    { number: 3, label: "Desc & Catatan" },
    { number: 4, label: "Link & Dokumen" },
    { number: 5, label: "Status & Tahapan" },
  ];

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Format number with space separator
  const formatNumber = (num: string): string => {
    if (!num) return "";
    // Remove all non-digit characters
    const cleanNum = num.replace(/\D/g, "");
    if (!cleanNum) return "";
    // Add space every 3 digits from right
    return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Parse input value (supports comma for decimals like 1,5)
  const parseInputValue = (value: string): number => {
    if (!value) return 0;
    // Replace comma with dot for decimal parsing
    const normalizedValue = value.replace(/,/g, ".");
    // Remove all spaces
    const cleaned = normalizedValue.replace(/\s/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Handle salary multiplier buttons
  const applySalaryMultiplier = (field: "salaryMin" | "salaryMax", multiplier: number) => {
    const currentValue = formData[field];
    const parsedValue = parseInputValue(currentValue);
    const result = Math.round(parsedValue * multiplier);
    setFormData({ ...formData, [field]: result.toString() });
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isDuplicate ? "Duplikasi Lamaran" : application ? "Edit Lamaran" : "Tambah Lamaran Baru"}
            </h2>
            {isDuplicate && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                📋 Duplicate Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Add Button - Only in Create Mode */}
            {!application && (
              <button
                type="button"
                onClick={toggleQuickAddMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  isQuickAddMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                }`}
                title={isQuickAddMode ? "Kembali ke Full Form" : "Simpan cepat dengan field wajib saja"}
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">{isQuickAddMode ? "Full Form" : "Quick Add"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Progress Indicator - Hide in Quick Add Mode */}
        {!isQuickAddMode && (
          <div className="px-6 py-8">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
              💡 Klik pada step untuk navigasi cepat
            </p>
            <div className="flex items-center justify-between max-w-xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center" style={{ flex: '1 1 0' }}>
                {/* Step Circle */}
                <div className="flex flex-col items-center" style={{ width: '80px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.number)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 cursor-pointer ${
                      currentStep > step.number
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : currentStep === step.number
                        ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    title={`${step.label}`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.number)}
                    className={`mt-2 text-xs font-medium text-center transition-colors hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer leading-tight ${
                      currentStep >= step.number
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    style={{ width: '80px' }}
                  >
                    {step.label}
                  </button>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 -mt-8 min-w-5">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        currentStep > step.number
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="max-w-xl mx-auto space-y-4">
            {/* Quick Add Mode - Simple Form */}
            {isQuickAddMode && (
              <div className="space-y-4 animate-fadeIn">
                {/* Quick Add Info */}
                <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-purple-800 dark:text-purple-200">
                      <span className="font-semibold">Quick Add Mode:</span> Hanya isi field wajib (<span className="text-red-500">*</span>). Detail lain bisa ditambahkan nanti lewat Edit.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Posisi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="position-suggestions"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      placeholder="Ketik atau pilih dari suggestions..."
                    />
                    {formData.position && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, position: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <datalist id="position-suggestions">
                    {positionSuggestions.map((pos, idx) => (
                      <option key={idx} value={pos} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      placeholder="PT. Contoh Perusahaan"
                    />
                    {formData.companyName && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, companyName: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Lamar <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.appliedDate}
                    onChange={(date: Date | null) =>
                      setFormData({ ...formData, appliedDate: date || new Date() })
                    }
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="Pilih tanggal..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Full Form - Multi-step */}
            {!isQuickAddMode && (
              <>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Posisi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          list="position-suggestions"
                          value={formData.position}
                          onChange={(e) =>
                            setFormData({ ...formData, position: e.target.value })
                          }
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                          placeholder="Ketik atau pilih dari suggestions..."
                        />
                        {formData.position && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, position: "" })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <datalist id="position-suggestions">
                        {positionSuggestions.map((pos, idx) => (
                          <option key={idx} value={pos} />
                        ))}
                      </datalist>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Mulai ketik untuk melihat suggestions
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama Perusahaan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) =>
                            setFormData({ ...formData, companyName: e.target.value })
                          }
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                          placeholder="PT. Contoh Perusahaan"
                        />
                        {formData.companyName && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, companyName: "" })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Platform
                      </label>
                      <select
                        value={formData.platformId}
                        onChange={(e) => {
                          setFormData({ ...formData, platformId: e.target.value });
                          if (e.target.value !== "other") {
                            setCustomPlatformName("");
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      >
                        <option value="">Pilih Platform</option>
                        {platforms.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                        <option value="other">🆕 Lain-lain (Custom)</option>
                      </select>

                      {/* Custom Platform Input */}
                      {formData.platformId === "other" && (
                        <div className="mt-3 animate-fadeIn">
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={customPlatformName}
                              onChange={(e) => setCustomPlatformName(e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                              placeholder="Masukkan nama platform..."
                            />
                            {customPlatformName && (
                              <button
                                type="button"
                                onClick={() => setCustomPlatformName("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Platform akan otomatis ditambahkan ke sistem
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal Lamar <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.appliedDate}
                        onChange={(date: Date | null) =>
                          setFormData({ ...formData, appliedDate: date || new Date() })
                        }
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        placeholderText="Pilih tanggal..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        📅 Pilih tanggal ketika Anda melamar
                      </p>
                    </div>

                    {/* Checkbox untuk Deadline */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeDeadline"
                        checked={includeDeadline}
                        onChange={(e) => setIncludeDeadline(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="includeDeadline"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        Sertakan deadline
                      </label>
                    </div>

                    {/* Field Deadline - Conditional */}
                    {includeDeadline && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Deadline Lamaran
                        </label>
                        <DatePicker
                          selected={formData.deadline}
                          onChange={(date: Date | null) =>
                            setFormData({ ...formData, deadline: date || new Date() })
                          }
                          dateFormat="dd/MM/yyyy"
                          minDate={formData.appliedDate}
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                          placeholderText="Pilih tanggal deadline..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ⏰ Tanggal terakhir untuk melamar atau merespon
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
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
                    Lokasi
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      placeholder="Jakarta Barat, Bogor, dll"
                    />
                    {formData.location && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, location: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gaji Minimum (Rp)
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={formatNumber(formData.salaryMin)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          setFormData({ ...formData, salaryMin: value });
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                        placeholder="Ketik angka (contoh: 5 atau 5,5)"
                      />
                      {formData.salaryMin && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, salaryMin: "" })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => applySalaryMultiplier("salaryMin", 100)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        × Ratus
                      </button>
                      <button
                        type="button"
                        onClick={() => applySalaryMultiplier("salaryMin", 1000)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        × Ribu
                      </button>
                      <button
                        type="button"
                        onClick={() => applySalaryMultiplier("salaryMin", 1000000)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                      >
                        × Juta
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 Ketik angka lalu klik tombol shortcut (contoh: 5,5 × Juta = 5 500 000)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gaji Maximum (Rp)
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={formatNumber(formData.salaryMax)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          setFormData({ ...formData, salaryMax: value });
                        }}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                        placeholder="Ketik angka (contoh: 8 atau 8,5)"
                      />
                      {formData.salaryMax && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, salaryMax: "" })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => applySalaryMultiplier("salaryMax", 100)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        × Ratus
                      </button>
                      <button
                        type="button"
                        onClick={() => applySalaryMultiplier("salaryMax", 1000)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        × Ribu
                      </button>
                      <button
                        type="button"
                        onClick={() => applySalaryMultiplier("salaryMax", 1000000)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                      >
                        × Juta
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 Ketik angka lalu klik tombol shortcut (contoh: 5,5 × Juta = 5 500 000)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Description & Notes */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tips:</strong> Ruang ini lebih luas untuk Anda menulis Job Description dan Catatan dengan lebih leluasa.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.jobDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, jobDescription: e.target.value })
                      }
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none resize-y"
                      placeholder="Tulis deskripsi pekerjaan secara lengkap...&#10;&#10;Contoh:&#10;- Tanggung jawab utama&#10;- Requirement yang dibutuhkan&#10;- Benefit yang ditawarkan&#10;- Tech stack yang digunakan"
                    />
                    {formData.jobDescription && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, jobDescription: "" })}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.jobDescription.length} karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan Pribadi
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none resize-y"
                      placeholder="Tulis catatan pribadi Anda...&#10;&#10;Contoh:&#10;- Kesan setelah interview&#10;- Hal yang perlu dipersiapkan&#10;- Kontak person atau referensi&#10;- Informasi penting lainnya"
                    />
                    {formData.notes && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, notes: "" })}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.notes.length} karakter
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Links & Documents */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link Lowongan
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.jobLink}
                      onChange={(e) =>
                        setFormData({ ...formData, jobLink: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      placeholder="https://linkedin.com/jobs/..."
                    />
                    {formData.jobLink && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, jobLink: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link CV
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.cvLink}
                      onChange={(e) =>
                        setFormData({ ...formData, cvLink: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      placeholder="https://drive.google.com/..."
                    />
                    {formData.cvLink && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cvLink: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link Google Maps (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.locationMapLink}
                      onChange={(e) =>
                        setFormData({ ...formData, locationMapLink: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      placeholder="https://maps.google.com/... atau https://goo.gl/maps/..."
                    />
                    {formData.locationMapLink && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, locationMapLink: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Tip: Buka Google Maps, cari lokasi kantor, klik Share → Copy link
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Status & Stage */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
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
                    <option value="unresponded">Unresponded</option>
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
                    <option value="psikotes">Psikotes</option>
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
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.hrContact}
                      onChange={(e) =>
                        setFormData({ ...formData, hrContact: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                      placeholder="hr@company.com atau nomor WhatsApp"
                    />
                    {formData.hrContact && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, hrContact: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 max-w-xl mx-auto">
            {/* Quick Add Mode - Simple Navigation */}
            {isQuickAddMode ? (
              <>
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
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Menyimpan..." : "Simpan Cepat"}
                </button>
              </>
            ) : (
              /* Full Form Mode - Step Navigation */
              <>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Kembali
                  </button>
                )}
                
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Lanjut
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Menyimpan..." : application ? "Update" : "Simpan"}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
