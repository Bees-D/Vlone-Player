import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Song } from '../lib/types';
import { getMediaType } from '../lib/utils';
import { usePlayer } from '../context/PlayerContext';

interface MediaPlayerProps {
    song: Song | null;
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    playbackSpeed?: number;
    onTimeUpdate: (time: number) => void;
    onDurationChange: (duration: number) => void;
    onEnded: () => void;
    onPlay: () => void;
    onPause: () => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({
    song,
    isPlaying,
    volume,
    currentTime,
    playbackSpeed = 1,
    onTimeUpdate,
    onDurationChange,
    onEnded,
    onPlay,
    onPause
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideo, setIsVideo] = useState(false);
    const { eqEnabled, eqGains } = usePlayer();

    // Audio Context & Filters
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const filtersRef = useRef<BiquadFilterNode[]>([]);

    const bands = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

    useEffect(() => {
        if (!song) return;
        const mediaType = song.video_url ? 'video' : getMediaType(song.file_path);
        setIsVideo(mediaType === 'video');
    }, [song]);

    // Initialize Audio Graph
    useEffect(() => {
        const mediaElement = isVideo ? videoRef.current : audioRef.current;
        if (!mediaElement) return;

        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioCtxRef.current;

        // Always try to resume context on interaction
        if (ctx.state === 'suspended') {
            const resume = () => ctx.resume();
            mediaElement.addEventListener('play', resume, { once: true });
        }

        // Connect source
        if (!sourceRef.current) {
            try {
                sourceRef.current = ctx.createMediaElementSource(mediaElement);
            } catch (e) {
                // Already connected or error
                return;
            }
        }

        // Create Filters if not exist
        if (filtersRef.current.length === 0) {
            let lastNode: AudioNode = sourceRef.current;
            filtersRef.current = bands.map((freq) => {
                const filter = ctx.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1.4; // Standard Q for 1-octave bands
                filter.gain.value = 0;
                lastNode.connect(filter);
                lastNode = filter;
                return filter;
            });
            lastNode.connect(ctx.destination);
        }

        return () => {
            // We usually don't want to close context completely to avoid clicks next time
        };
    }, [isVideo, song]);

    // Update Filter Gains
    useEffect(() => {
        filtersRef.current.forEach((filter, i) => {
            if (filter && eqGains[i] !== undefined) {
                const targetGain = eqEnabled ? eqGains[i] : 0;
                // Smooth transition to avoid pops
                filter.gain.setTargetAtTime(targetGain, audioCtxRef.current?.currentTime || 0, 0.1);
            }
        });
    }, [eqGains, eqEnabled]);

    useEffect(() => {
        const mediaElement = isVideo ? videoRef.current : audioRef.current;
        if (!mediaElement) return;

        if (isPlaying) {
            mediaElement.play().catch(err => console.error('Playback error:', err));
        } else {
            mediaElement.pause();
        }
    }, [isPlaying, isVideo]);

    useEffect(() => {
        const mediaElement = isVideo ? videoRef.current : audioRef.current;
        if (!mediaElement) return;
        mediaElement.volume = volume;
    }, [volume, isVideo]);

    // Playback speed
    useEffect(() => {
        const mediaElement = isVideo ? videoRef.current : audioRef.current;
        if (!mediaElement) return;
        mediaElement.playbackRate = playbackSpeed;
    }, [playbackSpeed, isVideo]);

    useEffect(() => {
        const mediaElement = isVideo ? videoRef.current : audioRef.current;
        if (!mediaElement) return;

        if (Math.abs(mediaElement.currentTime - currentTime) > 1) {
            mediaElement.currentTime = currentTime;
        }
    }, [currentTime, isVideo]);

    if (!song) return null;

    const mediaUrl = isVideo ? (song.video_url || song.audio_url) : song.audio_url;

    return (
        <>
            {isVideo ? (
                <video
                    ref={videoRef}
                    src={mediaUrl}
                    crossOrigin="anonymous"
                    onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
                    onDurationChange={(e) => onDurationChange(e.currentTarget.duration)}
                    onEnded={onEnded}
                    onPlay={onPlay}
                    onPause={onPause}
                    style={{ display: 'none' }}
                    preload="metadata"
                />
            ) : (
                <audio
                    ref={audioRef}
                    src={mediaUrl}
                    crossOrigin="anonymous"
                    onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
                    onDurationChange={(e) => onDurationChange(e.currentTarget.duration)}
                    onEnded={onEnded}
                    onPlay={onPlay}
                    onPause={onPause}
                    preload="metadata"
                />
            )}
        </>
    );
};

export default MediaPlayer;
