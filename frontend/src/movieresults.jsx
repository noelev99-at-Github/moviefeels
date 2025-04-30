import React from 'react';
import './movieresults.css';

function MovieResults({ formData }) {
  if (!formData) {
    return <div className="movie-results empty">No data available. Please submit the form first.</div>;
  }

  const { message, movies } = formData;

  return (
    <div className="movie-results">
      <main className="results-content">
        <section className="intro-text">
          <h2>Movie Recommendation Result</h2>
          <p className="section-description">{message}. Here are some movies we think you'll enjoy based on your mood.</p>
        </section>

        {movies && movies.length > 0 ? (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-image-container">
                  <img
                    src={`http://localhost:8000/static/${movie.image_url.replace('/uploaded_images/', '')}`} // Remove '/uploaded_images/' from the URL
                    alt={movie.title}
                    className="movie-poster"
                  />
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="match-score">🎯 Match Score: <strong>{movie.match_score}</strong></p>

                  {/* Added placeholder for movie description */}
                  {/* Make sure your backend includes 'description' in the movie object */}
                  {movie.description && <p className="movie-description">{movie.description}</p>}

                  <div className="moods">
                    {movie.moods.map((mood, index) => (
                      <span key={index} className="mood-tag">{mood}</span>
                    ))}
                  </div>

                  <div className="reviews-section">
                    <h4>🗣️ Reviews</h4>
                    <br></br>
                    {movie.reviews && movie.reviews.length > 0 ? (
                      <ul className="review-list">
                        {movie.reviews.map((review, idx) => (
                          <li key={idx} className="review-item">"{review}"</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-reviews">No reviews available.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-results">No matching movies found for your selection.</p>
        )}
      </main>

      {/* Footer removed based on previous code, add back if needed */}
      {/* <footer className="footer">
        © 2025 Movie Feels. All rights reserved.
      </footer> */}
    </div>
  );
}

export default MovieResults;