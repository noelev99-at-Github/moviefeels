import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './movierecommendation.css';
import MovieResults from './movieresults.jsx';

function MovieRecommendationPage() {
  const navigate = useNavigate();

  const [selectedMoods, setSelectedMoods] = useState([]);
  const [preference, setPreference] = useState(null);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [explode, setExplode] = useState(false);

  const moods = [
    'Happy', 'Sad', 'Excited', 'Thrilled', 'Bored', 'Stressed', 'Relaxed',
    'Angry', 'Frustrated', 'Lonely', 'Grief', 'Heartbroken', 'Hopeless',
    'Nostalgic', 'Romantic', 'Adventurous', 'Magical', 'Scared', 'Confident',
    'Calm', 'Curious', 'Joyful', 'Reflective'
  ];

  const handleMoodSelection = (mood) => {
    setSelectedMoods(prev => {
      if (prev.includes(mood)) return prev.filter(m => m !== mood);
      if (prev.length >= 5) return prev;
      return [...prev, mood];
    });
  };

  const handleSubmit = () => {
    if (selectedMoods.length === 0 || preference === null) return; // prevent empty form
    setExplode(true);

    // wait for animation to expand (~2s), then submit
    setTimeout(async () => {
      setIsSubmitting(true);
      const data = {
        moods: selectedMoods,
        preference,
        personalNotes,
        timestamp: new Date().toISOString(),
      };
      try {
        const response = await fetch('http://localhost:8000/movierecommendationuserinput', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const result = await response.json();
        setFormData(result);
        setSubmitted(true);
      } catch (err) {
        console.error(err);
        alert('Something went wrong!');
      }
      setIsSubmitting(false);
      setExplode(false); // reset explode in case user wants another submit
    }, 2000); 
  };

  return (
    <div className="movie-recommendation-page">
      {!submitted ? (
        <div className="form-container">
          {/* BACK TO HOME BUTTON */}
          <button
            className="btn-secondary back-button"
            onClick={() => navigate('/')}
          >
            ← Home
          </button>

          {/* MOOD SELECTION */}
          <div className="mood-section">
            <h2>
              What are you feeling?
              <span className="selection-count"><br />(Select up to 5: {selectedMoods.length}/5)</span>
            </h2>
            <div className="mood-grid">
              {moods.map((mood) => (
                <button
                  key={mood}
                  className={`mood-button ${selectedMoods.includes(mood) ? 'selected' : ''} ${selectedMoods.length >= 5 && !selectedMoods.includes(mood) ? 'disabled' : ''}`}
                  onClick={() => handleMoodSelection(mood)}
                  disabled={selectedMoods.length >= 5 && !selectedMoods.includes(mood)}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* PREFERENCE SECTION */}
          <div className="preference-section">
            <h2>Do you want</h2>
            <div className="preference-cards">
              <div
                className={`preference-card ${preference === 'congruence' ? 'selected' : ''}`}
                onClick={() => setPreference('congruence')}
              >
                <h3>Mood Congruence</h3>
                <p>Movies that match your current mood.</p>
              </div>
              <div
                className={`preference-card ${preference === 'incongruence' ? 'selected' : ''}`}
                onClick={() => setPreference('incongruence')}
              >
                <h3>Mood Incongruence</h3>
                <p>Movies that contrast your mood to uplift you.</p>
              </div>
            </div>
          </div>

          {/* PERSONAL NOTES */}
          <div className="personal-section">
            <h2>Tell me more:</h2>
            <textarea
              placeholder="Optional: How's life?"
              rows={5}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
            />
            <button
              className={`recommendation-buttonSearch ${explode ? "explode" : ""}`}
              onClick={handleSubmit}
              disabled={selectedMoods.length === 0 || preference === null}
            >
              {!explode && "Search"} {/* Text disappears when exploding */}
            </button>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <MovieResults formData={formData} />
        </div>
      )}
    </div>
  );
}

export default MovieRecommendationPage;
