import { Song } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
    getSongs: async (): Promise<Song[]> => {
        try {
            const response = await fetch(`${API_URL}/songs`, {
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
            const response = await fetch(`${API_URL}/songs/${id}`);
            if (!response.ok) throw new Error('Failed to fetch song');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
};
