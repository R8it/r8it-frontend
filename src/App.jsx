import React, { useState } from 'react';
import './App.css';
import { PhotoIcon, BoltIcon, StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';
import { BrainIcon } from './BrainIcon'; // Custom BrainIcon component

function App() {
  const [image, setImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [showPublishedPopup, setShowPublishedPopup] = useState(false); // New state for popup

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setAnalysisResult(null);
        setError(null);
        setReviewText('');
        setShowInitialScreen(false);
        setUserRating(0); // Reset rating
        analyzeImage(reader.result); // Automatically analyze after image selection
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image) => {
    if (!base64Image) {
      setError('Veuillez sélectionner une image.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('https://ai-backend-m0jg.onrender.com/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image.split(',')[1] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse de l\'image.');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      setReviewText('');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setReviewText((prevText) => 
      prevText ? `${prevText}, ${suggestion}` : suggestion
    );
  };

  const handlePublish = () => {
    setShowPublishedPopup(true); // Show the popup
    setTimeout(() => {
      setShowPublishedPopup(false); // Hide popup after 3 seconds
      // Reset all state to go back to the initial screen
      setImage(null);
      setAnalysisResult(null);
      setLoading(false);
      setError(null);
      setReviewText('');
      setShowInitialScreen(true);
      setUserRating(0);
    }, 3000); // 3 seconds
  };

  return (
    <div className="App">
      {showInitialScreen && (
        <div className="initial-screen">
          {/* R8it logo and text at the top center */}
          <div className="main-logo-container-horizontal-top-center">
            <img src="/camera-icon.png" alt="Camera Icon" className="main-logo-icon-horizontal-top-center" />
            <span className="main-logo-text-horizontal-top-center">R8it</span>
          </div>
          <h2>Une Photo. Avis Instantané.</h2>
          <p className="subtitle">C'est tout.</p>
          <p className="description">Transformez n'importe quelle expérience en avis structuré en moins de 30 secondes</p>

          <div className="flow-icons">
            <div className="flow-item">
              <PhotoIcon className="flow-icon colored-photo" />
              <span>Photo</span>
            </div>
            <div className="flow-line"></div>
            <div className="flow-item">
              <div className="brain-icon-container-colored">
                <BrainIcon className="brain-icon-colored" />
              </div>
              <span>IA</span>
            </div>
            <div className="flow-line"></div>
            <div className="flow-item">
              <SolidStarIcon className="flow-icon colored-star" />
              <span>Avis</span>
            </div>
          </div>

          <div className="action-buttons">
            <label htmlFor="file-upload" className="custom-file-upload">
              <PhotoIcon className="button-icon" />
              Ajouter une photo
            </label>
            <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {!showInitialScreen && loading && (
        <div className="analysis-loading-screen">
          <div className="main-icon-container">
            <BrainIcon className="brain-icon-loading" />
          </div>
          <h2>IA en cours d'analyse...</h2>
          <p className="subtitle">Reconnaissance instantanée en cours</p>
          {image && <img src={image} alt="Image à analyser" className="analysis-image-preview" />}
          <div className="progress-bar-container">
            <div className="progress-bar"></div>
          </div>
          <p className="finalisation-text">Finalisation...</p>
          <button className="ia-reelle-button">
            <BoltIcon className="ia-reelle-icon" />
            IA RÉELLE
          </button>
        </div>
      )}

      {!showInitialScreen && !loading && analysisResult && (
        <div className="analysis-results-container">
          <div className="analysis-header">
            <div className="status-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="status-icon">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="analysis-title">Lieu détecté !</h2>
            <p className="analysis-subtitle">Votre avis est prêt à être publié</p>
          </div>

          <div className="analysis-card">
            <div className="card-header">
              <div className="business-info">
                <span className="business-icon">{analysisResult.icon}</span>
                <div className="business-text">
                  <p className="business-name">{analysisResult.businessName}</p>
                  <p className="business-type">{analysisResult.businessType}</p>
                  <p className="location-detected">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="location-icon">
                      <path fillRule="evenodd" d="M9.696 1.604A.75.75 0 0 0 8.75 1H5.25a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-3.5ZM12.75 1H16a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.25a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 .75-.75ZM1.75 9H5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 .75-.75ZM9.75 9H13a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 .75-.75ZM1.75 17H5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 .75-.75ZM9.75 17H13a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                    Localisation détectée
                  </p>
                  <p className="analyzed-by">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="brain-icon-small">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6.75a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.625 0a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.375.75a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.625-.75a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm-2.625 3a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.625 0a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.375.75a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.625-.75a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm-2.625 3a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.625 0a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.375.75a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Zm2.625-.75a.75.75 0 1 0 0 1.5h.008a.75.75 0 1 0 0-1.5h-.008Z" clipRule="evenodd" />
                    </svg>
                    Analysé par GPT-4 Vision
                  </p>
                </div>
              </div>
              {image && <img src={image} alt="Miniature" className="analysis-thumbnail" />}
            </div>

            <div className="card-content">
              <h3>Votre note</h3>
              <div className="star-rating">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <span
                      key={ratingValue}
                      onClick={() => setUserRating(ratingValue)}
                      className="star"
                    >
                      {ratingValue <= userRating ? (
                        <SolidStarIcon className="star-icon-solid" />
                      ) : (
                        <OutlineStarIcon className="star-icon-outline" />
                      )}
                    </span>
                  );
                })}
              </div>

              <h3>Suggestions rapides (cliquez pour ajouter/retirer)</h3>
              <div className="suggestions-container-two-columns">
                <div className="suggestions-column positive-column">
                  <h4 className="column-title positive-title">👍 Points positifs</h4>
                  {analysisResult.positiveSuggestions && analysisResult.positiveSuggestions.slice(0, 3).map((s, index) => (
                    <span key={`pos-${index}`} className="suggestion-tag positive" onClick={() => handleSuggestionClick(s)}>
                      {s}
                    </span>
                  ))}
                </div>
                <div className="suggestions-column negative-column">
                  <h4 className="column-title negative-title">👎 Points négatifs</h4>
                  {analysisResult.negativeSuggestions && analysisResult.negativeSuggestions.slice(0, 3).map((s, index) => (
                    <span key={`neg-${index}`} className="suggestion-tag negative" onClick={() => handleSuggestionClick(s)}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <h3>Votre avis (modifiable)</h3>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Saisissez votre avis ici ou cliquez sur les suggestions..."
                rows="5"
                cols="50"
              ></textarea>

              <button className="publish-button" onClick={handlePublish}>
                <BoltIcon className="publish-icon" />
                Publier l'avis instantané
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublishedPopup && (
        <div className="published-popup">
          <div className="popup-content">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="popup-check-icon">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
            <p>Avis publié</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


