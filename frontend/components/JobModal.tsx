'use client';

import { JobListing } from '@/lib/api';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface JobModalProps {
  job: JobListing;
  onClose: () => void;
}

export default function JobModal({ job, onClose }: JobModalProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max)
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return 'Not specified';
  };
  const [articles, setArticles] = useState<Array<any>>([]);

  useEffect(() => {
    async function getArticles(company: string) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(company)}&apiKey=2fad5fa8223a49c0ba501e764f51b83c`,
        );
        const data = await response.json();
        console.log({ data });
        setArticles(data.articles.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching news articles:', error);
      }
    }
    if (job) {
      getArticles(job.company || '');
    }
  }, [job]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sticky top-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
              <p className="text-blue-100 text-lg">
                {job.company || 'Company Not Listed'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none ml-4"
            >
              ×
            </button>
          </div>
          {job.match_score && (
            <div className="mt-4 inline-block bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              <span className="font-semibold">
                {job.match_score.toFixed(0)}% ROE
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Salary</p>
              <p className="font-semibold text-gray-900">
                {formatSalary(job.salary_min, job.salary_max)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-semibold text-gray-900">
                {job.city && job.state
                  ? `${job.city}, ${job.state}`
                  : job.location || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Employment Type</p>
              <p className="font-semibold text-gray-900">
                {job.employment_type || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Industry</p>
              <p className="font-semibold text-gray-900">
                {job.industry || 'Not specified'}
              </p>
            </div>
          </div>

          {job.remote_work && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                🏠 Remote work available
              </p>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Job Description
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {/* Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {(job.education_required || job.experience_required) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Requirements
              </h3>
              <div className="space-y-2">
                {job.education_required && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">📚</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Education
                      </p>
                      <p className="text-gray-600">{job.education_required}</p>
                    </div>
                  </div>
                )}
                {job.experience_required && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">💼</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Experience
                      </p>
                      <p className="text-gray-600">{job.experience_required}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AOI Scores */}
          {job.aoi_score && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Opportunity Scores
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Based on American Opportunity Index data
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: 'Overall Score',
                    value: job.aoi_score,
                    description: 'Combined opportunity rating',
                  },
                  {
                    label: 'Wage Score',
                    value: job.aoi_wage_score,
                    description: 'Compensation potential',
                  },
                  {
                    label: 'Mobility Score',
                    value: job.aoi_mobility_score,
                    description: 'Career growth opportunity',
                  },
                  {
                    label: 'Access Score',
                    value: job.aoi_access_score,
                    description: 'Ease of entry',
                  },
                  {
                    label: 'Job Quality',
                    value: job.aoi_job_quality_score,
                    description: 'Overall job quality',
                  },
                ].map(
                  (score) =>
                    score.value && (
                      <div key={score.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {score.label}
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            {score.value.toFixed(1)}/5.0
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(score.value / 5) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {score.description}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {/* In the news */}
          {articles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                In the news
              </h3>
              <ul className="text-gray-700 whitespace-pre-line">
                {articles.map((article, index) => (
                  <li key={index} className="mb-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {article.title}
                    </a>
                    {/* <p className="text-sm text-gray-600">
                      {article.description}
                    </p> */}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Link */}
          {job.url && (
            <div className="pt-4 border-t border-gray-200">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Apply Now →
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
