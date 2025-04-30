import React, { useState } from 'react';
import './movierecommendation.css';
import MovieResults from './movieresults.jsx';

function App() {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [preference, setPreference] = useState(null);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);

  const moods = [
    'Sad', 'Happy', 'Bored', 'Grief', 'Magical',
    'Excited', 'Loneliness', 'Romance', 'Adventurous', 'Brokenhearted',
    'Optimistic', 'Thrilled', 'Stressed', 'Relaxed & Carefree', 'Scared',
    'Angry', 'Community Joy', 'Hopeless', 'Nostalgia'
  ];

  const handleMoodSelection = (mood) => {
    setSelectedMoods((prev) => {
      if (prev.includes(mood)) {
        return prev.filter((m) => m !== mood);
      } else if (prev.length >= 5) {
        return prev;
      } else {
        return [...prev, mood];
      }
    });
  };

  const handlePreferenceSelection = (pref) => {
    setPreference(pref);
  };

  const handlePersonalNotesChange = (e) => {
    setPersonalNotes(e.target.value);
  };

  const handleSubmit = async () => {
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

      if (!response.ok) {
        throw new Error('Failed to fetch movie recommendations');
      }

      const result = await response.json();
      setFormData(result);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Something went wrong while getting recommendations!');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Movie Feels...</h1>
        <p>A website that provides movie recommendations tailored to what you need</p>
      </header>

      <div className="content">
        {!submitted ? (
          <>
            <div className="mood-section">
              <h2>What are you feeling right now? <span className="selection-count">(Select up to 5: {selectedMoods.length}/5)</span></h2>
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

            <div className="preference-section">
              <h2>Do you want...</h2>
              <div className="preference-cards">
                <div
                  className={`preference-card ${preference === 'congruence' ? 'selected' : ''}`}
                  onClick={() => handlePreferenceSelection('congruence')}
                >
                  <h3>Mood Congruence</h3>
                  <p>Movie recommendations that match how you feel at the moment. Movies that would help you process your own emotions and experience catharsis (a release of emotions)</p>
                </div>

                <div
                  className={`preference-card ${preference === 'incongruence' ? 'selected' : ''}`}
                  onClick={() => handlePreferenceSelection('incongruence')}
                >
                  <h3>Mood Incongruence</h3>
                  <p>Movie recommendations that would make you feel emotions contrast to your mood. Movies to uplift or boost your mood - Help you take a break from negative emotions.</p>
                </div>
              </div>
            </div>

            <div className="personal-section">
              <h2>Tell me all about it:</h2>
              <p className="optional-text">Optional, for a more personalized recommendation</p>
              <textarea
                placeholder="Share more about how you're feeling..."
                rows={5}
                value={personalNotes}
                onChange={handlePersonalNotesChange}
              ></textarea>
              <button
                className="recommendation-button"
                onClick={handleSubmit}
                disabled={selectedMoods.length === 0 || preference === null || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Movie Recommendations Please!'}
              </button>
            </div>
          </>
        ) : (
          <MovieResults formData={formData} />
        )}
      </div>

      <footer className="footer">
        <p>&copy; 2025 Movie Feels. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
