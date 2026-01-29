# CareerVillage AOI Datathon - Project Summary

## 🎯 Project Overview

A mobile-first job exploration platform that helps users discover career opportunities through an intuitive Tinder-like swipe interface, leveraging National Labor Exchange (NLX) data and American Opportunity Index (AOI) metrics.

## ✨ Key Features

### 1. **Onboarding (2-Step Process)**
- Collect user information (location, industry, occupation, skills)
- Rate importance of factors (location, industry, salary, growth, flexibility) on 1-5 scale
- Data saved to backend immediately upon submission

### 2. **Results View (Table/List)**
- Browse all job listings in a clean, mobile-optimized table
- See match scores for each job
- Click any job to open detailed modal view
- Filter and sort capabilities

### 3. **Explore View (Swipe Interface)**
- Tinder-like card interface for job discovery
- Swipe right to like, left to pass
- **Unique Feature**: Rate individual aspects of each job
  - Overall impression
  - Salary
  - Location
  - Company
  - Required skills
- Every 3 swipes, backend updates user preferences automatically
- Progress tracking and recommendations

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
```
frontend/
├── app/
│   ├── page.tsx           # Home (auto-redirect)
│   ├── onboarding/        # 2-step preference collection
│   ├── results/           # Job table view
│   └── explore/           # Swipe interface
├── components/
│   ├── JobCard.tsx        # Swipeable card component
│   └── JobModal.tsx       # Detailed job view
└── lib/
    ├── api.ts             # API client
    └── storage.ts         # localStorage utilities
```

### Backend (FastAPI + SQLAlchemy)
```
backend/
├── main.py               # FastAPI app
├── models.py             # Database models
├── schemas.py            # Pydantic schemas
├── views.py              # API endpoints
├── utils.py              # Matching algorithm
├── database.py           # DB connection
└── init_db.py            # Setup script
```

### Database (PostgreSQL)
- **user**: User profiles and preferences
- **job_listing**: NLX jobs + AOI data
- **user_job_listing**: Swipe interactions

## 🔑 Key Technical Highlights

### Intelligent Matching Algorithm
- Distance-based location scoring (Haversine formula)
- Industry and skill matching
- Salary normalization
- AOI score integration
- Weighted by user-defined importance ratings
- Returns 0-100 match score

### Adaptive Preference Learning
- Tracks user swipe patterns
- Analyzes liked vs rejected jobs
- Updates learned preferences every 3 swipes
- Learns:
  - Preferred salary ranges
  - Industry preferences
  - Remote work preference
  - Preferred AOI scores

### Granular Feedback System
- Users can swipe on specific job aspects
- Provides more nuanced preference data
- Enables better personalization over time

## 📊 Data Schema

### User Table
- Location (string + coordinates)
- Industry & occupation preferences
- Skills array (JSON)
- Importance ratings (1-5 for 5 factors)
- Learned preferences (JSON)

### Job Listing Table
- NLX data (title, company, description, location)
- Salary information
- Industry & occupation codes
- Required skills (JSON)
- **AOI Scores**:
  - Overall score
  - Wage score
  - Mobility score
  - Access score
  - Job quality score
- Remote work flag

### User-Job Listing Table (Interactions)
- Swipe direction (left/right)
- Aspect swiped (overall, salary, location, etc.)
- Position in deck
- Session ID
- Time spent viewing

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create user with onboarding data |
| GET | `/api/users/{id}` | Get user profile |
| PUT | `/api/users/{id}/preferences` | Update preferences |
| GET | `/api/jobs` | List all jobs (with filters) |
| GET | `/api/jobs/{id}` | Get single job |
| POST | `/api/swipes` | Record swipe action |
| GET | `/api/users/{id}/swipes` | Get swipe history |
| GET | `/api/users/{id}/recommendations` | Get personalized recommendations |

## 🎨 UI/UX Design

### Mobile-First Approach
- Optimized for 375px-450px width
- Touch-optimized interactions
- Swipe gestures with Framer Motion
- Smooth animations and transitions
- No horizontal scrolling

### Design System
- **Colors**: Blue & purple gradients (professional yet modern)
- **Typography**: Clean, readable fonts
- **Components**: Cards, modals, buttons all mobile-optimized
- **Feedback**: Visual indicators for swipes, loading states

## 📈 Matching Score Algorithm

```
Score = Weighted Average of:
  - Location Match (0-100, based on distance)
  - Industry Match (0 or 100, exact match)
  - Salary Score (normalized 30k-150k range)
  - AOI Mobility Score (growth potential)
  - Flexibility Score (remote work)
  - Skills Match (% overlap)

Each weighted by user importance (1-5)
```

## 🔄 User Journey

1. **First Visit**
   - Land on home → Auto-redirect to onboarding
   - Fill 2-step form
   - User created in database
   - Redirect to results

2. **Browsing Jobs**
   - View all jobs in table
   - Click for detailed modal
   - See match scores
   - Navigate to explore

3. **Swiping**
   - Select aspect to rate
   - Swipe on job cards
   - Every 3 swipes = preference update
   - Get better recommendations

4. **Return Visits**
   - User ID in localStorage
   - Direct to results page
   - Preferences persist

## 📦 What's Included

✅ Complete backend API with FastAPI  
✅ Mobile-first Next.js frontend  
✅ PostgreSQL database schema  
✅ Matching algorithm with AOI integration  
✅ Preference learning system  
✅ Swipe interaction tracking  
✅ Sample data seeding  
✅ API documentation  
✅ Architecture documentation  
✅ Setup guide  

## 🔜 Future Enhancements

- [ ] User authentication (JWT)
- [ ] Saved jobs/bookmarks
- [ ] Application tracking
- [ ] Advanced ML-based matching
- [ ] Real-time notifications
- [ ] Social features (share jobs)
- [ ] Interview preparation resources
- [ ] Salary negotiation tools
- [ ] Career path visualization
- [ ] Analytics dashboard

## 📝 Documentation

- **README.md**: Project overview and tech stack
- **SETUP.md**: Step-by-step setup instructions
- **docs/api_documentation.md**: Complete API reference
- **docs/architecture.md**: System architecture details
- **PROJECT_SUMMARY.md**: This file

## 🛠️ Technologies

**Frontend**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios

**Backend**
- FastAPI
- SQLAlchemy
- Pydantic
- Psycopg2
- Python 3.10+

**Database**
- PostgreSQL 14+

**Development**
- ESLint
- Uvicorn
- npm/pip

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development skills
- Mobile-first UI/UX design
- RESTful API design
- Database modeling and optimization
- Algorithm design (matching, scoring)
- Machine learning concepts (preference learning)
- Modern web development practices
- Data integration (NLX + AOI)

## 📞 Getting Started

1. Read [SETUP.md](./SETUP.md) for installation instructions
2. Review [docs/architecture.md](./docs/architecture.md) for system design
3. Check [docs/api_documentation.md](./docs/api_documentation.md) for API details
4. Run the app and explore!

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

**Built for CareerVillage AOI Datathon 2026**
