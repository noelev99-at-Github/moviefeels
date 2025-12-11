from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, relationship, declarative_base, selectinload
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, select
from dotenv import load_dotenv
from datetime import datetime
from pydantic import BaseModel
from typing import List
import os
import shutil
import uuid

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Set up SQLAlchemy with async engine
Base = declarative_base()
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Initialize FastAPI app
app = FastAPI(title="Movie Review API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up static file serving
UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploaded_images", StaticFiles(directory=UPLOAD_DIR), name="uploaded_images")

# Database Models
class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(Text)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    moods = relationship("Mood", secondary="movie_moods", back_populates="movies")
    reviews = relationship("Review", back_populates="movie", cascade="all, delete")

class Mood(Base):
    __tablename__ = "moods"

    id = Column(Integer, primary_key=True)
    mood_name = Column(String(255), unique=True, nullable=False)

    movies = relationship("Movie", secondary="movie_moods", back_populates="moods")

class MovieMood(Base):
    __tablename__ = "movie_moods"

    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True)
    mood_id = Column(Integer, ForeignKey("moods.id", ondelete="CASCADE"), primary_key=True)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"))
    review = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    movie = relationship("Movie", back_populates="reviews")

# Pydantic models for request validation
class ReviewCreate(BaseModel):
    review: str

class MovieRecommendationRequest(BaseModel):
    moods: list[str]
    preference: str
    personalNotes: str
    timestamp: str

# Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Initialize predefined moods
async def initialize_moods(db: AsyncSession):
    predefined_moods = [
        'Sad', 'Happy', 'Bored', 'Grief', 'Magical', 'Excited', 'Loneliness',
        'Romance', 'Adventurous', 'Brokenhearted', 'Optimistic', 'Thrilled',
        'Stressed', 'Relaxed & Carefree', 'Scared', 'Angry',
        'Community Joy', 'Hopeless', 'Nostalgia'
    ]

    for mood_name in predefined_moods:
        result = await db.execute(select(Mood).where(Mood.mood_name == mood_name))
        mood = result.scalar_one_or_none()
        if not mood:
            db.add(Mood(mood_name=mood_name))
    await db.commit()

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await initialize_moods(session)
    print("✅ Database initialized!")

@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Movie Review API is running"}

@app.get("/api/moods")
async def get_moods(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Mood).order_by(Mood.mood_name))
        moods = result.scalars().all()
        return [{"id": mood.id, "name": mood.mood_name} for mood in moods]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch moods: {str(e)}")

