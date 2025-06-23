import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'https://j6h5i7c153o9.manus.space/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si le token est expiré (401) et qu'on n'a pas déjà essayé de le renouveler
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        authService.logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Inscription
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { access_token, refresh_token, user } = response.data;
      
      // Stocker les tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Connexion
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { username: email, password });
      const { access_token, refresh_token, user } = response.data;
      
      // Stocker les tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Déconnexion
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Même si la déconnexion côté serveur échoue, on nettoie le localStorage
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Récupérer le profil utilisateur
  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Mettre à jour le profil
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Demander un reset de mot de passe
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Vérifier l'email
  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Récupérer l'utilisateur depuis le localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Récupérer le token d'accès
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  // Gestion des erreurs
  handleError(error) {
    if (error.response) {
      // Erreur de réponse du serveur
      const message = error.response.data?.error || 'Une erreur est survenue';
      return new Error(message);
    } else if (error.request) {
      // Erreur de réseau
      return new Error('Erreur de connexion au serveur');
    } else {
      // Autre erreur
      return new Error('Une erreur inattendue est survenue');
    }
  },
};

export default authService;

