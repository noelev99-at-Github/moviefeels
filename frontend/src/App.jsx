import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="hero-container">
        <div className="glass-bubble">
          <div className="bubble-content">
            <h1 className="title">Movie Feels</h1>
            <p className="subtitle">
              Harnessing AI and community reviews to bring you movie recommendations that help you breathe through life.
            </p>

            <div className="btn-group">
              {/* Navigate to movie search page */}
              <button
                className="btn-outline"
                onClick={() => navigate('/moviereview')}
              >
                Movie Search & Review
              </button>

              {/* Navigate to full movie recommendation page */}
              <button
                className="btn-primary1"
                onClick={() => navigate('/movierecommendation')}
              >
                Movie Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer, untouched */}
      <footer className="footer"></footer>
    </div>
  );
}

export default App;
