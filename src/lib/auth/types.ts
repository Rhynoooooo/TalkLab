/**
 * TalkLab 2.0 - Role-Based Access Control (RBAC) Type Definitions
 * Client-safe and server-safe pure TypeScript contracts.
 */

export type UserRole = 'admin' | 'member';

export interface SessionPayload {
  role: UserRole;
  userId: string;
  phone?: string;
  seatNumber?: number;
  name?: string;
  sessionName?: string;
  lastActive: number;
  iat?: number;
  exp?: number;
}


export interface AuthMeResponse {
  authenticated: boolean;
  user: SessionPayload | null;
}

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  remainingAttempts?: number;
  lockedOut?: boolean;
}

export interface OtpRequestResponse {
  success: boolean;
  formattedPhone?: string;
  message?: string;
  error?: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    role: UserRole;
    userId: string;
    phone: string;
    seatNumber?: number;
  };
}