@app.post("/api/movies")
async def create_movie(
    title: str = Form(...),
    description: str = Form(...),
    review: str = Form(...),
    moods: str = Form(...),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        new_movie = Movie(
            title=title,
            description=description,
            image_url=f"/uploaded_images/{unique_filename}"
        )

        # Process moods
        mood_list = [m.strip() for m in moods.split(",") if m.strip()]
        movie_moods = []

        for mood_name in mood_list:
            result = await db.execute(select(Mood).where(Mood.mood_name == mood_name))
            mood = result.scalar_one_or_none()
            if not mood:
                mood = Mood(mood_name=mood_name)
                db.add(mood)
                await db.flush()
            movie_moods.append(mood)

        new_movie.moods = movie_moods
        db.add(new_movie)
        await db.flush()

        # Add review separately
        new_review = Review(movie_id=new_movie.id, review=review)
        db.add(new_review)

        await db.commit()

        # Reload movie with relationships (async-safe)
        result = await db.execute(
            select(Movie)
            .where(Movie.id == new_movie.id)
            .options(selectinload(Movie.moods), selectinload(Movie.reviews))
        )
        movie = result.scalar_one()

        # Return movie with all reviews
        return {
            "id": movie.id,
            "title": movie.title,
            "description": movie.description,
            "reviews": [{"review": review.review, "created_at": review.created_at} for review in movie.reviews],
            "image_url": movie.image_url,
            "created_at": movie.created_at,
            "moods": [m.mood_name for m in movie.moods]
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create movie review: {str(e)}")

@app.get("/api/movies/search")
async def search_movies_by_title(title: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(Movie)
            .where(Movie.title.ilike(f"%{title}%"))
            .options(selectinload(Movie.moods), selectinload(Movie.reviews))
            .order_by(Movie.created_at.desc())
        )
        movies = result.scalars().all()

        return [
            {
                "id": movie.id,
                "title": movie.title,
                "description": movie.description,
                "reviews": [{"review": review.review, "created_at": review.created_at} for review in movie.reviews],
                "image_url": movie.image_url,
                "created_at": movie.created_at,
                "moods": [m.mood_name for m in movie.moods]
            }
            for movie in movies
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search movies by title: {str(e)}")

# New endpoint for posting a review to a movie
@app.post("/api/movies/{movie_id}/reviews")
async def post_review(
    movie_id: int, 
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Check if movie exists
        result = await db.execute(select(Movie).where(Movie.id == movie_id))
        movie = result.scalar_one_or_none()
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        # Create new review
        new_review = Review(
            movie_id=movie_id,
            review=review_data.review
        )
        
        db.add(new_review)
        await db.commit()
        await db.refresh(new_review)
        
        # Return the created review
        return {
            "id": new_review.id,
            "movie_id": new_review.movie_id,
            "review": new_review.review,
            "created_at": new_review.created_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to post review: {str(e)}")
    
    
# Define the route to receive the POST request for movie recommendations
@app.post("/movierecommendationuserinput")
async def receive_user_input(request: MovieRecommendationRequest, db: AsyncSession = Depends(get_db)):
    print(f"Received data: {request}")

    # Define opposite relationships as a list of pairs
    # Add all specific opposite pairs here
    opposite_pairs = [
        ("Sad", "Happy"),
        ("Sad", "Excited"),
        ("Happy", "Sad"),
        ("Happy", "Calm / Peaceful"),
        ("Bored", "Excited"),
        ("Bored", "Adventurous"),
        ("Grief", "Optimistic"),
        ("Grief", "Community Joy"),
        ("Loneliness", "Community Joy"),
        ("Loneliness", "Happy"),
        ("Brokenhearted", "Thrilled"),
        ("Brokenhearted", "Happy"),
        ("Stressed", "Relaxed & Carefree"),
        ("Stressed", "Calm / Peaceful"),
        ("Scared", "Adventurous"),
        ("Scared", "Calm / Peaceful"),
        ("Angry", "Calm / Peaceful"),
        ("Angry", "Relaxed & Carefree"),
        ("Magical", "Bored"),
        ("Magical", "Realistic"),
        ("Romance", "Adventurous"),
        ("Hopeless", "Optimistic"),
        ("Hopeless", "Adventurous"),
        ("Nostalgia", "Adventurous"),
    ]

    try:
        # Ensure the Movie model includes a 'description' column/attribute
        result = await db.execute(
            select(Movie)
            .options(selectinload(Movie.moods))
            .options(selectinload(Movie.reviews))
            # No need to explicitly load description if it's a direct column on Movie
        )
        movies = result.scalars().all()

        def get_mood_match_score(movie_moods, user_moods):
            return len(set(movie_moods) & set(user_moods))

        matched_movies = []

        # Determine moods based on preference
        if request.preference == 'congruence':
            user_moods = request.moods
            print("Congruence selected")
        elif request.preference == 'incongruence':
            user_moods = []
            print("Incongruence selected")
            # Find opposite moods based on defined pairs
            for user_selected_mood in request.moods:
                for mood1, mood2 in opposite_pairs:
                    if user_selected_mood == mood1:
                        user_moods.append(mood2)
                    elif user_selected_mood == mood2:
                         user_moods.append(mood1)

            # Remove duplicates
            user_moods = list(set(user_moods))

        else:
            raise HTTPException(status_code=400, detail="Invalid preference selected")

        for movie in movies:
            movie_moods = [m.mood_name for m in movie.moods]
            score = get_mood_match_score(movie_moods, user_moods)
            if score > 0:
                matched_movies.append({
                    "id": movie.id,
                    "title": movie.title,
                    "image_url": movie.image_url,
                    "description": movie.description, 
                    "moods": movie_moods,
                    "reviews": [review.review for review in movie.reviews],
                    "match_score": score
                })

        matched_movies.sort(key=lambda x: x["match_score"], reverse=True)

        return {
            "message": f"{request.preference.capitalize()} movies found",
            "movies": matched_movies
        }

    except Exception as e:
        # Log the error details for debugging
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

        raise HTTPException(status_code=500, detail=f"Failed to fetch movie recommendations: {str(e)}")
    

# Serve static files from the 'uploaded_images' folder
app.mount("/static", StaticFiles(directory="uploaded_images"), name="static")

@app.get("/static/uploaded_images/{image_filename}")
async def get_image(image_filename: str):
    # Define the relative path to the uploaded images folder
    UPLOADS_DIR = os.path.join(os.getcwd(), 'uploaded_images')  # relative path
    
    # Construct the full file path
    file_path = os.path.join(UPLOADS_DIR, image_filename)
    
    # Check if the file exists before returning it
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        return {"error": "Image not found"}
    
# To run the app, use `uvicorn main:app --reload`


