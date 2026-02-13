import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    playSong: (song: Song, newQueue?: Song[]) => void;
    playByPath: (path: string, name: string) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    nextSong: () => void;
    prevSong: () => void;
    setPlaybackMode: (mode: PlaybackMode) => void;
    createPlaylist: (name: string) => void;
    addToPlaylist: (playlistId: string, songId: string) => void;
    removeFromPlaylist: (playlistId: string, songId: string) => void;
    downloadSong: (song: Song) => void;
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

    // For smart shuffle: keep track of original queue and injected radio songs
    const originalQueueRef = useRef<Song[]>([]);
    const radioSongsInjectedRef = useRef<Set<number>>(new Set());

    // Handle song end - move to next based on playback mode
    const handleSongEnd = async () => {
        if (playbackMode === 'radio') {
            // Pure radio mode - always fetch a new random song
            await playRadioSong();
        } else if (playbackMode === 'smart-shuffle') {
            // Smart shuffle - sometimes inject a radio song
            await nextSongSmartShuffle();
        } else {
            // Normal or shuffle mode
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

        // 30% chance to inject a radio song
        const shouldInjectRadio = Math.random() < 0.3;

        if (shouldInjectRadio) {
            try {
                const radioSong = await api.getRadio();
                // Insert radio song into queue temporarily
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
                nextSong(); // Fallback to normal next
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

                // Apply shuffle if in shuffle mode
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
            title: name,
            artist: 'Local Explorer',
            audio_url: `https://juicewrldapi.com/juicewrld/stream?path=${encodeURIComponent(path)}`,
            file_path: path,
            duration: 0
        };
        playSong(tempSong);
    };

    const nextSong = () => {
        if (queue.length === 0) return;

        let nextIdx = currentIndex + 1;
        if (nextIdx >= queue.length) {
            nextIdx = 0; // Loop back to start
        }

        setCurrentIndex(nextIdx);
        setCurrentSong(queue[nextIdx]);
        setIsPlaying(true);
        setCurrentTime(0);
    };

    const prevSong = () => {
        if (queue.length === 0) return;

        // If more than 3 seconds into the song, restart it
        if (currentTime > 3) {
            setCurrentTime(0);
            return;
        }

        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) {
            prevIdx = queue.length - 1; // Loop to end
        }

        setCurrentIndex(prevIdx);
        setCurrentSong(queue[prevIdx]);
        setIsPlaying(true);
        setCurrentTime(0);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const seek = (time: number) => {
        setCurrentTime(time);
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
    };

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
            // Find current song in new shuffled queue
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
            // Start radio mode
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
            playSong,
            playByPath,
            togglePlay,
            seek,
            setVolume: handleVolumeChange,
            nextSong,
            prevSong,
            setPlaybackMode,
            createPlaylist,
            addToPlaylist,
            removeFromPlaylist,
            downloadSong
        }}>
            <MediaPlayer
                song={currentSong}
                isPlaying={isPlaying}
                volume={volume}
                currentTime={currentTime}
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
