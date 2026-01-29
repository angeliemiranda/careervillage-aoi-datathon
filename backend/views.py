from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from database import get_db
from models import User, JobListing, UserJobListing
from schemas import (
    UserCreate, UserResponse, UserPreferencesUpdate,
    JobListingResponse, SwipeCreate, SwipeResponse,
    RecommendationResponse, PaginatedJobListings
)
from utils import (
    calculate_job_match_score,
    update_user_preferences_from_swipes,
    get_recommended_jobs
)

router = APIRouter()


# User endpoints
@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user with onboarding data"""
    
    # Create user
    db_user = User(
        location=user_data.location,
        latitude=user_data.latitude,
        longitude=user_data.longitude,
        industry=user_data.industry,
        occupation=user_data.occupation,
        skills=user_data.skills,
        location_importance=user_data.location_importance,
        industry_importance=user_data.industry_importance,
        salary_importance=user_data.salary_importance,
        growth_importance=user_data.growth_importance,
        flexibility_importance=user_data.flexibility_importance,
        learned_preferences={}
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}/preferences", response_model=UserResponse)
def update_preferences(
    user_id: int,
    preferences: UserPreferencesUpdate,
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields if provided
    if preferences.location is not None:
        user.location = preferences.location
    if preferences.industry is not None:
        user.industry = preferences.industry
    if preferences.occupation is not None:
        user.occupation = preferences.occupation
    if preferences.skills is not None:
        user.skills = preferences.skills
    if preferences.location_importance is not None:
        user.location_importance = preferences.location_importance
    if preferences.industry_importance is not None:
        user.industry_importance = preferences.industry_importance
    if preferences.salary_importance is not None:
        user.salary_importance = preferences.salary_importance
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user


# Job listing endpoints
@router.get("/jobs", response_model=PaginatedJobListings)
def get_jobs(
    user_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    location: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    min_salary: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """Get job listings with optional filters"""

    query = db.query(JobListing)

    # Apply filters
    if location:
        query = query.filter(JobListing.location.ilike(f"%{location}%"))
    if industry:
        query = query.filter(JobListing.industry.ilike(f"%{industry}%"))
    if min_salary:
        query = query.filter(JobListing.salary_min >= min_salary)

    all_jobs = query.all()
    total = len(all_jobs)

    # Calculate match scores if user_id provided
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            for job in all_jobs:
                job.match_score = calculate_job_match_score(user, job)

            # Sort by match_score descending
            all_jobs.sort(key=lambda j: j.match_score, reverse=True)
    else:
        # fallback ordering if no user
        all_jobs.sort(key=lambda j: j.id)

    jobs = all_jobs[skip : skip + limit]

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "jobs": jobs
    }


@router.get("/jobs/{job_id}", response_model=JobListingResponse)
def get_job(job_id: int, user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Get job listing by ID"""
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Calculate match score if user_id provided
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            job.match_score = calculate_job_match_score(user, job)
    
    return job


# Swipe/Interaction endpoints
@router.post("/swipes", response_model=SwipeResponse, status_code=201)
def create_swipe(swipe_data: SwipeCreate, db: Session = Depends(get_db)):
    """Record a user swipe/interaction with a job listing"""
    
    # Verify user exists
    user = db.query(User).filter(User.id == swipe_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify job exists
    job = db.query(JobListing).filter(JobListing.id == swipe_data.job_listing_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")
    
    # Create swipe record
    db_swipe = UserJobListing(
        user_id=swipe_data.user_id,
        job_listing_id=swipe_data.job_listing_id,
        interaction_type=swipe_data.interaction_type,
        swipe_direction=swipe_data.swipe_direction,
        position_in_deck=swipe_data.position_in_deck,
        session_id=swipe_data.session_id,
        aspect_swiped=swipe_data.aspect_swiped,
        time_spent_viewing=swipe_data.time_spent_viewing
    )
    
    db.add(db_swipe)
    db.commit()
    db.refresh(db_swipe)
    
    # Every 3 swipes, update user preferences
    swipe_count = db.query(UserJobListing).filter(
        UserJobListing.user_id == swipe_data.user_id,
        UserJobListing.interaction_type.in_(['swipe_left', 'swipe_right'])
    ).count()
    
    if swipe_count % 3 == 0:
        update_user_preferences_from_swipes(user, db)
    
    return db_swipe


@router.get("/users/{user_id}/swipes", response_model=List[SwipeResponse])
def get_user_swipes(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user's swipe history"""
    
    swipes = db.query(UserJobListing).filter(
        UserJobListing.user_id == user_id
    ).order_by(UserJobListing.created_at.desc()).offset(skip).limit(limit).all()
    
    return swipes


# Recommendation endpoints
@router.get("/users/{user_id}/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    user_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get personalized job recommendations for user"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get jobs user hasn't interacted with yet
    already_seen_ids = db.query(UserJobListing.job_listing_id).filter(
        UserJobListing.user_id == user_id
    ).distinct().all()
    already_seen_ids = [job_id for (job_id,) in already_seen_ids]
    
    # Get recommended jobs
    recommendations = get_recommended_jobs(
        user=user,
        db=db,
        exclude_job_ids=already_seen_ids,
        limit=limit
    )
    
    return recommendations
