# Quick Setup Guide

Follow these steps to get the application running locally.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

## Backend Setup

### 1. Create and activate virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up PostgreSQL database

```bash
# Create database
createdb careervillage_db

# Or using psql
psql -U postgres
CREATE DATABASE careervillage_db;
\q
```

### 4. Configure environment variables

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

### 5. Initialize database

```bash
cd backend
python init_db.py
# Type 'y' when asked to seed sample data
```

### 6. Start the backend server

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
# Default should work if backend is on localhost:8000
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Testing the Application

### 1. Access the app

Open http://localhost:3000 in your browser (preferably in mobile view or with responsive design mode)

### 2. Onboarding flow

- Fill in location (e.g., "San Francisco, CA")
- Select industry (e.g., "Technology")
- Add occupation (e.g., "Software Engineer")
- Add skills (e.g., "Python", "JavaScript", "React")
- Rate importance of each factor (1-5)
- Click "Start Exploring Jobs"

### 3. Browse results

- View all jobs in table format
- Click on any job to see details in modal
- See match scores if available

### 4. Explore with swipes

- Click "Explore" tab
- Tap aspects to rate (Overall, Salary, Location, Company, Skills)
- Swipe right to like, left to pass
- Or use the button controls
- Every 3 swipes, your preferences are updated

## Troubleshooting

### Backend won't start

**Error: "connection refused" or database error**

- Make sure PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep careervillage`
- Verify .env DATABASE_URL is correct

**Error: "Module not found"**

- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend won't start

**Error: "Cannot find module"**

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Error: "Network error" when making API calls**

- Verify backend is running on port 8000
- Check .env.local has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors

### No jobs showing

- Make sure you ran `python init_db.py` and selected 'y' for sample data
- Check backend logs for errors
- Verify database has records: `psql careervillage_db -c "SELECT COUNT(*) FROM job_listing;"`

## Adding Real Data

### 1. Place data files in data/raw/

```
data/raw/
├── nlx_jobs.csv
└── aoi_scores.csv
```

### 2. Create data import script

```python
# backend/import_data.py
import pandas as pd
from database import SessionLocal
from models import JobListing

def import_nlx_data():
    db = SessionLocal()
    
    # Load CSV
    df = pd.read_csv('../data/raw/nlx_jobs.csv')
    
    # Process and insert jobs
    for _, row in df.iterrows():
        job = JobListing(
            nlx_id=row['id'],
            title=row['title'],
            company=row['company'],
            # ... map other fields
        )
        db.add(job)
    
    db.commit()
    db.close()

if __name__ == '__main__':
    import_nlx_data()
```

### 3. Run import

```bash
cd backend
python import_data.py
```

## Development Tips

### Backend Development

- Use FastAPI's automatic docs: http://localhost:8000/docs
- Check SQL queries: Set `echo=True` in `database.py`
- Add print statements or use debugger

### Frontend Development

- Use browser DevTools (F12)
- Enable mobile view: Toggle device toolbar
- Check Network tab for API calls
- Use React DevTools extension

### Database Management

```bash
# Access database
psql careervillage_db

# Useful queries
SELECT COUNT(*) FROM job_listing;
SELECT * FROM "user" LIMIT 5;
SELECT * FROM user_job_listing ORDER BY created_at DESC LIMIT 10;

# Reset database (WARNING: deletes all data)
DROP DATABASE careervillage_db;
CREATE DATABASE careervillage_db;
```

## Next Steps

1. **Add real job data**: Import NLX and AOI datasets
2. **Customize matching**: Adjust scoring in `backend/utils.py`
3. **Improve UI**: Customize styles in frontend components
4. **Add features**: Implement saved jobs, application tracking, etc.
5. **Deploy**: Set up production environment

## Need Help?

- Check documentation in `docs/`
- Review API docs at http://localhost:8000/docs
- Check backend logs for errors
- Use browser console for frontend debugging
