import React, { useState } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2,
    Download, Share2, Shuffle, List, Radio, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { clsx } from 'clsx';
import type { PlaybackMode } from '../lib/types';

interface PlayerProps {
    onExpand: () => void;
    onProducerClick?: (producer: string) => void;
}

const Player: React.FC<PlayerProps> = ({ onExpand, onProducerClick }) => {
    const {
        currentSong, isPlaying, togglePlay, currentTime, duration, seek, volume, setVolume,
        nextSong, prevSong, playbackMode, setPlaybackMode, downloadSong
    } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();
    const [showVolume, setShowVolume] = useState(false);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-6 flex items-center justify-between z-50">
            {/* Song Info */}
            <div className="flex items-center gap-4 w-1/4 min-w-0">
                <motion.div
                    layoutId="player-art"
                    onClick={onExpand}
                    className="w-14 h-14 rounded-lg overflow-hidden bg-surface relative group cursor-pointer flex-shrink-0"
                >
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={currentSong.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white/40" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                </motion.div>
                <div className="overflow-hidden min-w-0">
                    <h4 className="font-bold text-sm truncate">{currentSong.title}</h4>
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
                        {currentSong.producer && (
                            <>
                                <div className="w-0.5 h-0.5 rounded-full bg-white/20 flex-shrink-0" />
                                <button
                                    onClick={() => onProducerClick?.(currentSong.producer!)}
                                    className="text-[10px] text-primary/60 hover:text-primary truncate uppercase tracking-widest transition-colors cursor-pointer"
                                    title={`View all songs by ${currentSong.producer}`}
                                >
                                    {currentSong.producer}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls & Progress */}
            <div className="flex flex-col items-center gap-2 w-2/4 max-w-2xl px-8">
                <div className="flex items-center gap-6">
                    {/* Playback Mode Toggle */}
                    <button
                        onClick={cyclePlaybackMode}
                        className={clsx(
                            "transition-colors relative group",
                            playbackMode !== 'normal' ? "text-primary" : "text-white/20 hover:text-white"
                        )}
                        title={currentModeInfo.label}
                    >
                        <ModeIcon className="w-4 h-4" />
                        {/* Mode label tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <p className="text-[10px] font-bold uppercase">{currentModeInfo.label}</p>
                        </div>
                    </button>

                    <button onClick={prevSong} className="text-white/40 hover:text-white transition-colors">
                        <SkipBack className="w-5 h-5 fill-current" />
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/5"
                    >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </motion.button>

                    <button onClick={nextSong} className="text-white/40 hover:text-white transition-colors">
                        <SkipForward className="w-5 h-5 fill-current" />
                    </button>

                    {/* Download */}
                    <button
                        onClick={() => downloadSong(currentSong)}
                        className="text-white/20 hover:text-white transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] text-white/40 font-mono w-8">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer overflow-hidden">
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => seek(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute left-0 top-0 h-full bg-primary rounded-full"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-white/40 font-mono w-8">{formatTime(duration)}</span>
                </div>

                {/* Radio indicator */}
                {playbackMode === 'radio' && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">999 Radio Live</span>
                    </div>
                )}

                {playbackMode === 'smart-shuffle' && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-accent/10 px-3 py-0.5 rounded-full border border-accent/20">
                        <Sparkles className="w-2.5 h-2.5 text-accent" />
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">Smart Shuffle</span>
                    </div>
                )}
            </div>

            {/* Utilities */}
            <div className="flex items-center justify-end gap-4 w-1/4">
                <div className="flex items-center gap-2 group relative">
                    <button
                        onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-24 h-1 bg-white/10 rounded-full relative overflow-hidden">
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
                            className="absolute left-0 top-0 h-full bg-white/60 group-hover:bg-primary rounded-full transition-colors"
                            style={{ width: `${volume * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
