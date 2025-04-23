from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, relationship, declarative_base, selectinload
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, select
from dotenv import load_dotenv
from datetime import datetime
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
        latest_review = movie.reviews[0] if movie.reviews else None

        return {
            "id": movie.id,
            "title": movie.title,
            "description": movie.description,
            "review": latest_review.review if latest_review else None,
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
                "review": movie.reviews[0].review if movie.reviews else None,
                "image_url": movie.image_url,
                "created_at": movie.created_at,
                "moods": [m.mood_name for m in movie.moods]
            }
            for movie in movies
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search movies by title: {str(e)}")
