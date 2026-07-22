/** Identity/session model owned by auth-service. */

export interface Customer {
  id: string;
  email: string;
  phone?: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  customerId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
