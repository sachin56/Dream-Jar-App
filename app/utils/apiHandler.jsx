import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.195:8000/api/';

const apiHandler = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000,
});

// Add token to request headers
apiHandler.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle API calls
export const apiRequest = async (method, endpoint, data = null) => {
  try {
    console.log('Making API request to', BASE_URL + endpoint);

    // If data is FormData, do NOT set Content-Type explicitly
    const isFormData = data instanceof FormData;

    const response = await apiHandler({
      method,
      url: endpoint,
      data,
      headers: isFormData
        ? {
            // Authorization header will still be added by interceptor
            Accept: 'application/json',
          }
        : {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    throw error;
  }
};


export default apiHandler;