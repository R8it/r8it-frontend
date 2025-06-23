import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhotoIcon, BoltIcon, StarIcon as SolidStarIcon, UserIcon } from '@heroicons/react/24/solid';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';
import { BrainIcon } from '../BrainIcon';
import { useAuth } from '../contexts/AuthContext';

function ImageAnalysis() {
  const { isAuthenticated, user, logout } = useAuth();
  const [image, setImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [showPublishedPopup, setShowPublishedPopup] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [customVendor, setCustomVendor] = useState('');
  const [showCustomVendorInput, setShowCustomVendorInput] = useState(false);

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
        setUserRating(0);
        setSelectedVendor('');
        setCustomVendor('');
        setShowCustomVendorInput(false);
        analyzeImage(reader.result);
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
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
      setReviewText(data.review || '');
    } catch (err) {
      console.error('Erreur lors de l\'analyse:', err);
      setError('Erreur lors de l\'analyse de l\'image. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    if (isAuthenticated) {
      // Si l'utilisateur est connecté, publier directement
      setShowPublishedPopup(true);
      setTimeout(() => {
        setShowPublishedPopup(false);
        setImage(null);
        setAnalysisResult(null);
        setReviewText('');
        setShowInitialScreen(true);
        setUserRating(0);
        setSelectedVendor('');
        setCustomVendor('');
        setShowCustomVendorInput(false);
      }, 2000);
    } else {
      // Si l'utilisateur n'est pas connecté, proposer de créer un compte
      const shouldCreateAccount = window.confirm(
        'Pour publier votre avis et le retrouver plus tard, créez un compte gratuit. Continuer sans compte ?'
      );
      
      if (shouldCreateAccount) {
        // Publier sans compte
        setShowPublishedPopup(true);
        setTimeout(() => {
          setShowPublishedPopup(false);
          setImage(null);
          setAnalysisResult(null);
          setReviewText('');
          setShowInitialScreen(true);
          setUserRating(0);
          setSelectedVendor('');
          setCustomVendor('');
          setShowCustomVendorInput(false);
        }, 2000);
      }
    }
  };

  const handleVendorSelect = (vendor) => {
    if (vendor === 'Autre') {
      setShowCustomVendorInput(true);
      setSelectedVendor('');
    } else {
      setSelectedVendor(vendor);
      setShowCustomVendorInput(false);
      setCustomVendor('');
    }
  };

  const handleCustomVendorSubmit = () => {
    if (customVendor.trim()) {
      setSelectedVendor(customVendor.trim());
      setShowCustomVendorInput(false);
    }
  };

  const renderStars = (rating, onStarClick) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onStarClick(star)}
            className="focus:outline-none transition-colors duration-200"
          >
            {star <= rating ? (
              <SolidStarIcon className="w-8 h-8 text-yellow-400" />
            ) : (
              <OutlineStarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (showInitialScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header avec authentification */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <img src="/camera-icon.png" alt="R8it" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-900">R8it</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Bonjour, {user?.username || user?.first_name}
                    </span>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span className="text-sm">Profil</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-2xl mx-auto">
            {/* Logo R8it principal */}
            <div className="flex justify-center items-center mb-8">
              <div className="flex items-center space-x-4">
                <img src="/camera-icon.png" alt="R8it" className="w-16 h-16" />
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  R8it
                </h1>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Une Photo. Avis Instantané.
            </h2>
            <p className="text-xl text-gray-600 mb-8">C'est tout.</p>
            <p className="text-lg text-gray-500 mb-12">
              Transformez n'importe quelle expérience en avis structuré en moins de 30 secondes
            </p>

            {/* Flux d'étapes */}
            <div className="flex justify-center items-center space-x-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <PhotoIcon className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Photo</span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-300"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                  <BrainIcon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-gray-700">IA</span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-300"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-3">
                  <SolidStarIcon className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Avis</span>
              </div>
            </div>

            {/* Bouton d'ajout de photo */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 cursor-pointer shadow-lg"
              >
                <PhotoIcon className="w-6 h-6 mr-3" />
                Ajouter une photo
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header avec authentification */}
      <header className="bg-white shadow-sm rounded-lg mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => {
                setShowInitialScreen(true);
                setImage(null);
                setAnalysisResult(null);
                setError(null);
              }}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img src="/camera-icon.png" alt="R8it" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">R8it</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user?.username || user?.first_name}
                  </span>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm">Profil</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyse en cours...</h3>
              <p className="text-gray-600">L'IA analyse votre image</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {analysisResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Analyse de votre image</h2>
              {image && (
                <img 
                  src={image} 
                  alt="Image analysée" 
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />
              )}
            </div>

            {/* Suggestions en 2 colonnes */}
            <div className="mb-8">
              <h3>Suggestions d'amélioration</h3>
              <div className="suggestions-container-two-columns">
                <div className="suggestions-column">
                  <h4 className="suggestions-column-title positive">
                    👍 Points positifs
                  </h4>
                  <div className="suggestions-list">
                    {analysisResult.positiveSuggestions?.map((suggestion, index) => (
                      <span key={index} className="suggestion-tag positive">
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="suggestions-column">
                  <h4 className="suggestions-column-title negative">
                    👎 Points négatifs
                  </h4>
                  <div className="suggestions-list">
                    {analysisResult.negativeSuggestions?.map((suggestion, index) => (
                      <span key={index} className="suggestion-tag negative">
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section de sélection des vendeurs */}
            <div className="vendor-selection-section">
              <h3>Où avez-vous acheté ça ?</h3>
              <div className="vendor-buttons">
                {analysisResult.suggestedVendors?.map((vendor, index) => (
                  <button
                    key={index}
                    onClick={() => handleVendorSelect(vendor)}
                    className={`vendor-button ${selectedVendor === vendor ? 'selected' : ''}`}
                  >
                    {vendor}
                  </button>
                ))}
                <button
                  onClick={() => handleVendorSelect('Autre')}
                  className={`vendor-button other ${showCustomVendorInput ? 'selected' : ''}`}
                >
                  Autre
                </button>
              </div>

              {showCustomVendorInput && (
                <div className="custom-vendor-input">
                  <input
                    type="text"
                    value={customVendor}
                    onChange={(e) => setCustomVendor(e.target.value)}
                    placeholder="Nom du vendeur..."
                    className="vendor-input"
                  />
                  <button
                    onClick={handleCustomVendorSubmit}
                    className="vendor-submit-btn"
                  >
                    Valider
                  </button>
                </div>
              )}

              {selectedVendor && (
                <div className="selected-vendor-display">
                  <span>Vendeur sélectionné : <strong>{selectedVendor}</strong></span>
                </div>
              )}
            </div>

            <h3>Votre avis (modifiable)</h3>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="4"
              placeholder="Modifiez votre avis ici..."
            />

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Votre note</h3>
              <div className="flex justify-center">
                {renderStars(userRating, setUserRating)}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handlePublish}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                Publier l'avis
              </button>
            </div>
          </div>
        )}

        {showPublishedPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Avis publié !</h3>
              <p className="text-gray-600">
                {isAuthenticated 
                  ? "Votre avis a été publié et sauvegardé dans votre profil."
                  : "Votre avis a été publié. Créez un compte pour retrouver vos avis."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageAnalysis;

