"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jobAPI, JobListing } from "@/lib/api";
import { storage } from "@/lib/storage";
import JobModal from "@/components/JobModal";

export default function ResultsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = storage.getUserId();
    if (!id) {
      router.push("/onboarding");
      return;
    }
    setUserId(id);
    fetchJobs(id);
  }, [router]);

  const fetchJobs = async (userId: number) => {
    try {
      const response = await jobAPI.getAll({ user_id: userId, limit: 50 });
      setJobs(response.jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return "Not specified";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-sm text-gray-600 mt-1">
            {jobs.length} opportunities found
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => router.push("/results")}
            className="flex-1 py-3 text-center font-medium text-blue-600 border-b-2 border-blue-600"
          >
            All Jobs
          </button>
          <button
            onClick={() => router.push("/explore")}
            className="flex-1 py-3 text-center font-medium text-gray-600 hover:text-gray-900"
          >
            Explore
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-gray-600 text-lg">No jobs found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your preferences
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{job.company}</p>
                  </div>
                  {job.match_score && (
                    <div className="ml-3 flex-shrink-0">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {job.match_score.toFixed(0)}% ROE
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-600">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      📍 {job.city}, {job.state}
                    </span>
                  )}
                  {job.salary_min && (
                    <span className="flex items-center gap-1">
                      💰 {formatSalary(job.salary_min, job.salary_max)}
                    </span>
                  )}
                  {job.remote_work && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                      Remote
                    </span>
                  )}
                </div>

                {job.aoi_score && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Opportunity Score:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${(job.aoi_score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {job.aoi_score.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Modal */}
      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
