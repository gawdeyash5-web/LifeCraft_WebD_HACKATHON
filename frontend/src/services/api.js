/**
 * Centralized API Service for LIFECRAFT Frontend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Common fetch wrapper with JSON parsing and error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('lifecraft_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({
    success: false,
    error: { message: 'Failed to parse server response' },
  }));

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || `HTTP ${response.status}: Request failed`;
    throw new Error(errorMsg);
  }

  return json.data;
}

// Subsystem API Helpers
export const Api = {
  health: () => apiRequest('/health'),
  
  // Auth (Member 3)
  auth: {
    login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Player (Member 3)
  player: {
    getMe: () => apiRequest('/player/me'),
    updateRegion: (activeRegion) => apiRequest('/player/region', { method: 'PATCH', body: JSON.stringify({ activeRegion }) }),
  },

  // Quests (Member 2)
  quests: {
    list: () => apiRequest('/quests'),
    create: (quest) => apiRequest('/quests', { method: 'POST', body: JSON.stringify(quest) }),
    complete: (id) => apiRequest(`/quests/${id}/complete`, { method: 'POST' }),
    delete: (id) => apiRequest(`/quests/${id}`, { method: 'DELETE' }),
  },

  // Economy (Member 3)
  economy: {
    getItems: () => apiRequest('/economy/items'),
    buyItem: (itemId) => apiRequest('/economy/buy', { method: 'POST', body: JSON.stringify({ itemId }) }),
    getInventory: () => apiRequest('/economy/inventory'),
  },
};
