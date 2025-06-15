import { authApiClient } from '@shared/api/client';
import { FastAPIError,Token, TokenPair, UserLogin, UserRegister } from '@shared/types/auth';
import { AxiosError } from 'axios';


export class AuthAPIError extends Error {
  public statusCode: number;
  public detail: string;
  public validationErrors?: Array<{ field: string; message: string }>;

  constructor(statusCode: number, detail: string, validationErrors?: Array<{ field: string; message: string }>) {
    super(detail);
    this.statusCode = statusCode;
    this.detail = detail;
    this.validationErrors = validationErrors;
    this.name = 'AuthAPIError';
  }
}

const handleApiError = (error: AxiosError<FastAPIError>): never => {
  if (!error.response) {
    throw new AuthAPIError(0, 'Ошибка сети');
  }

  const { status, data } = error.response;

  if (status === 422 && Array.isArray(data.detail)) {
    const validationErrors = data.detail.map(err => ({
      field: err.loc.slice(-1)[0].toString(),
      message: err.msg,
    }));
    throw new AuthAPIError(status, 'Ошибка валидации данных', validationErrors);
  }

  const detail = typeof data.detail === 'string' ? data.detail : 'Произошла ошибка';
  throw new AuthAPIError(status, detail);
};

export const authAPI = {
  async login(credentials: UserLogin): Promise<TokenPair> {
    try {
      const response = await authApiClient.post<TokenPair>('/login', credentials);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<FastAPIError>);
    }
  },

  async register(userData: UserRegister): Promise<TokenPair> {
    try {
      const response = await authApiClient.post<TokenPair>('/signup', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<FastAPIError>);
    }
  },

  async refreshToken(token: Token): Promise<TokenPair> {
    try {
      const response = await authApiClient.post<TokenPair>('/login/refresh-token', token);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError<FastAPIError>);
    }
  },
};
