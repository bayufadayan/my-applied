"use client";

import { TrendingUp, FileText, MessageSquare, ClipboardCheck, Gift, XCircle, BellOff, Archive } from "lucide-react";

interface JobApplication {
    id: string;
    status: string;
    appliedDate: Date;
}

interface DashboardStatsProps {
    applications: JobApplication[];
}

const statusConfig = {
    applied: { label: "Applied", icon: FileText, color: "blue", darkColor: "blue" },
    interview: { label: "Interview", icon: MessageSquare, color: "purple", darkColor: "purple" },
    test: { label: "Test", icon: ClipboardCheck, color: "yellow", darkColor: "yellow" },
    offer: { label: "Offer", icon: Gift, color: "green", darkColor: "green" },
    reject: { label: "Rejected", icon: XCircle, color: "red", darkColor: "red" },
    unresponded: { label: "Unresponded", icon: BellOff, color: "orange", darkColor: "orange" },
    closed: { label: "Closed", icon: Archive, color: "gray", darkColor: "gray" },
    none: { label: "None", icon: FileText, color: "gray", darkColor: "gray" },
};

export function DashboardStats({ applications }: DashboardStatsProps) {
    const total = applications.length;

    // Count by status
    const stats = {
        applied: applications.filter(app => app.status === "applied").length,
        interview: applications.filter(app => app.status === "interview").length,
        test: applications.filter(app => app.status === "test").length,
        offer: applications.filter(app => app.status === "offer").length,
        reject: applications.filter(app => app.status === "reject").length,
        unresponded: applications.filter(app => app.status === "unresponded").length,
        closed: applications.filter(app => app.status === "closed").length,
        none: applications.filter(app => app.status === "none").length,
    };

    // Calculate success metrics
    const activeApplications = stats.applied + stats.interview + stats.test;
    const positiveOutcomes = stats.offer;
    const negativeOutcomes = stats.reject + stats.unresponded + stats.closed;
    const successRate = total > 0 ? ((positiveOutcomes / total) * 100).toFixed(1) : "0";
    const responseRate = total > 0 ? (((total - stats.unresponded) / total) * 100).toFixed(1) : "0";
    const interviewRate = total > 0 ? (((stats.interview + stats.test + stats.offer) / total) * 100).toFixed(1) : "0";

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Applications */}
                <div className="bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Lamaran</p>
                            <p className="text-3xl font-bold mt-2">{total}</p>
                        </div>
                        <TrendingUp className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                {/* Success Rate */}
                <div className="bg-linear-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Success Rate</p>
                            <p className="text-3xl font-bold mt-2">{successRate}%</p>
                            <p className="text-green-100 text-xs mt-1">{positiveOutcomes} offers</p>
                        </div>
                        <Gift className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                {/* Interview Rate */}
                <div className="bg-linear-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Interview Rate</p>
                            <p className="text-3xl font-bold mt-2">{interviewRate}%</p>
                            <p className="text-purple-100 text-xs mt-1">{stats.interview + stats.test} interviews</p>
                        </div>
                        <MessageSquare className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                {/* Response Rate */}
                <div className="bg-linear-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Response Rate</p>
                            <p className="text-3xl font-bold mt-2">{responseRate}%</p>
                            <p className="text-orange-100 text-xs mt-1">{stats.unresponded} no response</p>
                        </div>
                        <BellOff className="w-12 h-12 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Status Distribution
                </h3>

                {/* Progress Bars */}
                <div className="space-y-4">
                    {Object.entries(stats).map(([status, count]) => {
                        if (count === 0) return null;
                        const config = statusConfig[status as keyof typeof statusConfig];
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        const Icon = config.icon;

                        return (
                            <div key={status}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.darkColor}-400`} />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {config.label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {count} ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`bg-${config.color}-600 dark:bg-${config.darkColor}-500 h-2.5 rounded-full transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeApplications}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Process</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{positiveOutcomes}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Offers Received</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{negativeOutcomes}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Closed/Rejected</p>
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            {total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 <span className="font-semibold">Insight:</span> Dari {total} lamaran, {stats.interview + stats.test + stats.offer} ({interviewRate}%) mencapai tahap interview atau lebih.
                        </p>
                    </div>

                    {stats.unresponded > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                            <p className="text-sm text-orange-800 dark:text-orange-300">
                                ⚠️ <span className="font-semibold">Perhatian:</span> {stats.unresponded} lamaran belum mendapat respons (lebih dari 35 hari).
                            </p>
                        </div>
                    )}

                    {positiveOutcomes > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <p className="text-sm text-green-800 dark:text-green-300">
                                🎉 <span className="font-semibold">Congratulations!</span> Anda sudah mendapat {positiveOutcomes} tawaran kerja!
                            </p>
                        </div>
                    )}

                    {activeApplications > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                                🔄 <span className="font-semibold">In Progress:</span> {activeApplications} lamaran masih dalam proses. Tetap semangat!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
