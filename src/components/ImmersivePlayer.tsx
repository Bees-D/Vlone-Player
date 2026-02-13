import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronDown, Share2, MoreHorizontal, SkipBack, SkipForward, Play, Pause,
    Shuffle, List, Radio, Sparkles, ListMusic, Mic, Headphones, Disc, Languages, Download
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { generateShareUrl } from '../lib/utils';
import { clsx } from 'clsx';
import { api } from '../lib/api';
import type { PlaybackMode } from '../lib/types';

interface ImmersivePlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImmersivePlayer: React.FC<ImmersivePlayerProps> = ({ isOpen, onClose }) => {
    const {
        currentSong, isPlaying, togglePlay, currentTime, duration, seek,
        nextSong, prevSong, playbackMode, setPlaybackMode, downloadSong
    } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();
    const [showLyrics, setShowLyrics] = useState(false);
    const [lyrics, setLyrics] = useState<string>('');

    useEffect(() => {
        if (currentSong && showLyrics) {
            const fetchLyrics = async () => {
                const text = await api.getLyrics(currentSong.id);
                setLyrics(text);
            };
            fetchLyrics();
        }
    }, [currentSong, showLyrics]);

    if (!currentSong) return null;

    const coverUrl = resolveCoverUrl(currentSong.cover_url, currentSong);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const cyclePlaybackMode = () => {
        const modes: PlaybackMode[] = ['normal', 'shuffle', 'smart-shuffle', 'radio'];
        const currentIdx = modes.indexOf(playbackMode);
        const nextIdx = (currentIdx + 1) % modes.length;
        setPlaybackMode(modes[nextIdx]);
    };

    const modeIcons: Record<PlaybackMode, React.ElementType> = {
        'normal': List,
        'shuffle': Shuffle,
        'smart-shuffle': Sparkles,
        'radio': Radio,
    };
    const modeLabels: Record<PlaybackMode, string> = {
        'normal': 'Normal',
        'shuffle': 'Shuffle',
        'smart-shuffle': 'Smart Shuffle',
        'radio': '999 Radio',
    };

    const ModeIcon = modeIcons[playbackMode];

