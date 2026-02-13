import { MediaType } from './types';

/**
 * Determine media type from file extension
 */
export const getMediaType = (filename: string): MediaType => {
    const ext = filename.split('.').pop()?.toLowerCase();

    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'opus'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v'];

    if (ext && audioExtensions.includes(ext)) return 'audio';
    if (ext && videoExtensions.includes(ext)) return 'video';
    return 'unknown';
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Format file size to human readable
 */
export const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Download a file from URL
 */
export const downloadFile = async (url: string, filename: string): Promise<void> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};

/**
 * Download multiple files as a batch
 */
export const downloadBatch = async (files: Array<{ url: string; filename: string }>, onProgress?: (current: number, total: number) => void): Promise<void> => {
    const total = files.length;

    for (let i = 0; i < total; i++) {
        const file = files[i];
        await downloadFile(file.url, file.filename);

        if (onProgress) {
            onProgress(i + 1, total);
        }

        // Add small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Format seconds into m:ss
 */
export const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Generate shareable URL for a playlist or song
 */
export const generateShareUrl = (type: 'playlist' | 'song', data: any): string => {
    const baseUrl = window.location.origin;
    const payload = JSON.stringify({ type, data });
    // Use URL safe base64
    const encoded = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${baseUrl}/share/${encoded}`;
};

/**
 * Parse shareable URL
 */
export const parseShareUrl = (encodedData: string): any => {
    try {
        const decoded = atob(encodedData);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Failed to parse share URL:', error);
        return null;
    }
};
