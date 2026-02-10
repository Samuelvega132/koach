/**
 * API Configuration
 * 
 * Centralized API URL management for development and production environments.
 * 
 * ENVIRONMENT SETUP:
 * - Development: Uses localhost:3001 by default
 * - Production (Vercel): Set NEXT_PUBLIC_API_URL in Vercel environment variables
 *   Example: https://your-backend.onrender.com/api
 * 
 * USAGE:
 * import { API_CONFIG } from '@/config/api.config';
 * fetch(`${API_CONFIG.baseURL}/songs`);
 */

const getAPIBaseURL = (): string => {
    // Priority: Environment variable > Default localhost
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Development fallback
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3001/api';
    }

    // Production fallback (should NOT reach here, always set env var in production)
    console.error('[Warning] NEXT_PUBLIC_API_URL not set in production environment!');
    return '/api'; // Relative path fallback
};

export const API_CONFIG = {
    baseURL: getAPIBaseURL(),
    endpoints: {
        songs: '/songs',
        songById: (id: string) => `/songs/${id}`,
        performances: '/performances',
        performanceById: (id: string) => `/performances/${id}`,
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            logout: '/auth/logout',
            me: '/auth/me',
        },
    },
} as const;

// Log current configuration (only in development)
if (process.env.NODE_ENV === 'development') {
    if (process.env.NODE_ENV === 'development') {
        console.log('[API Config]', API_CONFIG.baseURL);
    }
}
