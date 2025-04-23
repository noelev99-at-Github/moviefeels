import React, { useState } from 'react';
import './movierecommendation.css';

function App() {
  // State to track selected moods (maximum 5)
  const [selectedMoods, setSelectedMoods] = useState([]);
  // State to track preference selection (mood congruence or incongruence)
  const [preference, setPreference] = useState(null);
  // State to track personal notes
  const [personalNotes, setPersonalNotes] = useState('');
  // State to track if form has been submitted
  const [submitted, setSubmitted] = useState(false);
  // State to store the final data object
  const [formData, setFormData] = useState(null);

  // List of all available moods
  const moods = [
    'Sad', 'Happy', 'Bored', 'Grief', 'Magical',
    'Excited', 'Loneliness', 'Romance', 'Adventurous', 'Brokenhearted',
    'Optimistic', 'Thrilled', 'Stressed', 'Relaxed & Carefree', 'Scared',
    'Angry', 'Community Joy', 'Hopeless', 'Nostalgia'
  ];

  // Handle mood selection and limit to 5 options
  const handleMoodSelection = (mood) => {
    setSelectedMoods(prevMoods => {
      // If mood is already selected, remove it
      if (prevMoods.includes(mood)) {
        return prevMoods.filter(m => m !== mood);
      }
      // If 5 moods are already selected, don't add more
      else if (prevMoods.length >= 5) {
        return prevMoods;
      }
      // Otherwise, add the mood
      else {
        return [...prevMoods, mood];
      }
    });
  };

  // Handle preference selection
  const handlePreferenceSelection = (pref) => {
    setPreference(pref);
  };

  // Handle personal notes changes
  const handlePersonalNotesChange = (e) => {
    setPersonalNotes(e.target.value);
  };

  // Handle form submission
  const handleSubmit = () => {
    const data = {
      moods: selectedMoods,
      preference: preference,
      personalNotes: personalNotes,
      timestamp: new Date().toISOString()
    };
    
    setFormData(data);
    setSubmitted(true);
    
    // Here you could also send this data to an API or perform other actions
    console.log('Form submitted with data:', data);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Movie Feels...</h1>
        <p>A website that provides movie recommendations tailored to what you need</p>
      </header>
      
      <div className="content">
        <div className="mood-section">
          <h2>What are you feeling right now? <span className="selection-count">(Select up to 5 emotions: {selectedMoods.length}/5)</span></h2>
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
              className={`preference-card ${preference === 'congruence' ? 'selected' : 'not-selected'}`}
              onClick={() => handlePreferenceSelection('congruence')}
            >
              <h3>Mood Congruence</h3>
              <p>Movie recommendations that match how you feel at the moment. Movies that would help you process your own emotions and experience catharsis (a release of emotions)</p>
            </div>
            
            <div 
              className={`preference-card ${preference === 'incongruence' ? 'selected' : 'not-selected'}`}
              onClick={() => handlePreferenceSelection('incongruence')}
            >
              <h3>Mood Incongruence</h3>
              <p>Movie recommendations that would make you feel emotions contrast to your mood. Movies to uplift or boost your mood - Help you take a break from negative emotions.</p>
            </div>
          </div>
        </div>
        
        <div className="personal-section">
          <h2>Tell me all about it:</h2>
          <p className="optional-text">Optional, for a more personalized movie recommendation</p>
          <textarea
            placeholder="Share more about how you're feeling..."
            rows={5}
            value={personalNotes}
            onChange={handlePersonalNotesChange}
          ></textarea>
          <button 
            className="recommendation-button"
            onClick={handleSubmit}
            disabled={selectedMoods.length === 0 || preference === null}
          >
            Movie Recommendations Please!
          </button>
        </div>

        {submitted && (
          <div className="results-section">
            <h2>Your Request Data:</h2>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <footer className="footer">
        <p>&copy; 2025 Movie Feels. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
