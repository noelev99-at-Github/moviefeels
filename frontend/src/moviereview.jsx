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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      alert('Please enter a movie title to search!');
      return;
    }
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/movies/search?title=${encodeURIComponent(searchQuery)}`);
  
      if (response.ok) {
        const data = await response.json();
      
        if (data.length === 0) {
          // No movies found
          const notFoundResult = { title: searchQuery, notFound: true };
          setMovieResult(notFoundResult);
        } else {
          // Movies found
          setMovieResult(data);
        }
      
        setShowSearchPopup(true);
        setShowAddMovie(false);
      } else {
        // Handle error status (non-2xx)
        const errorResult = { title: searchQuery, error: true };
        setMovieResult(errorResult);
        setShowSearchPopup(true);
        setShowAddMovie(false);
      }
      
    } catch (error) {
      console.error('Error fetching movie:', error);
      const errorResult = { title: searchQuery, error: true };
      setMovieResult(errorResult);
      setShowSearchPopup(true);
      setShowAddMovie(false);
    }
  };
  

  return (
    <div className="movie-review">
      <header className="header">
        <h1>
          <Link to="/" className="homepage-link">
            Movie Feels...
          </Link>
        </h1>
        <p>A website that provides movie recommendations tailored to what you need</p>
      </header>
      <div className="content">
        <h2>Movie Review</h2>
        <p className="no-results">
          {movieResult ? '' : 'If no results, movie is not yet in the database. Please click "Add New Movie for Review."'}
        </p>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search Movie Title"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar"
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {!movieResult && !showAddMovie && (
          <div className="add-movie">
            <button className="add-movie-btn" onClick={() => setShowAddMovie(true)}>
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

      <footer className="footer">
        
      </footer>
    </div>
  );
}

export default MovieReview;