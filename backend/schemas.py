from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# User schemas
class UserCreate(BaseModel):
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    work_location: Optional[str] = None
    industry: Optional[str] = None
    occupation: Optional[str] = None
    skills: Optional[List[str]] = []
    location_importance: int = Field(default=3, ge=1, le=5)
    industry_importance: int = Field(default=3, ge=1, le=5)
    salary_importance: int = Field(default=3, ge=1, le=5)
    growth_importance: int = Field(default=3, ge=1, le=5)
    flexibility_importance: int = Field(default=3, ge=1, le=5)


class UserPreferencesUpdate(BaseModel):
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    work_location: Optional[str] = None
    industry: Optional[str] = None
    occupation: Optional[str] = None
    skills: Optional[List[str]] = None
    location_importance: Optional[int] = Field(None, ge=1, le=5)
    industry_importance: Optional[int] = Field(None, ge=1, le=5)
    salary_importance: Optional[int] = Field(None, ge=1, le=5)
    growth_importance: Optional[int] = Field(None, ge=1, le=5)
    flexibility_importance: Optional[int] = Field(None, ge=1, le=5)


class UserResponse(BaseModel):
    id: int
    created_at: datetime
    updated_at: datetime
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    work_location: Optional[str]
    industry: Optional[str]
    occupation: Optional[str]
    skills: Optional[List[str]]
    location_importance: int
    industry_importance: int
    salary_importance: int
    growth_importance: int
    flexibility_importance: int
    learned_preferences: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


# Job listing schemas
class JobListingResponse(BaseModel):
    id: int
    created_at: datetime
    nlx_id: str
    title: str
    company: Optional[str]
    description: Optional[str]
    location: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    industry: Optional[str]
    occupation: Optional[str]
    occupation_code: Optional[str]
    salary_min: Optional[float]
    salary_max: Optional[float]
    salary_currency: str
    employment_type: Optional[str]
    required_skills: Optional[List[str]]
    education_required: Optional[str]
    experience_required: Optional[str]
    aoi_overall_badge: Optional[str]
    aoi_badge_early_career: Optional[str]
    aoi_badge_growth: Optional[str]
    aoi_badge_stability: Optional[str]
    aoi_interal_promption_rate: Optional[float]
    aoi_external_promotion_rate: Optional[float]
    aoi_retention_rate_3yr: Optional[float]
    remote_work: bool
    posted_date: Optional[datetime]
    expires_date: Optional[datetime]
    url: Optional[str]
    extra_data: Optional[Dict[str, Any]]
    match_score: Optional[float] = None  # Calculated on demand

    class Config:
        from_attributes = True


class PaginatedJobListings(BaseModel):
    total: int
    skip: int
    limit: int
    jobs: List[JobListingResponse]


# Swipe/Interaction schemas
class SwipeCreate(BaseModel):
    user_id: int
    job_listing_id: int
    interaction_type: str  # 'shown', 'swipe_left', 'swipe_right', 'viewed'
    swipe_direction: Optional[str] = None  # 'left' or 'right'
    position_in_deck: Optional[int] = None
    session_id: Optional[str] = None
    aspect_swiped: Optional[str] = None  # 'salary', 'location', 'company', 'skills', 'overall'
    time_spent_viewing: Optional[float] = None


class SwipeResponse(BaseModel):
    id: int
    user_id: int
    job_listing_id: int
    created_at: datetime
    interaction_type: str
    swipe_direction: Optional[str]
    position_in_deck: Optional[int]
    session_id: Optional[str]
    aspect_swiped: Optional[str]
    time_spent_viewing: Optional[float]
    extra_data: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


# Recommendation schema
class RecommendationResponse(BaseModel):
    job: JobListingResponse
    match_score: float
    reasons: List[str]  # Reasons for recommendation

    class Config:
        from_attributes = True
