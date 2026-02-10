import { Song } from '../types';
import { API_CONFIG } from '../config/api.config';

export const api = {
    getSongs: async (): Promise<Song[]> => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.songs}`, {
                cache: 'no-store', // Always fresh data
            });
            if (!response.ok) throw new Error('Failed to fetch songs');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    getSongById: async (id: string): Promise<Song | null> => {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.songById(id)}`);
            if (!response.ok) throw new Error('Failed to fetch song');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
};
