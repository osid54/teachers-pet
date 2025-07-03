import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchBackendStatus = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error("Error fetching backend status:", error);
    throw new Error('Failed to connect to backend.');
  }
};

export const generateWorksheetPDF = async (worksheetData) => {
  try {
    const response = await api.post('/generate-worksheet', worksheetData, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error generating worksheet:", error);
    if (error.response && error.response.data) {
        const errorBlob = error.response.data;
        const errorText = await errorBlob.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.detail || "Unknown error generating worksheet.");
        } catch (parseError) {
            throw new Error(errorText || "Unknown error generating worksheet.");
        }
    }
    throw new Error('Failed to generate worksheet due to network or server error.');
  }
};