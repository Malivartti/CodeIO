import axios from 'axios';

import { setupInterceptors } from './interceptors';

export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient, authApiClient);
