import React, { useState } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setAnalysisResult(null); // Clear previous analysis
        setError(null);
        setReviewText(''); // Clear review text
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
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
        body: JSON.stringify({ image: image.split(',')[1] }), // Send base64 part only
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse de l\'image.');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      setReviewText(''); // Ensure review text is empty by default

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

  return (
    <div className="App">
      <h1>R8it - Analyse d'Image</h1>

      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={analyzeImage} disabled={loading || !image}>
          {loading ? 'Analyse en cours...' : 'Analyser l\'image'}
        </button>
      </div>

      {error && <p className="error-message">Erreur: {error}</p>}

      {image && !analysisResult && !loading && (
        <div className="image-preview">
          <h2>Aperçu de l'image:</h2>
          <img src={image} alt="Aperçu" style={{ maxWidth: '300px', maxHeight: '300px' }} />
        </div>
      )}

      {analysisResult && (
        <div className="analysis-results">
          <h2>Résultats de l'analyse:</h2>
          <p><strong>Nom:</strong> {analysisResult.businessName} {analysisResult.icon}</p>
          <p><strong>Type:</strong> {analysisResult.businessType}</p>
          <p><strong>Catégorie:</strong> {analysisResult.category}</p>
          <p><strong>Adresse:</strong> {analysisResult.address}</p>
          <p><strong>Note suggérée:</strong> {analysisResult.suggestedRating}/5</p>
          <p><strong>Confiance:</strong> {(analysisResult.confidence * 100).toFixed(2)}%</p>

          <h3>Suggestions Positives:</h3>
          <div className="suggestions-container">
            {analysisResult.positiveSuggestions && analysisResult.positiveSuggestions.map((s, index) => (
              <span key={`pos-${index}`} className="suggestion-tag positive" onClick={() => handleSuggestionClick(s)}>
                {s}
              </span>
            ))}
          </div>

          <h3>Suggestions Négatives:</h3>
          <div className="suggestions-container">
            {analysisResult.negativeSuggestions && analysisResult.negativeSuggestions.map((s, index) => (
              <span key={`neg-${index}`} className="suggestion-tag negative" onClick={() => handleSuggestionClick(s)}>
                {s}
              </span>
            ))}
          </div>

          <h3>Votre avis:</h3>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Saisissez votre avis ici ou cliquez sur les suggestions..."
            rows="5"
            cols="50"
          ></textarea>

          <button className="publish-button">Publier l'avis</button>
        </div>
      )}
    </div>
  );
}

export default App;


