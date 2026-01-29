'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Recommendation } from '@/lib/api';

interface JobCardProps {
  recommendation: Recommendation;
  onSwipe: (direction: 'left' | 'right', aspect?: string) => void;
}

export default function JobCard({ recommendation, onSwipe }: JobCardProps) {
  const { job, match_score, reasons } = recommendation;
  const [exitX, setExitX] = useState(0);
  const [selectedAspect, setSelectedAspect] = useState<string>('overall');

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200);
      onSwipe(info.offset.x > 0 ? 'right' : 'left', selectedAspect);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max)
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return 'Not specified';
  };

  const aspects = [
    { key: 'overall', label: 'Overall', icon: '⭐' },
    {
      key: 'salary',
      label: 'Salary',
      icon: '💰',
      value: formatSalary(job.salary_min, job.salary_max),
    },
    {
      key: 'location',
      label: 'Location',
      icon: '📍',
      value: job.city && job.state ? `${job.city}, ${job.state}` : job.location,
    },
    { key: 'company', label: 'Company', icon: '🏢', value: job.company },
    {
      key: 'skills',
      label: 'Skills',
      icon: '🎯',
      value: job.required_skills?.length
        ? `${job.required_skills.length} skills`
        : undefined,
    },
  ];

  return (
    <motion.div
      className="w-full max-w-sm relative"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Match Score Badge */}
        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
          {match_score.toFixed(0)}% ROE
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
          <p className="text-purple-100 text-lg">
            {job.company || 'Company Not Listed'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Aspects to Swipe */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Tap an aspect to rate it:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {aspects.map((aspect) => (
                <button
                  key={aspect.key}
                  onClick={() => setSelectedAspect(aspect.key)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedAspect === aspect.key
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{aspect.icon}</span>
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {aspect.label}
                      </div>
                      {aspect.value && (
                        <div className="text-xs text-gray-600 truncate">
                          {aspect.value}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Currently rating:{' '}
              <span className="font-semibold text-purple-600">
                {aspects.find((a) => a.key === selectedAspect)?.label}
              </span>
            </p>
          </div>

          {/* Job Details */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">💰</span>
              <span className="text-sm">
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
            </div>

            {job.location && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">📍</span>
                <span className="text-sm">
                  {job.city}, {job.state}
                </span>
              </div>
            )}

            {job.employment_type && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">⏰</span>
                <span className="text-sm">{job.employment_type}</span>
              </div>
            )}

            {job.remote_work && (
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                🏠 Remote Available
              </div>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 line-clamp-3">
                {job.description}
              </p>
            </div>
          )}

          {/* Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Required Skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {job.required_skills.length > 6 && (
                  <span className="px-2 py-1 text-gray-500 text-xs">
                    +{job.required_skills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* AOI Scores */}
          {job.aoi_score && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Opportunity Scores:
              </p>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Overall', value: job.aoi_score },
                  { label: 'Wage', value: job.aoi_wage_score },
                  { label: 'Mobility', value: job.aoi_mobility_score },
                  { label: 'Access', value: job.aoi_access_score },
                ].map(
                  (score) =>
                    score.value && (
                      <div
                        key={score.label}
                        className="flex items-center gap-2"
                      >
                        <span className="text-gray-600 w-16">
                          {score.label}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(score.value / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700 font-medium w-8">
                          {score.value.toFixed(1)}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {/* Reasons */}
          {reasons.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Why we recommend this:
              </p>
              <ul className="space-y-1">
                {reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 p-6 pt-0">
          <button
            onClick={() => onSwipe('left', selectedAspect)}
            className="flex-1 py-4 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors"
          >
            👎 Pass
          </button>
          <button
            onClick={() => onSwipe('right', selectedAspect)}
            className="flex-1 py-4 bg-green-100 text-green-600 rounded-xl font-semibold hover:bg-green-200 transition-colors"
          >
            👍 Like
          </button>
        </div>
      </div>
    </motion.div>
  );
}
