import { useRef, useEffect, useState, useCallback } from 'react';
import type { Song } from '../lib/types';

export const useAudio = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const filtersRef = useRef<Record<string, BiquadFilterNode>>({});

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.7);

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";

        const updateProgress = () => {
            setProgress(audioRef.current?.currentTime || 0);
            setDuration(audioRef.current?.duration || 0);
        };

        audioRef.current.addEventListener('timeupdate', updateProgress);

        return () => {
            audioRef.current?.removeEventListener('timeupdate', updateProgress);
            audioRef.current?.pause();
        };
    }, []);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current && audioRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

            const bands = [
                { label: 'Sub Bass', freq: 60, type: 'lowshelf' },
                { label: 'Punch', freq: 250, type: 'peaking' },
                { label: 'Warmth', freq: 1000, type: 'peaking' },
                { label: 'Clarity', freq: 4000, type: 'peaking' },
                { label: 'Air', freq: 12000, type: 'highshelf' },
            ];

            let lastNode: AudioNode = sourceRef.current;

            bands.forEach(band => {
                const filter = audioContextRef.current!.createBiquadFilter();
                filter.type = band.type as BiquadFilterType;
                filter.frequency.value = band.freq;
                filter.gain.value = 0;

                lastNode.connect(filter);
                lastNode = filter;
                filtersRef.current[band.label] = filter;
            });

            lastNode.connect(audioContextRef.current.destination);
        }
    }, []);

    const play = (url: string) => {
        if (!audioRef.current) return;
        initAudioContext();

        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const toggle = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const setVolume = (val: number) => {
        setVolumeState(val);
        if (audioRef.current) audioRef.current.volume = val;
    };

    const setEQGain = (band: string, gain: number) => {
        if (filtersRef.current[band]) {
            filtersRef.current[band].gain.value = gain;
        }
    };

    const onEnded = (callback: () => void) => {
        if (audioRef.current) {
            audioRef.current.onended = callback;
        }
    };

    return {
        isPlaying,
        progress,
        duration,
        volume,
        play,
        toggle,
        seek,
        setVolume,
        setEQGain,
        onEnded,
        setIsPlaying
    };
};