    const handleShare = () => {
        const shareUrl = generateShareUrl('song', {
            songs: [{ id: currentSong.id, title: currentSong.title, artist: currentSong.artist, file_path: currentSong.file_path }]
        });
        navigator.clipboard.writeText(shareUrl);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-black overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-40 blur-[120px] bg-gradient-to-br from-primary via-accent to-purple-900 animate-pulse" />
                        {coverUrl && (
                            <img
                                src={coverUrl}
                                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-150"
                                alt=""
                            />
                        )}
                    </div>

                    <div className="relative h-full flex flex-col p-6 md:p-16">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 md:mb-12">
                            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                                <ChevronDown className="w-6 md:w-8 h-6 md:h-8" />
                            </button>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Now Indexing</p>
                                <h3 className="text-sm font-bold uppercase tracking-widest italic">{currentSong.title}</h3>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <button
                                    onClick={() => setShowLyrics(!showLyrics)}
                                    className={clsx("p-3 rounded-full transition-colors", showLyrics ? "bg-primary text-white" : "hover:bg-white/10 text-white/40")}
                                >
                                    <Languages className="w-6 md:w-8 h-6 md:h-8" />
                                </button>
                                <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
                                    <MoreHorizontal className="w-6 md:w-8 h-6 md:h-8" />
                                </button>
                            </div>
                        </div>

                        {/* Lyrics Overlay */}
                        <AnimatePresence>
                            {showLyrics && (
                                <motion.div
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 100 }}
                                    className="absolute inset-x-4 md:inset-x-8 top-32 md:top-40 bottom-32 md:bottom-40 z-50 bg-black/40 backdrop-blur-3xl rounded-3xl md:rounded-[40px] border border-white/10 p-8 md:p-12 overflow-y-auto"
                                >
                                    <div className="max-w-3xl mx-auto space-y-8">
                                        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-primary">SCANNED LYRICS</h2>
                                        <div className="text-xl md:text-3xl font-bold leading-relaxed text-white whitespace-pre-wrap">
                                            {lyrics || "Decrypting metadata..."}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 max-w-7xl mx-auto w-full overflow-hidden">
                            {/* Artwork */}
                            <motion.div
                                layoutId="player-art"
                                className="w-full max-w-[280px] md:max-w-[500px] aspect-square rounded-3xl md:rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 group relative flex-shrink-0"
                            >
                                {coverUrl ? (
                                    <img
                                        src={coverUrl}
                                        className="w-full h-full object-cover"
                                        alt={currentSong.title}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                        <Disc className="w-20 h-20 text-white/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                    <p className="text-sm font-bold text-white/60">Source: Legacy Archive</p>
                                </div>
                            </motion.div>

                            {/* Info & Controls */}
                            <div className="flex-1 w-full max-w-xl space-y-8 md:space-y-12">
                                <div className="space-y-3 md:space-y-4">
                                    <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-none truncate">{currentSong.title}</h1>
                                    <div className="flex items-center gap-4">
                                        <p className="text-xl md:text-2xl font-bold text-primary italic">{currentSong.artist}</p>
                                        <div className="h-1 w-1 rounded-full bg-white/20" />
                                        <p className="text-sm md:text-lg font-bold text-white/40 uppercase tracking-widest">{currentSong.era || 'Raw Session'}</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-4">
                                    <div className="h-2 bg-white/5 rounded-full relative group cursor-pointer overflow-hidden">
                                        <input
                                            type="range"
                                            min={0}
                                            max={duration || 0}
                                            value={currentTime}
                                            onChange={(e) => seek(parseFloat(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <motion.div
                                            className="absolute left-0 top-0 h-full bg-white rounded-full"
                                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm font-mono font-bold text-white/20">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={cyclePlaybackMode}
                                        className={clsx(
                                            "p-4 rounded-2xl transition-all group relative",
                                            playbackMode !== 'normal' ? "text-primary bg-primary/10" : "text-white/20 hover:text-white"
                                        )}
                                        title={modeLabels[playbackMode]}
                                    >
                                        <ModeIcon className="w-6 md:w-8 h-6 md:h-8" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            <p className="text-[10px] font-bold uppercase">{modeLabels[playbackMode]}</p>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-6 md:gap-8">
                                        <button onClick={prevSong} className="text-white/40 hover:text-white hover:scale-110 transition-all p-2">
                                            <SkipBack className="w-8 md:w-12 h-8 md:h-12 fill-current" />
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={togglePlay}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-3xl md:rounded-[40px] bg-white text-black flex items-center justify-center shadow-2xl shadow-white/10"
                                        >
                                            {isPlaying ? <Pause className="w-10 md:w-12 h-10 md:h-12" /> : <Play className="w-10 md:w-12 h-10 md:h-12 ml-2" />}
                                        </motion.button>
                                        <button onClick={nextSong} className="text-white/40 hover:text-white hover:scale-110 transition-all p-2">
                                            <SkipForward className="w-8 md:w-12 h-8 md:h-12 fill-current" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => downloadSong(currentSong)}
                                        className="p-4 rounded-2xl text-white/20 hover:text-white transition-all"
                                        title="Download"
                                    >
                                        <Download className="w-6 md:w-8 h-6 md:h-8" />
                                    </button>
                                </div>

                                {/* Radio Mode Indicator */}
                                {playbackMode === 'radio' && (
                                    <div className="flex items-center justify-center gap-3 py-3 bg-primary/10 border border-primary/20 rounded-2xl">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">999 Radio — Continuous Discovery</span>
                                    </div>
                                )}

                                {/* Bottom Utils - hidden on small screens */}
                                <div className="hidden md:grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-white/40">
                                            <Mic className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Producer</span>
                                        </div>
                                        <p className="text-sm font-bold text-white">
                                            {currentSong.producer || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-white/40">
                                            <Headphones className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Engineer</span>
                                        </div>
                                        <p className="text-sm font-bold text-white">
                                            {currentSong.engineer || 'Max Lord'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 md:pt-8 border-t border-white/5">
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-3 text-white/40 hover:text-white transition-colors"
                                    >
                                        <Share2 className="w-5 md:w-6 h-5 md:h-6" />
                                        <span className="text-xs font-black uppercase tracking-widest">Share</span>
                                    </button>
                                    <button className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
                                        <ListMusic className="w-5 md:w-6 h-5 md:h-6" />
                                        <span className="text-xs font-black uppercase tracking-widest">Queue</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImmersivePlayer;
