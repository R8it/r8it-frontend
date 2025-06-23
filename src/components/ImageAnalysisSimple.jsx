import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Icônes simples
const BrainIcon = () => (
  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
    <span className="text-white text-2xl">🧠</span>
  </div>
);

const StarIcon = ({ filled, onClick }) => (
  <button onClick={onClick} className="focus:outline-none">
    <span className={`text-3xl ${filled ? 'text-yellow-400' : 'text-gray-300'}`}>
      {filled ? '★' : '☆'}
    </span>
  </button>
);

const ImageAnalysisSimple = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [showInitialScreen, setShowInitialScreen] = useState(true);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setImage(e.target.result);
      setShowInitialScreen(false);
      setLoading(true);

      try {
        // Appel à l'API d'analyse
        const response = await fetch('https://ai-backend-m0jg.onrender.com/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: e.target.result
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'analyse');
        }

        const data = await response.json();
        setAnalysisResult(data.analysis);
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fonction pour gérer les clics sur les suggestions
  const handleSuggestionClick = (suggestion) => {
    const currentText = reviewText.trim();
    const words = currentText ? currentText.split(' ') : [];
    
    if (words.includes(suggestion)) {
      // Retirer la suggestion
      const newWords = words.filter(word => word !== suggestion);
      setReviewText(newWords.join(' '));
    } else {
      // Ajouter la suggestion
      const newText = currentText ? `${currentText} ${suggestion}` : suggestion;
      setReviewText(newText);
    }
  };

  const handlePublish = () => {
    alert('Avis publié avec succès !');
    // Reset
    setImage(null);
    setAnalysisResult(null);
    setReviewText('');
    setUserRating(0);
    setSelectedVendor('');
    setShowInitialScreen(true);
  };

  if (showInitialScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header simple */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <img src="/camera-icon.png" alt="R8it" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-900">R8it</span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img src="/camera-icon.png" alt="R8it" className="w-16 h-16" />
              <h1 className="text-4xl font-bold text-purple-600">R8it</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Une Photo. Avis Instantané.</h2>
            <p className="text-gray-600 mb-2">C'est tout.</p>
            <p className="text-gray-500">Transformez n'importe quelle expérience en avis structuré en moins de 30 secondes</p>
          </div>

          {/* Étapes */}
          <div className="flex items-center space-x-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-2xl">📷</span>
              </div>
              <span className="text-sm text-gray-600">Photo</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <span className="text-sm text-gray-600">IA</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <span className="text-sm text-gray-600">Avis</span>
            </div>
          </div>

          {/* Bouton upload */}
          <label className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium cursor-pointer hover:bg-purple-700 transition-colors">
            📷 Ajouter une photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <BrainIcon />
          <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4">IA en cours d'analyse...</h3>
          <p className="text-gray-600 mb-6">Reconnaissance instantanée en cours</p>
          
          {image && (
            <div className="mb-6">
              <img 
                src={image} 
                alt="Image en cours d'analyse" 
                className="max-w-xs max-h-64 object-cover rounded-lg shadow-md mx-auto"
              />
            </div>
          )}
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
          <p className="text-sm text-gray-500">Finalisation...</p>
        </div>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <img src="/camera-icon.png" alt="R8it" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-900">R8it</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header "Lieu détecté !" */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Lieu détecté !</h2>
              <p className="text-gray-600 mb-4">Votre avis est prêt à être publié</p>
            </div>

            {/* Infos produit avec image */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {analysisResult.productName || 'ETHIQUABLE'}
                  </h3>
                  <p className="text-gray-600">{analysisResult.businessType || 'Chocolat 100% Cacao Pérou'}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-2">📍 Localisation détectée</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <span className="bg-green-100 px-2 py-1 rounded-full">🧠 Analysé par GPT-4 Vision</span>
                  </div>
                </div>
                {image && (
                  <img 
                    src={image} 
                    alt="Image analysée" 
                    className="w-20 h-20 object-cover rounded-lg shadow-md ml-4"
                  />
                )}
              </div>
            </div>

            {/* Votre note */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Votre note</h3>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={star <= userRating}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Suggestions rapides */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Suggestions rapides (cliquez pour ajouter/retirer)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2 bg-green-100 px-3 py-1 rounded">
                    👍 Points positifs
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.positiveSuggestions?.map((suggestion, index) => (
                      <button 
                        key={index} 
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-red-700 mb-2 bg-red-100 px-3 py-1 rounded">
                    👎 Points négatifs
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.negativeSuggestions?.map((suggestion, index) => (
                      <button 
                        key={index} 
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm hover:bg-red-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Où avez-vous acheté ça ? */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Où avez-vous acheté ça ?</h3>
              <div className="flex flex-wrap gap-2">
                {['Amazon', 'Cdiscount', 'Le Bon Coin', 'Autre'].map((vendor) => (
                  <button
                    key={vendor}
                    onClick={() => setSelectedVendor(vendor)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedVendor === vendor
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vendor}
                  </button>
                ))}
              </div>
              {selectedVendor && (
                <div className="mt-3 p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800">Vendeur sélectionné : <strong>{selectedVendor}</strong></p>
                </div>
              )}
            </div>

            {/* Votre avis */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Votre avis (modifiable)</h3>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Saisissez votre avis ici ou cliquez sur les suggestions..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Bouton publier */}
            <div className="text-center">
              <button
                onClick={handlePublish}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                ⚡ Publier l'avis instantané
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ImageAnalysisSimple;

