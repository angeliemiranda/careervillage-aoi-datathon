from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Dict, Any
import math
from models import User, JobListing, UserJobListing


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in miles using Haversine formula"""
    if None in [lat1, lon1, lat2, lon2]:
        return float('inf')
    
    # Radius of Earth in miles
    R = 3959.0
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_lat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance


def calculate_job_match_score(user: User, job: JobListing) -> float:
    """
    Calculate match score between user preferences and job listing.
    Returns a score from 0-100.
    """
    score = 0.0
    total_weight = 0.0
    
    # Location match (if coordinates available)
    if user.latitude and user.longitude and job.latitude and job.longitude:
        distance = calculate_distance(user.latitude, user.longitude, job.latitude, job.longitude)
        # Score decreases with distance (50 miles = 50% score, 200+ miles = 0%)
        location_score = max(0, 100 - (distance / 2))
        score += location_score * user.location_importance
        total_weight += user.location_importance
    
    # Industry match
    if user.industry and job.industry:
        if user.industry.lower() in job.industry.lower():
            score += 100 * user.industry_importance
        else:
            score += 0 * user.industry_importance
        total_weight += user.industry_importance
    
    # Salary match (assume user wants higher salary)
    if job.salary_min:
        # Normalize salary score (assuming 30k-150k range)
        salary_score = min(100, ((job.salary_min - 30000) / 120000) * 100)
        score += max(0, salary_score) * user.salary_importance
        total_weight += user.salary_importance
    
    # AOI growth/mobility score
    if job.aoi_mobility_score is not None:
        growth_score = job.aoi_mobility_score * 20  # Assuming AOI scores are 0-5
        score += growth_score * user.growth_importance
        total_weight += user.growth_importance
    
    # Flexibility (remote work)
    if job.remote_work:
        score += 100 * user.flexibility_importance
    else:
        score += 30 * user.flexibility_importance  # Some score even if not remote
    total_weight += user.flexibility_importance
    
    # Skills match
    if user.skills and job.required_skills:
        user_skills_set = set([s.lower() for s in user.skills])
        job_skills_set = set([s.lower() for s in job.required_skills])
        if job_skills_set:
            skills_overlap = len(user_skills_set & job_skills_set) / len(job_skills_set)
            score += skills_overlap * 100 * 2  # Skills are important, weight of 2
            total_weight += 2
    
    # Calculate final weighted score
    if total_weight > 0:
        final_score = score / total_weight
    else:
        final_score = 50.0  # Default middle score
    
    return round(final_score, 2)


def update_user_preferences_from_swipes(user: User, db: Session):
    """
    Analyze user's swipe history and update learned preferences.
    Called every 3 swipes.
    """
    # Get recent swipes (last 30 swipes)
    recent_swipes = db.query(UserJobListing).filter(
        UserJobListing.user_id == user.id,
        UserJobListing.interaction_type.in_(['swipe_left', 'swipe_right'])
    ).order_by(UserJobListing.created_at.desc()).limit(30).all()
    
    if not recent_swipes:
        return
    
    # Separate liked and rejected jobs
    liked_job_ids = [s.job_listing_id for s in recent_swipes if s.swipe_direction == 'right']
    rejected_job_ids = [s.job_listing_id for s in recent_swipes if s.swipe_direction == 'left']
    
    # Get the actual job listings
    liked_jobs = db.query(JobListing).filter(JobListing.id.in_(liked_job_ids)).all() if liked_job_ids else []
    rejected_jobs = db.query(JobListing).filter(JobListing.id.in_(rejected_job_ids)).all() if rejected_job_ids else []
    
    # Analyze patterns
    learned_prefs = user.learned_preferences or {}
    
    # Average salary of liked jobs
    if liked_jobs:
        salaries = [j.salary_min for j in liked_jobs if j.salary_min]
        if salaries:
            learned_prefs['preferred_min_salary'] = sum(salaries) / len(salaries)
        
        # Preferred industries
        industries = [j.industry for j in liked_jobs if j.industry]
        if industries:
            industry_counts = {}
            for ind in industries:
                industry_counts[ind] = industry_counts.get(ind, 0) + 1
            learned_prefs['preferred_industries'] = industry_counts
        
        # Remote work preference
        remote_count = sum(1 for j in liked_jobs if j.remote_work)
        learned_prefs['remote_preference'] = remote_count / len(liked_jobs)
        
        # Average AOI scores of liked jobs
        aoi_scores = [j.aoi_score for j in liked_jobs if j.aoi_score]
        if aoi_scores:
            learned_prefs['preferred_aoi_score'] = sum(aoi_scores) / len(aoi_scores)
    
    # Update user's learned preferences
    user.learned_preferences = learned_prefs
    user.updated_at = db.query(func.now()).scalar()
    db.commit()


def get_recommended_jobs(
    user: User,
    db: Session,
    exclude_job_ids: List[int],
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Get personalized job recommendations for a user.
    Returns list of jobs with match scores and reasons.
    """
    # Build query for jobs not yet seen
    query = db.query(JobListing)
    
    if exclude_job_ids:
        query = query.filter(~JobListing.id.in_(exclude_job_ids))
    
    # Apply some basic filters based on user preferences
    filters = []
    
    # Location filter (if user has coordinates)
    if user.latitude and user.longitude:
        # This is a simplified filter; in production, use spatial queries
        filters.append(JobListing.latitude.isnot(None))
    
    # Industry filter
    if user.industry:
        filters.append(JobListing.industry.ilike(f"%{user.industry}%"))
    
    # Get potential jobs
    if filters:
        query = query.filter(or_(*filters))
    
    jobs = query.limit(limit * 3).all()  # Get more than needed for scoring
    
    # Calculate match scores for all jobs
    scored_jobs = []
    for job in jobs:
        match_score = calculate_job_match_score(user, job)
        
        # Generate reasons for recommendation
        reasons = []
        
        if user.industry and job.industry and user.industry.lower() in job.industry.lower():
            reasons.append(f"Matches your preferred industry: {job.industry}")
        
        if job.aoi_score and job.aoi_score >= 4.0:
            reasons.append(f"High opportunity score: {job.aoi_score:.1f}/5.0")
        
        if job.remote_work:
            reasons.append("Offers remote work flexibility")
        
        if user.skills and job.required_skills:
            user_skills_set = set([s.lower() for s in user.skills])
            job_skills_set = set([s.lower() for s in job.required_skills])
            matching_skills = user_skills_set & job_skills_set
            if matching_skills:
                reasons.append(f"Matches {len(matching_skills)} of your skills")
        
        if user.latitude and user.longitude and job.latitude and job.longitude:
            distance = calculate_distance(user.latitude, user.longitude, job.latitude, job.longitude)
            if distance < 25:
                reasons.append(f"Close to your location ({distance:.1f} miles)")
        
        if not reasons:
            reasons.append("Matches your overall preferences")
        
        scored_jobs.append({
            "job": job,
            "match_score": match_score,
            "reasons": reasons[:3]  # Limit to top 3 reasons
        })
    
    # Sort by match score and return top N
    scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)
    
    return scored_jobs[:limit]
