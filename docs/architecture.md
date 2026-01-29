# Architecture Documentation

## System Overview

The Job Explorer is a full-stack application with a mobile-first design that helps users discover and match with job opportunities through an intuitive swipe-based interface.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **State Management**: React Hooks (local state)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL 14+
- **API Style**: RESTful
- **Validation**: Pydantic

### Infrastructure
- **Development**: Local development servers
- **Database**: Local PostgreSQL instance

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Mobile Frontend (Next.js)          │
│  ┌─────────────────────────────────────┐   │
│  │  Onboarding → Results → Explore      │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   │ (Port 3000 → 8000)
┌──────────────────▼──────────────────────────┐
│         Backend API (FastAPI)               │
│  ┌─────────────────────────────────────┐   │
│  │  Views → Utils → Models              │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ SQLAlchemy ORM
┌──────────────────▼──────────────────────────┐
│        PostgreSQL Database                   │
│  ┌─────────────────────────────────────┐   │
│  │  user | job_listing | user_job_listing  │
│  └─────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Onboarding Flow

```
User fills form
    ↓
Frontend validates input
    ↓
POST /api/users
    ↓
Backend creates user record
    ↓
User ID stored in localStorage
    ↓
Redirect to Results page
```

### 2. Job Results Flow

```
Page loads
    ↓
GET /api/jobs?user_id={id}
    ↓
Backend calculates match scores
    ↓
Jobs displayed in table
    ↓
User clicks job → Modal opens
```

### 3. Swipe/Exploration Flow

```
Page loads
    ↓
GET /api/users/{id}/recommendations
    ↓
Backend filters unseen jobs & scores
    ↓
Jobs shown as swipeable cards
    ↓
User swipes on aspect
    ↓
POST /api/swipes (with aspect info)
    ↓
Every 3 swipes → Preferences updated
    ↓
Next job shown
```

---

## Database Schema

### User Table

Stores user profiles and preferences.

```sql
CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Location
    location VARCHAR(255) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    
    -- Preferences
    industry VARCHAR(255),
    occupation VARCHAR(255),
    skills JSON,
    
    -- Importance ratings (1-5)
    location_importance INTEGER DEFAULT 3,
    industry_importance INTEGER DEFAULT 3,
    salary_importance INTEGER DEFAULT 3,
    growth_importance INTEGER DEFAULT 3,
    flexibility_importance INTEGER DEFAULT 3,
    
    -- ML-learned preferences
    learned_preferences JSON
);
```

### Job Listing Table

Stores job postings from NLX with AOI mappings.

```sql
CREATE TABLE job_listing (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    
    -- NLX Data
    nlx_id VARCHAR(255) UNIQUE,
    title VARCHAR(500) NOT NULL,
    company VARCHAR(500),
    description TEXT,
    location VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    
    -- Job Details
    industry VARCHAR(255),
    occupation VARCHAR(255),
    occupation_code VARCHAR(50),
    salary_min FLOAT,
    salary_max FLOAT,
    employment_type VARCHAR(100),
    required_skills JSON,
    education_required VARCHAR(255),
    experience_required VARCHAR(255),
    
    -- AOI Scores
    aoi_score FLOAT,
    aoi_access_score FLOAT,
    aoi_wage_score FLOAT,
    aoi_mobility_score FLOAT,
    aoi_job_quality_score FLOAT,
    
    -- Metadata
    remote_work BOOLEAN DEFAULT FALSE,
    posted_date TIMESTAMP,
    expires_date TIMESTAMP,
    url VARCHAR(1000)
);
```

### User-Job Listing Table

Tracks all user interactions with jobs.

```sql
CREATE TABLE user_job_listing (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user(id),
    job_listing_id INTEGER REFERENCES job_listing(id),
    
    created_at TIMESTAMP,
    interaction_type VARCHAR(50), -- shown, swipe_left, swipe_right, viewed
    swipe_direction VARCHAR(20),  -- left, right
    
    -- Context
    position_in_deck INTEGER,
    session_id VARCHAR(255),
    aspect_swiped VARCHAR(100),   -- overall, salary, location, company, skills
    time_spent_viewing FLOAT,
    
    extra_data JSON
);
```

