import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  // Import BrowserRouter, Routes, and Route
import App from './App';
import MovieRecommendation from './movierecommendation';  // Import your page component
import MovieReview from './moviereview';
import AddMovie from './addmovie';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />  {/* Main page */}
      <Route path="/movierecommendation" element={<MovieRecommendation />} />  {/* Movie recommendations page */}
      <Route path="/moviereview" element={<MovieReview />} />
      <Route path="/addmovie" element={<AddMovie />} />
    </Routes>
  </BrowserRouter>
);
