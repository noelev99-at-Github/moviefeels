import React from 'react';
import './displaymoviesearch.css';

function DisplayMovieSearch({ movie, onClose }) {
  const imageUrl = movie.image_url ? `http://localhost:8000${movie.image_url}` : '/path/to/default/image.jpg'; // Provide a fallback image if no image is available

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>{movie.title}</h2>

        {movie.notFound && (
          <p>Movie not found in our database.</p>
        )}

        {movie.error && (
          <p>An error occurred while searching for this movie. Please try again later.</p>
        )}

        {!movie.notFound && !movie.error && (
          <>
            {movie.image_url && (
              <div className="image-container">
                <img src={imageUrl} alt={movie.title} className="movie-image" />
              </div>
            )}
            <p><strong>Description:</strong> {movie.description}</p>
            <p><strong>Review:</strong> {movie.review}</p>
            <p><em>Posted on:</em> {movie.created_at ? new Date(movie.created_at).toLocaleDateString() : 'N/A'}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default DisplayMovieSearch;
