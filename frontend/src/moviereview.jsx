import React, { useState } from 'react';
import './moviereview.css';
import AddMovie from './addmovie';
import DisplayMovieSearch from './displaymoviesearch';
import { Link } from 'react-router-dom';

function MovieReview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movieResult, setMovieResult] = useState(null);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      alert('Please enter a movie title to search!');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/movies/search?title=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok || data.length === 0) {
        setMovieResult({ title: searchQuery, notFound: true });
      } else {
        setMovieResult(data);
      }

      setShowSearchPopup(true);
      setShowAddMovie(false);
    } catch (error) {
      console.error('Error fetching movie:', error);
      setMovieResult({ title: searchQuery, error: true });
      setShowSearchPopup(true);
      setShowAddMovie(false);
    }
  };

  return (
    <div className="movie-review-page">
      <header className="review-header">
        <h1>
          <Link to="/" className="home-link">Movie Feels &gt;&gt;&gt;</Link>
        </h1>
        <p>A website that provides movie recommendations tailored to what you need</p>
      </header>

      <div className="review-content">
        <h2>Movie Review</h2>
        <p className="no-results">
          {movieResult ? '' : 'If no results, movie is not yet in the database. Please click "Add New Movie for Review."'}
        </p>

        <div className="search-box">
          <input
            type="text"
            className="movie-search-input"
            placeholder="Search Movie Title"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="movie-search-button" onClick={handleSearch}>🔍</button>
        </div>

        {!movieResult && !showAddMovie && (
          <div className="add-section">
            <button className="add-review-button" onClick={() => setShowAddMovie(true)}>
              Add New Movie For Review
            </button>
          </div>
        )}
      </div>

      {showSearchPopup && movieResult && (
        <DisplayMovieSearch
          movie={movieResult}
          onClose={() => {
            setShowSearchPopup(false);
            setMovieResult(null);
          }}
        />
      )}

      <AddMovie showModal={showAddMovie} onClose={() => setShowAddMovie(false)} />

    </div>
  );
}

export default MovieReview;
