# CareerVillage AOI Datathon - Job Explorer

A mobile-first job exploration platform that helps users discover and match with job opportunities using swipe-based interactions and preference learning.

## Features

- **Onboarding**: Collect user preferences (location, industry, occupation, skills)
- **Results Table**: Browse all job listings with detailed modal views
- **Swipe Exploration**: Tinder-like interface for job discovery with preference refinement

## Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Data Sources**: National Labor Exchange (NLX) + American Opportunity Index

## Project Structure

```
./
├── README.md
├── requirements.txt
├── frontend/              # Next.js mobile app
├── backend/               # FastAPI backend
├── data/                  # Data files
│   ├── raw/              # Raw NLX and AOI data
│   └── processed/        # Processed/cleaned data
├── docs/                  # Documentation
├── presentation/          # Demo materials
└── LICENSE
```

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
createdb careervillage_db

# Run migrations
cd backend
python init_db.py

# Start server
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 for the app and http://localhost:8000/docs for the API documentation.

## Database Schema

- **user**: User profiles with preferences
- **job_listing**: Job postings from NLX mapped to AOI data
- **user_job_listing**: User interactions (swipes) with jobs

## API Endpoints

- `POST /api/users` - Create user with onboarding data
- `GET /api/jobs` - Get job listings based on preferences
- `POST /api/swipes` - Record user swipe action
- `GET /api/recommendations` - Get personalized job recommendations

## License

MIT License
