import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useNavigate, Link, Route, BrowserRouter, Routes } from 'react-router-dom';  // Add Route, BrowserRouter, and Routes

// Your MovieRecommendation component
function MovieRecommendation() {
  return (
    <div>
      <h2>Movie Recommendations</h2>
      {/* Add the movie recommendations content here */}
    </div>
  );
}

function App() {
  const navigate = useNavigate();  // Get the navigate function

  return (
    <>
      <div className="app">
        <header className="header">
        <h1>
          <Link to="/" className="homepage-link">
            Movie Feels...
          </Link>
        </h1>
          <p>A website that provides movie recommendations tailored to what you need</p>
        </header>
        
        <div className="content">
          <button className="recobutton" onClick={() => navigate('/movierecommendation')}>
            Get Some Movie Recommendations
          </button>
          
          <button className="searchbutton" onClick={() => navigate('/moviereview')}>
            Movie Search And Review
          </button>
        </div>
        
        
        
        <footer className="footer">
          
        </footer>
      </div>
    </>
  );
}

export default App;
