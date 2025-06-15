export interface AuthRedirectState {
  from: {
    pathname: string;
    search?: string;
  };
  message?: string;
}

export interface PrivateContentState {
  accessRequired?: boolean;
  redirectReason?: string;
}
