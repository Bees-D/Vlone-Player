import React, { useState } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2,
    Download, Shuffle, List, Radio, Sparkles, ListMusic, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { formatDuration } from '../lib/utils';
import { clsx } from 'clsx';
import type { PlaybackMode } from '../lib/types';

interface PlayerProps {
    onExpand: () => void;
    onProducerClick?: (producer: string) => void;
    onQueueToggle?: () => void;
    showQueue?: boolean;
}

const Player: React.FC<PlayerProps> = ({ onExpand, onProducerClick, onQueueToggle, showQueue }) => {
    const {
        currentSong, isPlaying, togglePlay, currentTime, duration, seek, volume, setVolume,
        nextSong, prevSong, playbackMode, setPlaybackMode, playbackSpeed, setPlaybackSpeed, downloadSong, queue, currentIndex
    } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();

    const playbackModes: Array<{ mode: PlaybackMode; icon: React.ElementType; label: string }> = [
        { mode: 'normal', icon: List, label: 'Normal' },
        { mode: 'shuffle', icon: Shuffle, label: 'Shuffle' },
        { mode: 'smart-shuffle', icon: Sparkles, label: 'Smart Shuffle' },
        { mode: 'radio', icon: Radio, label: '999 Radio' },
    ];

    const cyclePlaybackMode = () => {
        const modes: PlaybackMode[] = ['normal', 'shuffle', 'smart-shuffle', 'radio'];
        const currentIdx = modes.indexOf(playbackMode);
        const nextIdx = (currentIdx + 1) % modes.length;
        setPlaybackMode(modes[nextIdx]);
    };

    const currentModeInfo = playbackModes.find(m => m.mode === playbackMode) || playbackModes[0];
    const ModeIcon = currentModeInfo.icon;

    if (!currentSong) return null;

    const coverUrl = resolveCoverUrl(currentSong.cover_url, currentSong);
    const upcomingCount = queue.length - currentIndex - 1;

    return (
        <div className="h-24 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-4 md:px-6 flex items-center justify-between">
            {/* Song Info */}
            <div className="flex items-center gap-3 w-1/2 md:w-1/4 min-w-0">
                <motion.div
                    layoutId="player-art"
                    onClick={onExpand}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-surface relative group cursor-pointer flex-shrink-0 bespoke-card"
                >
                    {coverUrl ? (
                        <img src={coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white/40" />
                        </div>
                    )}
                </motion.div>
                <div className="overflow-hidden min-w-0">
                    <h4 className="font-black text-xs md:text-sm truncate uppercase italic tracking-tight">{currentSong.title}</h4>
                    <div className="flex items-center gap-2 min-w-0 opacity-60">
                        <p className="text-[10px] md:text-xs truncate font-bold">{currentSong.artist}</p>
                    </div>
                </div>
            </div>

            {/* Controls & Progress */}
            <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4 max-w-2xl px-2 md:px-8 absolute md:relative bottom-16 md:bottom-0 left-0 md:bg-transparent bg-black/40 backdrop-blur-lg md:backdrop-blur-none py-2 md:py-0">
                <div className="flex items-center gap-4 md:gap-8">
                    <button onClick={prevSong} className="text-white/40 hover:text-white transition-all hover:scale-110">
                        <SkipBack className="w-5 h-5 fill-current" />
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePlay}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bespoke-button flex items-center justify-center text-white"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" />}
                    </motion.button>

                    <button onClick={nextSong} className="text-white/40 hover:text-white transition-all hover:scale-110">
                        <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                </div>

                <div className="w-full flex items-center gap-3 px-4">
                    <span className="text-[9px] text-white/30 font-mono w-8 text-right">{formatDuration(currentTime)}</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full relative group cursor-pointer overflow-hidden">
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => seek(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                    </div>
                    <span className="text-[9px] text-white/30 font-mono w-8">{formatDuration(duration)}</span>
                </div>
            </div>

            {/* Utilities */}
            <div className="flex items-center justify-end gap-3 md:gap-5 w-1/4">
                {/* Playback Mode (Mobile Toggle) */}
                <button
                    onClick={cyclePlaybackMode}
                    className={clsx(
                        "p-2 rounded-xl transition-all",
                        playbackMode !== 'normal' ? "text-primary bg-primary/10" : "text-white/20 hover:text-white"
                    )}
                    title={currentModeInfo.label}
                >
                    <ModeIcon className="w-5 h-5" />
                </button>

                {/* Queue Button */}
                <button
                    onClick={onQueueToggle}
                    className={clsx(
                        "relative p-2.5 rounded-xl bespoke-card flex items-center justify-center transition-all",
                        showQueue ? "text-primary border-primary/40 bg-primary/10" : "text-white/30"
                    )}
                >
                    <ListMusic className="w-5 h-5" />
                    {upcomingCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bespoke-button text-[8px] rounded-full flex items-center justify-center">
                            {upcomingCount > 99 ? '99+' : upcomingCount}
                        </span>
                    )}
                </button>

                {/* Volume (Desktop Only) */}
                <div className="hidden md:flex items-center gap-3 group">
                    <button
                        onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                        className="text-white/30 hover:text-white transition-transform hover:scale-110"
                    >
                        {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-24 h-1 bg-white/5 rounded-full relative overflow-hidden">
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute left-0 top-0 h-full bg-white/20 group-hover:bg-primary transition-colors"
                            style={{ width: `${volume * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Mode indicators */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 hidden md:block">
                {playbackMode === 'radio' && (
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">999 Radio Live</span>
                    </div>
                )}
                {playbackMode === 'smart-shuffle' && (
                    <div className="flex items-center gap-2 bg-accent/10 px-3 py-0.5 rounded-full border border-accent/20">
                        <Sparkles className="w-2.5 h-2.5 text-accent" />
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">Smart Shuffle</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Player;
