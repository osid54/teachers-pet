import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiError = async (error, fallback) => {
  let data = error.response?.data;
  if (data instanceof Blob) data = await data.text();
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = null; }
  }
  const detail = data?.detail;
  const message = typeof detail === 'string' ? detail : Array.isArray(detail)
    ? detail.map(item => item.msg).filter(Boolean).join('; ') : null;
  return new Error(message || fallback, { cause: error });
};

export const fetchBackendStatus = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error("Error fetching backend status:", error);
    throw new Error('Failed to connect to backend.', { cause: error });
  }
};

export const fetchProblemsList = async (requestData) => {
  try {
    const response = await api.post('/get-problems', requestData);
    return response.data;
  } catch (error) {
    throw await apiError(error, 'Failed to fetch problems due to network or server error.');
  }
};

export const generateWorksheetPDF = async (generationRequests) => {
  try {
    const response = await api.post('/generate-worksheet', generationRequests, {
      responseType: 'blob', // Keep this for successful PDF returns
    });
    return response.data;
  } catch (error) {
    throw await apiError(error, 'Failed to generate worksheet.');
  }
};