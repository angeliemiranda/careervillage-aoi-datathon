from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    """User model with preferences collected during onboarding"""
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Location preferences
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Industry/Occupation preferences
    industry = Column(String(255), nullable=True)
    occupation = Column(String(255), nullable=True)
    
    # Skills (stored as JSON array)
    skills = Column(JSON, nullable=True)
    
    # Preference rankings (how much they value each factor, 1-5 scale)
    location_importance = Column(Integer, default=3)  # 1-5
    industry_importance = Column(Integer, default=3)
    salary_importance = Column(Integer, default=3)
    growth_importance = Column(Integer, default=3)
    flexibility_importance = Column(Integer, default=3)
    
    # Learned preferences from swipe behavior
    learned_preferences = Column(JSON, nullable=True)  # ML model preferences
    
    # Relationships
    swipes = relationship("UserJobListing", back_populates="user")


class JobListing(Base):
    """Job listing from National Labor Exchange mapped to AOI data"""
    __tablename__ = "job_listing"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # NLX Data
    nlx_id = Column(String(255), unique=True, index=True)
    title = Column(String(500), nullable=False)
    company = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Job details
    industry = Column(String(255), nullable=True)
    occupation = Column(String(255), nullable=True)
    occupation_code = Column(String(50), nullable=True)  # SOC code
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(10), default="USD")
    employment_type = Column(String(100), nullable=True)  # Full-time, Part-time, etc.
    
    # Required skills/qualifications
    required_skills = Column(JSON, nullable=True)
    education_required = Column(String(255), nullable=True)
    experience_required = Column(String(255), nullable=True)
    
    # AOI Data (American Opportunity Index)
    aoi_score = Column(Float, nullable=True)  # Overall AOI score
    aoi_access_score = Column(Float, nullable=True)
    aoi_wage_score = Column(Float, nullable=True)
    aoi_mobility_score = Column(Float, nullable=True)
    aoi_job_quality_score = Column(Float, nullable=True)
    
    # Additional metadata
    remote_work = Column(Boolean, default=False)
    posted_date = Column(DateTime, nullable=True)
    expires_date = Column(DateTime, nullable=True)
    url = Column(String(1000), nullable=True)
    
    # Additional data
    extra_data = Column(JSON, nullable=True)  # For any additional fields
    
    # Relationships
    user_interactions = relationship("UserJobListing", back_populates="job_listing")


class UserJobListing(Base):
    """Tracks user interactions (swipes) with job listings"""
    __tablename__ = "user_job_listing"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    job_listing_id = Column(Integer, ForeignKey("job_listing.id"), nullable=False, index=True)
    
    # Interaction data
    created_at = Column(DateTime, default=datetime.utcnow)
    interaction_type = Column(String(50), nullable=False)  # 'shown', 'swipe_left', 'swipe_right', 'viewed'
    
    # Swipe details (if applicable)
    swipe_direction = Column(String(20), nullable=True)  # 'left' (reject) or 'right' (like)
    
    # Context when shown
    position_in_deck = Column(Integer, nullable=True)  # Order shown to user
    session_id = Column(String(255), nullable=True)  # Group swipes by session
    
    # Feature-specific swipes (for granular feedback)
    # User can swipe on individual aspects of the job
    aspect_swiped = Column(String(100), nullable=True)  # 'salary', 'location', 'company', 'skills', 'overall'
    
    # Additional metadata
    time_spent_viewing = Column(Float, nullable=True)  # Seconds
    extra_data = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="swipes")
    job_listing = relationship("JobListing", back_populates="user_interactions")
