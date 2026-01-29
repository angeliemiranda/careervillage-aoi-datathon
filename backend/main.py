from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from views import router
from database import engine
from models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="CareerVillage AOI Datathon API",
    description="REST API for job exploration and matching platform",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api", tags=["api"])


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "CareerVillage AOI Datathon API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
