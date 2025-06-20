export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  avatar_filename?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
}

export interface UserUpdateMe {
  first_name?: string;
  last_name?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface FastAPIError {
  detail: string | ValidationError[];
}

export interface UserUpdateMeEmail {
  new_email: string;
}


export interface UserUpdateMePassword {
  current_password: string;
  new_password: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}
