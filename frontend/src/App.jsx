import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useNavigate, Route, BrowserRouter, Routes } from 'react-router-dom';  // Add Route, BrowserRouter, and Routes

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
          <h1>Movie Feels...</h1>
          <p>A website that provides movie recommendations tailored to what you need</p>
        </header>
        
        <div className="content">
          <button className="button" onClick={() => navigate('/movierecommendation')}>
            Get Some Movie Recommendations
          </button>
          
          <button className="button" onClick={() => navigate('/moviereview')}>
            Movie Search And Review
          </button>
        </div>
        
        
        
        <footer className="footer">
          <p>&copy; 2025 Movie Feels. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
