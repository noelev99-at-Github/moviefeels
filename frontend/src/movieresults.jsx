import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './movieresults.css';

function MovieResults({ formData }) {
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setShowResults(false);
    if (formData) {
      const timer = setTimeout(() => setShowResults(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [formData]);

  if (!formData || !showResults) return null;

  const { message, movies } = formData;
  const allAreOnes = movies.every(movie => movie.match_score === 1);
  const filteredMovies = allAreOnes ? movies : movies.filter(movie => movie.match_score !== 1);

  return (
    <div className="standalone-movie-results">
      {/* Home Button */}
      <div className="standalone-home-bar">
        <button className="standalone-home-btn" onClick={() => navigate('/')}>
          ← Home
        </button>
      </div>

      <div className="standalone-results-container">
        {/* Intro Section */}
        <div className="standalone-intro">
          <h2>Movie Recommendation Result</h2>
          <p>{message}. Here are some movies we think you'll enjoy based on your mood.</p>
        </div>

        {/* Movie Cards Grid */}
        {filteredMovies.length > 0 ? (
          <div className="standalone-grid">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="standalone-card">
                <div className="standalone-poster-wrap">
                  <img
                    src={`http://localhost:8000/static/${movie.image_url.replace('/uploaded_images/', '')}`}
                    alt={movie.title}
                  />
                </div>

                <div className="standalone-details">
                  <h3>{movie.title}</h3>
                  <p className="standalone-score">
                    🎯 Match Score: <strong>{movie.match_score}</strong>
                  </p>

                  {movie.description && <p className="standalone-desc">{movie.description}</p>}

                  <div className="standalone-moods">
                    {movie.moods.map((mood, idx) => (
                      <span key={idx} className="standalone-mood">{mood}</span>
                    ))}
                  </div>

                  <div className="standalone-reviews">
                    <h4>🗣️ Reviews</h4>
                    {movie.reviews && movie.reviews.length > 0 ? (
                      <ul>
                        {movie.reviews.map((review, idx) => (
                          <li key={idx}>"{review}"</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="standalone-no-reviews">No reviews available.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="standalone-no-results">No matching movies found for your selection.</p>
        )}
      </div>
    </div>
  );
}

export default MovieResults;