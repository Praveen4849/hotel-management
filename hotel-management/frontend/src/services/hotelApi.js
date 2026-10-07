import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const SERVER_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '';
const API_BASE_URL = SERVER_BASE_URL ? `${SERVER_BASE_URL}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetch hotels with optional search, price filtering, and pagination
 * @param {Object} params - { title, minPrice, maxPrice, offset, limit }
 */
export const getHotels = async (params = {}) => {
  const response = await api.get('/hotels', { params });
  return response.data;
};

/**
 * Fetch a single hotel by ID
 * @param {number|string} id 
 */
export const getHotelById = async (id) => {
  const response = await api.get(`/hotels/${id}`);
  return response.data;
};

/**
 * Create a new hotel
 * @param {FormData} formData 
 */
export const createHotel = async (formData) => {
  const response = await api.post('/hotels', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update an existing hotel
 * @param {number|string} id 
 * @param {FormData} formData 
 */
export const updateHotel = async (id, formData) => {
  const response = await api.put(`/hotels/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete a hotel by ID
 * @param {number|string} id 
 */
export const deleteHotel = async (id) => {
  const response = await api.delete(`/hotels/${id}`);
  return response.data;
};

/**
 * Helper to construct the full URL for an uploaded hotel image
 * @param {string} imagePath 
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Remove leading slash if any to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${SERVER_BASE_URL}/${cleanPath}`;
};

export default {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getImageUrl,
};
