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
    const [showSpeedPicker, setShowSpeedPicker] = useState(false);


    const playbackModes: Array<{ mode: PlaybackMode; icon: React.ElementType; label: string }> = [
        { mode: 'normal', icon: List, label: 'Normal' },
        { mode: 'shuffle', icon: Shuffle, label: 'Shuffle' },
        { mode: 'smart-shuffle', icon: Sparkles, label: 'Smart Shuffle' },
        { mode: 'radio', icon: Radio, label: '999 Radio' },
    ];

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

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
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-4 md:px-6 flex items-center justify-between z-50">
            {/* Song Info */}
            <div className="flex items-center gap-3 w-1/4 min-w-0">
                <motion.div
                    layoutId="player-art"
                    onClick={onExpand}
                    className="w-14 h-14 rounded-lg overflow-hidden bg-surface relative group cursor-pointer flex-shrink-0"
                >
                    {coverUrl ? (
                        <img src={coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
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
                                >
                                    {currentSong.producer}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls & Progress */}
            <div className="flex flex-col items-center gap-2 w-2/4 max-w-2xl px-4 md:px-8">
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Playback Mode Toggle */}
                    <button
                        onClick={cyclePlaybackMode}
                        className={clsx(
                            "transition-colors relative group hidden md:block",
                            playbackMode !== 'normal' ? "text-primary" : "text-white/20 hover:text-white"
                        )}
                        title={currentModeInfo.label}
                    >
                        <ModeIcon className="w-4 h-4" />
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
                        className="text-white/20 hover:text-white transition-colors hidden md:block"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] text-white/40 font-mono w-8">{formatDuration(currentTime)}</span>
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
                    <span className="text-[10px] text-white/40 font-mono w-8">{formatDuration(duration)}</span>
                </div>

                {/* Mode indicators */}
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
            <div className="flex items-center justify-end gap-2 md:gap-4 w-1/4">
                {/* Playback Speed */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => setShowSpeedPicker(!showSpeedPicker)}
                        className={clsx(
                            "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black transition-colors border",
                            playbackSpeed !== 1 ? "text-accent border-accent/20 bg-accent/10" : "text-white/30 border-white/5 hover:text-white"
                        )}
                    >
                        <Gauge className="w-3 h-3" />
                        {playbackSpeed}x
                    </button>

                    {showSpeedPicker && (
                        <div className="absolute bottom-full right-0 mb-2 bg-[#121217] border border-white/10 rounded-xl p-1 shadow-2xl shadow-black/50">
                            {speedOptions.map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => { setPlaybackSpeed(speed); setShowSpeedPicker(false); }}
                                    className={clsx(
                                        "block w-full px-4 py-2 text-xs font-bold rounded-lg text-left transition-colors",
                                        playbackSpeed === speed ? "bg-primary text-white" : "text-white/50 hover:bg-white/10"
                                    )}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Queue Button */}
                <button
                    onClick={onQueueToggle}
                    className={clsx(
                        "relative p-2 rounded-lg transition-colors",
                        showQueue ? "text-primary bg-primary/10" : "text-white/30 hover:text-white"
                    )}
                    title="Queue"
                >
                    <ListMusic className="w-5 h-5" />
                    {upcomingCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[8px] font-black rounded-full flex items-center justify-center">
                            {upcomingCount > 99 ? '99+' : upcomingCount}
                        </span>
                    )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 group relative">
                    <button
                        onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-20 h-1 bg-white/10 rounded-full relative overflow-hidden hidden md:block">
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
