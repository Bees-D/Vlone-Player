import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Song, Playlist, PlaybackMode } from '../lib/types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { shuffleArray } from '../lib/utils';
import { api } from '../lib/api';
import MediaPlayer from '../components/MediaPlayer';

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    playlists: Playlist[];
    queue: Song[];
    currentIndex: number;
    playbackMode: PlaybackMode;
    playbackSpeed: number;
    playSong: (song: Song, newQueue?: Song[]) => void;
    playByPath: (path: string, name: string) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    nextSong: () => void;
    prevSong: () => void;
    setPlaybackMode: (mode: PlaybackMode) => void;
    setPlaybackSpeed: (speed: number) => void;
    createPlaylist: (name: string) => void;
    addToPlaylist: (playlistId: string, songId: string) => void;
    removeFromPlaylist: (playlistId: string, songId: string) => void;
    deletePlaylist: (playlistId: string) => void;
    renamePlaylist: (playlistId: string, newName: string) => void;
    reorderQueue: (fromIndex: number, toIndex: number) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    downloadSong: (song: Song) => void;
    history: Song[];
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useLocalStorage('999_volume', 0.7);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playlists, setPlaylists] = useLocalStorage<Playlist[]>('999_playlists', []);
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [playbackMode, setPlaybackMode] = useLocalStorage<PlaybackMode>('999_playback_mode', 'normal');
    const [playbackSpeed, setPlaybackSpeed] = useLocalStorage('999_playback_speed', 1);
    const [history, setHistory] = useLocalStorage<Song[]>('999_history', []);

    const originalQueueRef = useRef<Song[]>([]);
    const radioSongsInjectedRef = useRef<Set<number>>(new Set());
    const prevVolumeRef = useRef(0.7);

    // Add to history when song changes
    useEffect(() => {
        if (currentSong) {
            setHistory(prev => {
                const filtered = prev.filter(s => s.id !== currentSong.id);
                return [currentSong, ...filtered].slice(0, 100); // Keep last 100
            });
        }
    }, [currentSong]);

    // Media Session API — OS-level controls
    useEffect(() => {
        if (!('mediaSession' in navigator) || !currentSong) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: currentSong.artist,
            album: currentSong.album || currentSong.era || 'Juice WRLD',
            artwork: currentSong.cover_url ? [
                { src: currentSong.cover_url, sizes: '512x512', type: 'image/png' }
            ] : []
        });

        navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined) setCurrentTime(details.seekTime);
        });
    }, [currentSong]);

    // Update Media Session playback state
    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, [isPlaying]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowRight':
                    if (e.shiftKey) {
                        nextSong();
                    } else {
                        seek(Math.min(currentTime + 10, duration));
                    }
                    break;
                case 'ArrowLeft':
                    if (e.shiftKey) {
                        prevSong();
                    } else {
                        seek(Math.max(currentTime - 10, 0));
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(Math.min(volume + 0.05, 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(Math.max(volume - 0.05, 0));
                    break;
                case 'm':
                case 'M':
                    if (volume > 0) {
                        prevVolumeRef.current = volume;
                        setVolume(0);
                    } else {
                        setVolume(prevVolumeRef.current || 0.7);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentTime, duration, volume, isPlaying]);

    const handleSongEnd = async () => {
        if (playbackMode === 'radio') {
            await playRadioSong();
        } else if (playbackMode === 'smart-shuffle') {
            await nextSongSmartShuffle();
        } else {
            nextSong();
        }
    };

    const playRadioSong = async () => {
        try {
            const radioSong = await api.getRadio();
            setCurrentSong(radioSong);
            setIsPlaying(true);
            setCurrentTime(0);
        } catch (error) {
            console.error('Failed to fetch radio song:', error);
        }
    };

    const nextSongSmartShuffle = async () => {
        if (queue.length === 0) return;

        const shouldInjectRadio = Math.random() < 0.3;

        if (shouldInjectRadio) {
            try {
                const radioSong = await api.getRadio();
                const newQueue = [...queue];
                const insertPosition = currentIndex + 1;
                newQueue.splice(insertPosition, 0, radioSong);
                setQueue(newQueue);
                radioSongsInjectedRef.current.add(insertPosition);

                setCurrentIndex(insertPosition);
                setCurrentSong(radioSong);
                setIsPlaying(true);
                setCurrentTime(0);
            } catch (error) {
                console.error('Failed to fetch smart shuffle song:', error);
                nextSong();
            }
        } else {
            nextSong();
        }
    };

    const playSong = (song: Song, newQueue?: Song[]) => {
        if (currentSong?.id === song.id) {
            setIsPlaying(!isPlaying);
        } else {
            if (newQueue && newQueue.length > 0) {
                originalQueueRef.current = [...newQueue];
                const queueToUse = playbackMode === 'shuffle' ? shuffleArray(newQueue) : newQueue;
                setQueue(queueToUse);
                setCurrentIndex(queueToUse.findIndex(s => s.id === song.id));
                radioSongsInjectedRef.current.clear();
            } else if (!queue.find(s => s.id === song.id)) {
                setQueue([song]);
                setCurrentIndex(0);
                originalQueueRef.current = [song];
            } else {
                setCurrentIndex(queue.findIndex(s => s.id === song.id));
            }

            setCurrentSong(song);
            setIsPlaying(true);
            setCurrentTime(0);
        }
    };

    const playByPath = (path: string, name: string) => {
        const tempSong: Song = {
            id: `file-${path}`,
            title: name.replace(/\.[^/.]+$/, ''),
            artist: 'File Explorer',
            audio_url: `https://juicewrldapi.com/juicewrld/stream?path=${encodeURIComponent(path)}`,
            file_path: path,
            duration: 0
        };
        playSong(tempSong);
    };

    const nextSong = useCallback(() => {
        if (queue.length === 0) return;
        let nextIdx = currentIndex + 1;
        if (nextIdx >= queue.length) nextIdx = 0;
        setCurrentIndex(nextIdx);
        setCurrentSong(queue[nextIdx]);
        setIsPlaying(true);
        setCurrentTime(0);
    }, [queue, currentIndex]);

    const prevSong = useCallback(() => {
        if (queue.length === 0) return;
        if (currentTime > 3) {
            setCurrentTime(0);
            return;
        }
        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) prevIdx = queue.length - 1;
        setCurrentIndex(prevIdx);
        setCurrentSong(queue[prevIdx]);
        setIsPlaying(true);
        setCurrentTime(0);
    }, [queue, currentIndex, currentTime]);

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const seek = useCallback((time: number) => {
        setCurrentTime(time);
    }, []);

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
    };

    // Queue Management
    const reorderQueue = (fromIndex: number, toIndex: number) => {
        const newQueue = [...queue];
        const [moved] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, moved);
        setQueue(newQueue);

        // Update currentIndex if it was affected
        if (fromIndex === currentIndex) {
            setCurrentIndex(toIndex);
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
            setCurrentIndex(currentIndex - 1);
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const removeFromQueue = (index: number) => {
        if (index === currentIndex) return; // Can't remove currently playing
        const newQueue = [...queue];
        newQueue.splice(index, 1);
        setQueue(newQueue);
        if (index < currentIndex) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const clearQueue = () => {
        const current = queue[currentIndex];
        if (current) {
            setQueue([current]);
            setCurrentIndex(0);
        }
    };

    // Playlist Management
    const createPlaylist = (name: string) => {
        const newPlaylist: Playlist = {
            id: crypto.randomUUID(),
            name,
            songIds: []
        };
        setPlaylists([...playlists, newPlaylist]);
    };

    const addToPlaylist = (playlistId: string, songId: string) => {
        setPlaylists(playlists.map(p => {
            if (p.id === playlistId && !p.songIds.includes(songId)) {
                return { ...p, songIds: [...p.songIds, songId] };
            }
            return p;
        }));
    };

    const removeFromPlaylist = (playlistId: string, songId: string) => {
        setPlaylists(playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, songIds: p.songIds.filter(id => id !== songId) };
            }
            return p;
        }));
    };

    const deletePlaylist = (playlistId: string) => {
        setPlaylists(playlists.filter(p => p.id !== playlistId));
    };

    const renamePlaylist = (playlistId: string, newName: string) => {
        setPlaylists(playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, name: newName };
            }
            return p;
        }));
    };

    const downloadSong = (song: Song) => {
        const url = song.audio_url || song.video_url;
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.title} - ${song.artist}.${song.video_url ? 'mp4' : 'mp3'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Update queue when playback mode changes
    useEffect(() => {
        if (playbackMode === 'shuffle' && originalQueueRef.current.length > 0) {
            const shuffled = shuffleArray(originalQueueRef.current);
            setQueue(shuffled);
            if (currentSong) {
                const newIndex = shuffled.findIndex(s => s.id === currentSong.id);
                setCurrentIndex(newIndex);
            }
        } else if (playbackMode === 'normal' && originalQueueRef.current.length > 0) {
            setQueue(originalQueueRef.current);
            if (currentSong) {
                const newIndex = originalQueueRef.current.findIndex(s => s.id === currentSong.id);
                setCurrentIndex(newIndex);
            }
        } else if (playbackMode === 'radio') {
            playRadioSong();
        }
    }, [playbackMode]);

    return (
        <PlayerContext.Provider value={{
            currentSong,
            isPlaying,
            volume,
            currentTime,
            duration,
            playlists,
            queue,
            currentIndex,
            playbackMode,
            playbackSpeed,
            history,
            playSong,
            playByPath,
            togglePlay,
            seek,
            setVolume: handleVolumeChange,
            nextSong,
            prevSong,
            setPlaybackMode,
            setPlaybackSpeed,
            createPlaylist,
            addToPlaylist,
            removeFromPlaylist,
            deletePlaylist,
            renamePlaylist,
            reorderQueue,
            removeFromQueue,
            clearQueue,
            downloadSong
        }}>
            <MediaPlayer
                song={currentSong}
                isPlaying={isPlaying}
                volume={volume}
                currentTime={currentTime}
                playbackSpeed={playbackSpeed}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
                onEnded={handleSongEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used within PlayerProvider');
    return context;
};
