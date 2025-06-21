import axios from 'axios';

import { setupInterceptors } from './interceptors';

export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api/v1';


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
