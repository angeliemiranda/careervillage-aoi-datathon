"""
Database initialization script
Run this to create tables and optionally seed with sample data
"""
from database import engine
from models import Base, JobListing
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

def init_database():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def seed_sample_data():
    """Seed database with sample job listings"""
    print("Seeding sample data...")

    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    # Check if data already exists
    existing = db.query(JobListing).first()
    if existing:
        print("Sample data already exists. Skipping...")
        db.close()
        return

    # Sample job listings
    sample_jobs = [
        JobListing(
            nlx_id="NLX001",
            title="Software Engineer",
            company="TechCorp Inc.",
            description="Build and maintain web applications using modern frameworks.",
            location="San Francisco, CA",
            city="San Francisco",
            state="CA",
            zip_code="94105",
            latitude=37.7749,
            longitude=-122.4194,
            industry="Technology",
            occupation="Software Development",
            occupation_code="15-1252.00",
            salary_min=120000,
            salary_max=180000,
            employment_type="Full-time",
            required_skills=["Python", "JavaScript", "React", "SQL"],
            education_required="Bachelor's degree",
            experience_required="3+ years",
            aoi_overall_badge="Gold",
            aoi_badge_early_career="NA",
            aoi_badge_growth="NA",
            aoi_badge_stability="Platinum",
            aoi_interal_promption_rate=0.154018,
            aoi_external_promotion_rate=0.072634,
            aoi_retention_rate_3yr=0.859432,
            remote_work=True,
            posted_date=datetime.utcnow() - timedelta(days=5),
            url="https://example.com/job/1",
        ),
        JobListing(
            nlx_id="NLX002",
            title="Data Analyst",
            company="DataViz Co.",
            description="Analyze business data and create visualizations to drive decisions.",
            location="New York, NY",
            city="New York",
            state="NY",
            zip_code="10001",
            latitude=40.7128,
            longitude=-74.0060,
            industry="Finance",
            occupation="Data Analysis",
            occupation_code="15-2051.00",
            salary_min=80000,
            salary_max=110000,
            employment_type="Full-time",
            required_skills=["SQL", "Python", "Tableau", "Excel"],
            education_required="Bachelor's degree",
            experience_required="2+ years",
            aoi_overall_badge="Gold",
            aoi_badge_early_career="NA",
            aoi_badge_growth="NA",
            aoi_badge_stability="Platinum",
            aoi_interal_promption_rate=0.154018,
            aoi_external_promotion_rate=0.072634,
            aoi_retention_rate_3yr=0.859432,
            remote_work=False,
            posted_date=datetime.utcnow() - timedelta(days=3),
            url="https://example.com/job/2",
        ),
        JobListing(
            nlx_id="NLX003",
            title="UX Designer",
            company="Design Studio",
            description="Create beautiful and intuitive user experiences for mobile and web.",
            location="Austin, TX",
            city="Austin",
            state="TX",
            zip_code="78701",
            latitude=30.2672,
            longitude=-97.7431,
            industry="Technology",
            occupation="Design",
            occupation_code="27-1021.00",
            salary_min=90000,
            salary_max=130000,
            employment_type="Full-time",
            required_skills=["Figma", "Sketch", "User Research", "Prototyping"],
            education_required="Bachelor's degree",
            experience_required="3+ years",
            aoi_overall_badge="Gold",
            aoi_badge_early_career="NA",
            aoi_badge_growth="NA",
            aoi_badge_stability="Platinum",
            aoi_interal_promption_rate=0.154018,
            aoi_external_promotion_rate=0.072634,
            aoi_retention_rate_3yr=0.859432,
            remote_work=True,
            posted_date=datetime.utcnow() - timedelta(days=7),
            url="https://example.com/job/3",
        ),
        JobListing(
            nlx_id="NLX004",
            title="Marketing Manager",
            company="Brand Builders",
            description="Lead marketing campaigns and grow brand presence across channels.",
            location="Chicago, IL",
            city="Chicago",
            state="IL",
            zip_code="60601",
            latitude=41.8781,
            longitude=-87.6298,
            industry="Marketing",
            occupation="Marketing Management",
            occupation_code="11-2021.00",
            salary_min=95000,
            salary_max=140000,
            employment_type="Full-time",
            required_skills=["SEO", "Content Marketing", "Analytics", "Social Media"],
            education_required="Bachelor's degree",
            experience_required="5+ years",
            aoi_overall_badge="Gold",
            aoi_badge_early_career="NA",
            aoi_badge_growth="NA",
            aoi_badge_stability="Platinum",
            aoi_interal_promption_rate=0.154018,
            aoi_external_promotion_rate=0.072634,
            aoi_retention_rate_3yr=0.859432,
            remote_work=True,
            posted_date=datetime.utcnow() - timedelta(days=2),
            url="https://example.com/job/4",
        ),
        JobListing(
            nlx_id="NLX005",
            title="Customer Success Manager",
            company="SaaS Solutions",
            description="Help customers succeed with our platform and drive retention.",
            location="Seattle, WA",
            city="Seattle",
            state="WA",
            zip_code="98101",
            latitude=47.6062,
            longitude=-122.3321,
            industry="Technology",
            occupation="Customer Service",
            occupation_code="11-9199.00",
            salary_min=75000,
            salary_max=105000,
            employment_type="Full-time",
            required_skills=["Communication", "CRM", "Problem Solving", "SaaS"],
            education_required="Bachelor's degree",
            experience_required="2+ years",
            aoi_overall_badge="Gold",
            aoi_badge_early_career="NA",
            aoi_badge_growth="NA",
            aoi_badge_stability="Platinum",
            aoi_interal_promption_rate=0.154018,
            aoi_external_promotion_rate=0.072634,
            aoi_retention_rate_3yr=0.859432,
            remote_work=True,
            posted_date=datetime.utcnow() - timedelta(days=4),
            url="https://example.com/job/5",
        ),
    ]

    # Add to database
    for job in sample_jobs:
        db.add(job)

    db.commit()
    print(f"Added {len(sample_jobs)} sample job listings!")
    db.close()


if __name__ == "__main__":
    init_database()
    
    # Ask if user wants to seed sample data
    response = input("\nWould you like to seed sample job data? (y/n): ")
    if response.lower() == 'y':
        seed_sample_data()
    
    print("\nDatabase initialization complete!")
    print("You can now start the API server with: uvicorn main:app --reload")
