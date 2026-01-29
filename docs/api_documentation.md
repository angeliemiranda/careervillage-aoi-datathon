# API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

Currently, the API does not require authentication. User ID is passed as a parameter.

## Endpoints

### Users

#### Create User

Create a new user with onboarding preferences.

```http
POST /users
```

**Request Body:**

```json
{
  "location": "San Francisco, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "industry": "Technology",
  "occupation": "Software Engineer",
  "skills": ["Python", "JavaScript", "React"],
  "location_importance": 4,
  "industry_importance": 5,
  "salary_importance": 4,
  "growth_importance": 5,
  "flexibility_importance": 3
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "created_at": "2026-01-28T10:00:00Z",
  "updated_at": "2026-01-28T10:00:00Z",
  "location": "San Francisco, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "industry": "Technology",
  "occupation": "Software Engineer",
  "skills": ["Python", "JavaScript", "React"],
  "location_importance": 4,
  "industry_importance": 5,
  "salary_importance": 4,
  "growth_importance": 5,
  "flexibility_importance": 3,
  "learned_preferences": {}
}
```

#### Get User

Retrieve user information by ID.

```http
GET /users/{user_id}
```

**Response:** `200 OK`

#### Update User Preferences

Update user preferences after onboarding.

```http
PUT /users/{user_id}/preferences
```

**Request Body:**

```json
{
  "location_importance": 5,
  "salary_importance": 3
}
```

**Response:** `200 OK`

---

### Job Listings

#### Get All Jobs

Retrieve job listings with optional filters.

```http
GET /jobs
```

**Query Parameters:**

- `user_id` (optional): User ID to calculate match scores
- `skip` (optional, default: 0): Number of records to skip (pagination)
- `limit` (optional, default: 20, max: 100): Number of records to return
- `location` (optional): Filter by location (partial match)
- `industry` (optional): Filter by industry (partial match)
- `min_salary` (optional): Minimum salary filter

**Response:** `200 OK`

```json
{
  "total": 100,
  "skip": 0,
  "limit": 20,
  "jobs": [
    {
      "id": 1,
      "nlx_id": "NLX001",
      "title": "Software Engineer",
      "company": "TechCorp Inc.",
      "description": "Build amazing software...",
      "location": "San Francisco, CA",
      "city": "San Francisco",
      "state": "CA",
      "salary_min": 120000,
      "salary_max": 180000,
      "industry": "Technology",
      "required_skills": ["Python", "JavaScript"],
      "aoi_score": 4.2,
      "remote_work": true,
      "match_score": 87.5
    }
  ]
}
```

#### Get Job by ID

Retrieve a specific job listing.

```http
GET /jobs/{job_id}
```

**Query Parameters:**

- `user_id` (optional): User ID to calculate match score

**Response:** `200 OK`

---

### Swipes/Interactions

#### Create Swipe

Record a user's interaction with a job listing.

```http
POST /swipes
```

**Request Body:**

```json
{
  "user_id": 1,
  "job_listing_id": 5,
  "interaction_type": "swipe_right",
  "swipe_direction": "right",
  "position_in_deck": 3,
  "session_id": "session_1234567890",
  "aspect_swiped": "salary",
  "time_spent_viewing": 15.5
}
```

**Fields:**

- `user_id`: ID of the user
- `job_listing_id`: ID of the job
- `interaction_type`: Type of interaction (`shown`, `swipe_left`, `swipe_right`, `viewed`)
- `swipe_direction`: Direction swiped (`left` or `right`)
- `position_in_deck`: Order in which job was shown
- `session_id`: Session identifier for grouping swipes
- `aspect_swiped`: Which aspect was rated (`overall`, `salary`, `location`, `company`, `skills`)
- `time_spent_viewing`: Time in seconds

**Response:** `201 Created`

**Note:** Every 3 swipes, the backend automatically updates user preferences based on swipe patterns.

#### Get User Swipe History

Retrieve a user's swipe history.

```http
GET /users/{user_id}/swipes
```

**Query Parameters:**

- `skip` (optional, default: 0)
- `limit` (optional, default: 50, max: 100)

**Response:** `200 OK`

---

### Recommendations

#### Get Personalized Recommendations

Get job recommendations tailored to user preferences.

```http
GET /users/{user_id}/recommendations
```

**Query Parameters:**

- `limit` (optional, default: 10, max: 50): Number of recommendations

**Response:** `200 OK`

```json
[
  {
    "job": {
      "id": 1,
      "title": "Software Engineer",
      "company": "TechCorp Inc.",
      ...
    },
    "match_score": 87.5,
    "reasons": [
      "Matches your preferred industry: Technology",
      "High opportunity score: 4.2/5.0",
      "Matches 3 of your skills"
    ]
  }
]
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "detail": "Invalid request data"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

---

## Interactive Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
