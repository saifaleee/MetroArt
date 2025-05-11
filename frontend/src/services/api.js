import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Fallback for safety

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('artToken_yourname'); // Add your name
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token found and added to request headers');
  } else {
    console.warn('No authentication token found in localStorage');
  }
  return config;
});

// Add response interceptor to log errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url
      });
    } else if (error.request) {
      console.error('API Request Error (No response):', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const register = (userData) => apiClient.post('/auth-yourname/register', userData);
export const login = (userData) => apiClient.post('/auth-yourname/login', userData);
export const getMe = () => apiClient.get('/auth-yourname/me');

// Art Services
export const getAllArtworks = () => apiClient.get('/art-yourname');
export const getUserArtworks = () => {
  console.log('Calling getUserArtworks to:', `${API_URL}/art-yourname/my-art`);
  return apiClient.get('/art-yourname/my-art');
};
export const getArtworkById = (id) => apiClient.get(`/art-yourname/${id}`);

// For creating art with file upload, use FormData
export const createArt = (formData) => {
  return apiClient.post('/art-yourname', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const updateArtwork = (id, artData) => {
  // Handle FormData for file uploads in updates
  const headers = {};
  if (artData instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  return apiClient.put(`/art-yourname/${id}`, artData, { headers });
};
export const deleteArtwork = (id) => apiClient.delete(`/art-yourname/${id}`);

// Add like/unlike functionality
export const likeArtwork = (id) => apiClient.post(`/art-yourname/${id}/like`);
export const unlikeArtwork = (id) => apiClient.delete(`/art-yourname/${id}/like`);

// Add comment functionality
export const getComments = (artId) => apiClient.get(`/art-yourname/${artId}/comments`);
export const addComment = (artId, comment) => apiClient.post(`/art-yourname/${artId}/comments`, { content: comment });
export const deleteComment = (artId, commentId) => apiClient.delete(`/art-yourname/${artId}/comments/${commentId}`);

export default apiClient;