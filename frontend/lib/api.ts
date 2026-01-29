import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  location: string;
  latitude?: number;
  longitude?: number;
  industry?: string;
  occupation?: string;
  skills?: string[];
  location_importance: number;
  industry_importance: number;
  salary_importance: number;
  growth_importance: number;
  flexibility_importance: number;
  learned_preferences?: Record<string, any>;
}

export interface UserCreate {
  location: string;
  latitude?: number;
  longitude?: number;
  industry?: string;
  occupation?: string;
  skills?: string[];
  location_importance: number;
  industry_importance: number;
  salary_importance: number;
  growth_importance: number;
  flexibility_importance: number;
}

export interface JobListing {
  id: number;
  created_at: string;
  nlx_id: string;
  title: string;
  company?: string;
  description?: string;
  location?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  industry?: string;
  occupation?: string;
  occupation_code?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  employment_type?: string;
  required_skills?: string[];
  education_required?: string;
  experience_required?: string;
  aoi_score?: number;
  aoi_access_score?: number;
  aoi_wage_score?: number;
  aoi_mobility_score?: number;
  aoi_job_quality_score?: number;
  remote_work: boolean;
  posted_date?: string;
  expires_date?: string;
  url?: string;
  extra_data?: Record<string, any>;
  match_score?: number;
}

export interface SwipeCreate {
  user_id: number;
  job_listing_id: number;
  interaction_type: string;
  swipe_direction?: string;
  position_in_deck?: number;
  session_id?: string;
  aspect_swiped?: string;
  time_spent_viewing?: number;
}

export interface Recommendation {
  job: JobListing;
  match_score: number;
  reasons: string[];
}

// API Functions
export const userAPI = {
  create: async (data: UserCreate): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  get: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updatePreferences: async (userId: number, data: Partial<UserCreate>): Promise<User> => {
    const response = await api.put(`/users/${userId}/preferences`, data);
    return response.data;
  },
};

export const jobAPI = {
  getAll: async (params?: {
    user_id?: number;
    skip?: number;
    limit?: number;
    location?: string;
    industry?: string;
    min_salary?: number;
  }): Promise<{ total: number; skip: number; limit: number; jobs: JobListing[] }> => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getById: async (jobId: number, userId?: number): Promise<JobListing> => {
    const response = await api.get(`/jobs/${jobId}`, { params: { user_id: userId } });
    return response.data;
  },
};

export const swipeAPI = {
  create: async (data: SwipeCreate) => {
    const response = await api.post('/swipes', data);
    return response.data;
  },

  getHistory: async (userId: number, skip?: number, limit?: number) => {
    const response = await api.get(`/users/${userId}/swipes`, {
      params: { skip, limit },
    });
    return response.data;
  },
};

export const recommendationAPI = {
  get: async (userId: number, limit?: number): Promise<Recommendation[]> => {
    const response = await api.get(`/users/${userId}/recommendations`, {
      params: { limit },
    });
    return response.data;
  },
};
