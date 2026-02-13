import React from 'react';
import { X, GripVertical, Trash2, ListMusic, Play, Pause, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface QueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, onClose }) => {
    const {
        queue, currentIndex, currentSong, isPlaying,
        playSong, removeFromQueue, clearQueue, playbackMode
    } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();

    const upcomingQueue = queue.slice(currentIndex + 1);
    const previousQueue = queue.slice(0, currentIndex);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-24 w-full md:w-[420px] bg-[#0a0a0c]/95 backdrop-blur-3xl border-l border-white/10 z-40 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <ListMusic className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-black italic text-sm uppercase tracking-tighter">Queue</h3>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    {upcomingQueue.length} upcoming · {queue.length} total
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {queue.length > 1 && (
                                <button
                                    onClick={clearQueue}
                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-400 border border-white/5 hover:border-red-400/30 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Radio Mode Notice */}
                    {playbackMode === 'radio' && (
                        <div className="mx-6 mt-4 flex items-center gap-3 py-3 px-4 bg-primary/10 border border-primary/20 rounded-xl">
                            <Radio className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">999 Radio — Queue is auto-generated</span>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Now Playing */}
                        {currentSong && (
                            <div className="mb-6">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 px-2">Now Playing</p>
                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
                                        {resolveCoverUrl(currentSong.cover_url, currentSong) ? (
                                            <img src={resolveCoverUrl(currentSong.cover_url, currentSong)!} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
                                        )}
                                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                                            {isPlaying ? (
                                                <div className="flex gap-0.5 items-end h-4">
                                                    <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-1 bg-white animate-bounce h-full" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-1 bg-white animate-bounce h-1/2" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            ) : (
                                                <Pause className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black italic text-sm truncate uppercase text-primary">{currentSong.title}</h4>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{currentSong.artist}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upcoming */}
                        {upcomingQueue.length > 0 && (
                            <div className="mb-6">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 px-2">Up Next</p>
                                <div className="space-y-1">
                                    {upcomingQueue.map((song, idx) => {
                                        const actualIndex = currentIndex + 1 + idx;
                                        const coverUrl = resolveCoverUrl(song.cover_url, song);

                                        return (
                                            <div
                                                key={`${song.id}-${actualIndex}`}
                                                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                                                onClick={() => playSong(song)}
                                            >
                                                <div className="w-4 text-center">
                                                    <GripVertical className="w-3 h-3 text-white/10 group-hover:text-white/30" />
                                                </div>
                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    {coverUrl ? (
                                                        <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-xs truncate">{song.title}</h4>
                                                    <p className="text-[10px] text-white/30 truncate">{song.artist}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFromQueue(actualIndex); }}
                                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Previously Played */}
                        {previousQueue.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 px-2">Previously Played</p>
                                <div className="space-y-1 opacity-50">
                                    {previousQueue.map((song, idx) => {
                                        const coverUrl = resolveCoverUrl(song.cover_url, song);
                                        return (
                                            <div
                                                key={`prev-${song.id}-${idx}`}
                                                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                                                onClick={() => playSong(song)}
                                            >
                                                <div className="w-4" />
                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    {coverUrl ? (
                                                        <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full bg-white/5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-xs truncate">{song.title}</h4>
                                                    <p className="text-[10px] text-white/30 truncate">{song.artist}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {queue.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <ListMusic className="w-16 h-16 text-white/5 mb-4" />
                                <p className="text-white/20 font-black italic uppercase text-sm">Queue Empty</p>
                                <p className="text-white/10 text-xs mt-2">Play a song to start your queue</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QueuePanel;
