import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================
 * SUPABASE STORAGE SERVICE
 * ============================================
 * Gestiona archivos de audio (.mp3) en Supabase Storage
 * Bucket: 'songs' (público para lectura)
 */

export class StorageService {
    private supabase: SupabaseClient;
    private readonly bucketName = 'songs';

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error(
                'Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env'
            );
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Obtiene la URL pública de un archivo de audio
     * @param filename - Nombre del archivo (ej: "bohemian-rhapsody.mp3")
     * @returns URL pública del archivo
     * @example
     * const url = storageService.getPublicUrl('song.mp3');
     * // Returns: https://xxx.supabase.co/storage/v1/object/public/songs/song.mp3
     */
    getPublicUrl(filename: string): string {
        if (!filename || filename.trim() === '') {
            throw new Error('Filename cannot be empty');
        }

        const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(filename);

        return data.publicUrl;
    }

    /**
     * Sube un archivo de audio al bucket
     * @param filename - Nombre del archivo (ej: "song.mp3")
     * @param file - Buffer del archivo
     * @returns URL pública del archivo subido
     */
    async uploadFile(filename: string, file: Buffer): Promise<string> {
        if (!filename || filename.trim() === '') {
            throw new Error('Filename cannot be empty');
        }

        if (!file || file.length === 0) {
            throw new Error('File buffer cannot be empty');
        }

        const { data, error } = await this.supabase.storage.from(this.bucketName).upload(filename, file, {
            contentType: 'audio/mpeg',
            upsert: true, // Sobrescribe si ya existe
        });

        if (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        return this.getPublicUrl(data.path);
    }

    /**
     * Verifica si un archivo existe en el bucket
     * @param filename - Nombre del archivo
     * @returns true si existe, false si no
     */
    async fileExists(filename: string): Promise<boolean> {
        try {
            const { data, error } = await this.supabase.storage.from(this.bucketName).list('', {
                search: filename,
            });

            if (error) return false;
            return data.some((file) => file.name === filename);
        } catch {
            return false;
        }
    }

    /**
     * Elimina un archivo del bucket
     * @param filename - Nombre del archivo
     */
    async deleteFile(filename: string): Promise<void> {
        const { error } = await this.supabase.storage.from(this.bucketName).remove([filename]);

        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Lista todos los archivos en el bucket
     * @returns Array de nombres de archivos
     */
    async listFiles(): Promise<string[]> {
        const { data, error } = await this.supabase.storage.from(this.bucketName).list();

        if (error) {
            throw new Error(`Failed to list files: ${error.message}`);
        }

        return data.map((file) => file.name);
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================
// Exporta una única instancia para reutilizar la conexión
export const storageService = new StorageService();
