import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const analyzePDFs = (formData) => {
  return api.post('/pdf/analyze', formData);
};

export const healthCheck = () => {
  return api.get('/pdf/health');
};

export default api;