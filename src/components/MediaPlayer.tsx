import React, { useRef, useEffect, useState } from 'react';
import { Song } from '../lib/types';
import { getMediaType } from '../lib/utils';

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

    useEffect(() => {
        if (!song) return;
        const mediaType = song.video_url ? 'video' : getMediaType(song.file_path);
        setIsVideo(mediaType === 'video');
    }, [song]);

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
