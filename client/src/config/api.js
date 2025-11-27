// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/users`,
  AUTH: `${API_BASE_URL}/auth`,
  FRIENDS: `${API_BASE_URL}/friends`,
  MULTIPLAYER: `${API_BASE_URL}/multiplayer`,
  EXTERNAL: `${API_BASE_URL}/external`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;

