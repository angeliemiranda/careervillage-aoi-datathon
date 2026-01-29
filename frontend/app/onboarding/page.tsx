"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import { storage } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    industry: "",
    occupation: "",
    skills: [] as string[],
    location_importance: 3,
    industry_importance: 3,
    salary_importance: 3,
    growth_importance: 3,
    flexibility_importance: 3,
  });

  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = await userAPI.create(formData);
      storage.setUserId(user.id);
      router.push("/results");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6 px-6 shadow-lg">
        <h1 className="text-2xl font-bold">The Job You Want</h1>
        <p className="text-blue-100 text-sm mt-1">
          Find the job that kicks off your future
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {step} of 2
          </span>
          <span className="text-sm text-gray-500">
            {step === 1 ? "Your Info" : "Your Priorities"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto text-black">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Tell us about yourself
              </h2>
              <p className="text-gray-600 text-sm">
                Help us find the best jobs for you
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (including Remote or Hybrid)
              </label>
              <input
                type="text"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation/Role
              </label>
              <input
                type="text"
                placeholder="e.g., Software Engineer, Data Analyst"
                value={formData.occupation}
                onChange={(e) =>
                  setFormData({ ...formData, occupation: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                What matters most to you?
              </h2>
              <p className="text-gray-600 text-sm">
                Rate how important each factor is (1-5)
              </p>
            </div>

            {/* Importance Sliders */}
            <div className="space-y-6">
              {[
                { key: "location_importance", label: "Location", icon: "📍" },
                {
                  key: "industry_importance",
                  label: "Industry",
                  icon: "🏢",
                },
                { key: "salary_importance", label: "Salary", icon: "💰" },
                {
                  key: "growth_importance",
                  label: "Career Growth",
                  icon: "📈",
                },
                {
                  key: "flexibility_importance",
                  label: "Work Flexibility",
                  icon: "🏠",
                },
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      {label}
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      {formData[key as keyof typeof formData]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData[key as keyof typeof formData] as number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Not Important</span>
                    <span>Very Important</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 space-y-3">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!formData.location}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? "Saving..." : "Start Exploring Jobs"}
            </button>
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-full py-3 text-gray-700 font-medium hover:text-gray-900"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
