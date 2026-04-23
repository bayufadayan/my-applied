"use client";

import { TrendingUp, MessageSquare, ClipboardCheck, Gift } from "lucide-react";

interface JobApplication {
    id: string;
    status: string;
    currentStage: string;
    appliedDate: Date;
}

interface DashboardStatsProps {
    applications: JobApplication[];
}

export function DashboardStats({ applications }: DashboardStatsProps) {
    const total = applications.length;
    const interviewStages = new Set([
        "hr_interview",
        "user_interview",
        "final_interview",
    ]);
    const testStages = new Set([
        "technical_test",
        "psikotes",
        "final_interview",
        "offering",
        "accepted",
        "rejected",
    ]);
    const finalInterviewStages = new Set([
        "final_interview",
        "offering",
        "accepted",
        "rejected",
    ]);
    const offeringStages = new Set(["offering", "accepted"]);

    const reachedInterview = applications.filter((app) => interviewStages.has(app.currentStage)).length;
    const reachedTest = applications.filter((app) => testStages.has(app.currentStage)).length;
    const reachedFinalInterview = applications.filter((app) => finalInterviewStages.has(app.currentStage)).length;
    const reachedOffering = applications.filter((app) => offeringStages.has(app.currentStage)).length;

    return (
        <div className="space-y-6">
            {/* Stage-Based Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Lamaran</p>
                            <p className="text-3xl font-bold mt-2">{total}</p>
                        </div>
                        <TrendingUp className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-linear-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Sampai Interview</p>
                            <p className="text-3xl font-bold mt-2">{reachedInterview}</p>
                            <p className="text-purple-100 text-xs mt-1">dari {total} lamaran</p>
                        </div>
                        <MessageSquare className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-linear-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Sampai Tahap Test</p>
                            <p className="text-3xl font-bold mt-2">{reachedTest}</p>
                            <p className="text-orange-100 text-xs mt-1">dari {total} lamaran</p>
                        </div>
                        <ClipboardCheck className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-linear-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Sampai Offering</p>
                            <p className="text-3xl font-bold mt-2">{reachedOffering}</p>
                            <p className="text-green-100 text-xs mt-1">Final interview: {reachedFinalInterview}</p>
                        </div>
                        <Gift className="w-12 h-12 opacity-80" />
                    </div>
                </div>
            </div>
        </div>
    );
}
