import React, { useState } from 'react';
import './addmovie.css';

function AddMovieReview({ showModal, onClose }) {
  // ---------------- State ----------------
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
    mood: [],
    review: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------- Constants ----------------
  const moods = [
    'Sad', 'Happy', 'Bored', 'Grief', 'Magical',
    'Excited', 'Loneliness', 'Romance', 'Adventurous', 'Brokenhearted',
    'Optimistic', 'Thrilled', 'Stressed', 'Relaxed & Carefree', 'Scared',
    'Angry', 'Community Joy', 'Hopeless', 'Nostalgia'
  ];

  // ---------------- Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    if (!file.type.match('image.*')) {
      setError('Please select a valid image file');
      e.target.value = '';
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    setError('');
  };

  const toggleMood = (mood) => {
    setFormData(prev => ({
      ...prev,
      mood: prev.mood.includes(mood)
        ? prev.mood.filter(m => m !== mood)
        : prev.mood.length < 5
          ? [...prev.mood, mood]
          : prev.mood
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.image) throw new Error('Please select an image');
      if (formData.mood.length === 0) throw new Error('Please select at least one mood');

      const uploadData = new FormData();
      uploadData.append('image', formData.image);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('review', formData.review);
      uploadData.append('moods', formData.mood.join(','));

      const response = await fetch('http://localhost:8000/api/movies', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to submit movie');
      }

      const data = await response.json();
      console.log('Success:', data);

      alert('Movie review submitted successfully!');
      setFormData({ image: null, title: '', description: '', mood: [], review: '' });
      onClose();

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- UI ----------------
  if (!showModal) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Add New Movie for Review</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="movie-form">
          {/* Image Upload */}
          <div className="image-input-group">
            <label htmlFor="movieImage">Movie Image:</label>
            <label htmlFor="movieImage" className="custom-file-upload">Choose Image</label>
            <input
              type="file"
              id="movieImage"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {formData.image && (
              <>
                <div className="file-name">{formData.image.name}</div>
                <div className="image-preview">
                  <img src={URL.createObjectURL(formData.image)} alt="Movie Preview" />
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <label>
            Movie Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          {/* Description */}
          <label>
            Movie Description:
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>

          {/* Mood Selection */}
          <div className="mood-section">
            <h3>How did the movie make you feel? (Select up to 5)</h3>
            <div className="mood-grid">
              {moods.map(mood => (
                <button
                  type="button"
                  key={mood}
                  className={`mood-button ${formData.mood.includes(mood) ? 'selected' : ''} ${formData.mood.length >= 5 && !formData.mood.includes(mood) ? 'disabled' : ''}`}
                  onClick={() => toggleMood(mood)}
                  disabled={formData.mood.length >= 5 && !formData.mood.includes(mood)}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Review */}
          <label>
            Personal Review:
            <textarea
              name="review"
              rows="4"
              value={formData.review}
              onChange={handleChange}
              required
            />
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMovieReview;