---

## Key Features

### 1. Matching Algorithm

The matching algorithm (`calculate_job_match_score` in `utils.py`) calculates a 0-100 score based on:

- **Location Match**: Distance-based scoring using Haversine formula
- **Industry Match**: Exact or partial industry matching
- **Salary Match**: Normalized salary scoring
- **AOI Mobility Score**: Career growth potential
- **Flexibility**: Remote work availability
- **Skills Match**: Overlap between user skills and job requirements

Each factor is weighted by user-defined importance (1-5 scale).

### 2. Preference Learning

Every 3 swipes, the system updates `learned_preferences`:

- **Preferred salary range**: Average of liked jobs
- **Preferred industries**: Frequency count of liked industries
- **Remote preference**: Percentage of remote jobs liked
- **AOI score preference**: Average AOI scores of liked jobs

This data can be used to improve future recommendations.

### 3. Aspect-Specific Swiping

Users can swipe on specific aspects of a job:

- Overall impression
- Salary
- Location
- Company
- Required skills

This provides granular feedback for better personalization.

---

## API Design Principles

1. **RESTful**: Standard HTTP methods and status codes
2. **Stateless**: No server-side sessions (user ID in localStorage)
3. **Pagination**: All list endpoints support skip/limit
4. **Filtering**: Query parameters for common filters
5. **Embedded scoring**: Match scores calculated on-demand
6. **Validation**: Pydantic schemas ensure data integrity

---

## Frontend Architecture

### Page Structure

```
app/
├── layout.tsx          # Root layout (mobile container)
├── page.tsx            # Home (redirects to onboarding/results)
├── onboarding/
│   └── page.tsx        # 2-step onboarding form
├── results/
│   └── page.tsx        # Job table with modals
└── explore/
    └── page.tsx        # Swipeable job cards

components/
├── JobCard.tsx         # Swipeable card with animations
└── JobModal.tsx        # Detailed job view modal

lib/
├── api.ts              # API client and types
└── storage.ts          # localStorage utilities
```

### Mobile-First Design

- Max width: 448px (Tailwind's `max-w-md`)
- Touch-optimized interactions
- Swipe gestures using Framer Motion
- Responsive typography and spacing
- No desktop-specific features

---

## Data Sources

### National Labor Exchange (NLX)

Job listings data including:
- Job titles, descriptions
- Company information
- Location data
- Salary ranges
- Required skills

### American Opportunity Index (AOI)

Opportunity metrics including:
- Overall opportunity score
- Wage/salary score
- Career mobility score
- Access score
- Job quality score

Jobs are mapped from NLX to AOI using occupation codes (SOC codes).

---

## Deployment Considerations

### Backend
- Use environment variables for database URL
- Enable CORS for frontend domain
- Add authentication/authorization for production
- Implement rate limiting
- Add logging and monitoring

### Frontend
- Build optimized production bundle
- Configure proper environment variables
- Enable HTTPS
- Implement error boundaries
- Add analytics tracking

### Database
- Set up proper indexes (user_id, job_listing_id)
- Regular backups
- Connection pooling
- Query optimization

---

## Future Enhancements

1. **Authentication**: Add user authentication with JWT
2. **Real-time updates**: WebSocket for live job updates
3. **Advanced ML**: Use ML models for better matching
4. **Social features**: Share jobs, collaborative filtering
5. **Notifications**: Email/push notifications for new matches
6. **Saved jobs**: Bookmark functionality
7. **Application tracking**: Track application status
8. **Interview prep**: Resources for matched jobs
9. **Salary negotiation**: Tools and data for negotiations
10. **Career pathing**: Visualize career progression
