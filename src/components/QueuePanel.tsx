import React from 'react';
import { X, GripVertical, Trash2, ListMusic, Play, Pause, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface QueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
    isSidebar?: boolean;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, onClose, isSidebar }) => {
    const {
        queue, currentIndex, currentSong, isPlaying,
        playSong, removeFromQueue, clearQueue, playbackMode
    } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();

    const upcomingQueue = queue.slice(currentIndex + 1);
    const previousQueue = queue.slice(0, currentIndex);

    const content = (
        <div className={clsx(
            "h-full flex flex-col bg-black/40 backdrop-blur-3xl",
            isSidebar ? "w-full" : "fixed right-0 top-0 bottom-24 w-full md:w-[420px] border-l border-white/10 z-[60]"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bespoke-button flex items-center justify-center">
                        <ListMusic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="heading-bespoke text-sm tracking-tighter">Queue</h3>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            {upcomingQueue.length} upcoming
                        </p>
                    </div>
                </div>
                {!isSidebar && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Now Playing */}
                {currentSong && (
                    <div className="mb-8">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 px-2">Now Playing</p>
                        <div className="bespoke-card p-4 flex items-center gap-4 bg-primary/5 border-primary/20">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-2xl">
                                {resolveCoverUrl(currentSong.cover_url, currentSong) ? (
                                    <img src={resolveCoverUrl(currentSong.cover_url, currentSong)!} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
                                )}
                                {isPlaying && (
                                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="flex gap-1 items-end h-4">
                                            <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1 bg-white animate-bounce h-full" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1 bg-white animate-bounce h-1/2" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black italic text-sm truncate uppercase text-primary tracking-tight">{currentSong.title}</h4>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{currentSong.artist}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upcoming */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Up Next</p>
                        {queue.length > 1 && (
                            <button onClick={clearQueue} className="text-[9px] font-bold uppercase text-red-500/50 hover:text-red-500 transition-colors">
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="space-y-1">
                        {upcomingQueue.map((song, idx) => {
                            const actualIndex = currentIndex + 1 + idx;
                            return (
                                <div
                                    key={`${song.id}-${actualIndex}`}
                                    className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
                                    onClick={() => playSong(song)}
                                >
                                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bespoke-card">
                                        {resolveCoverUrl(song.cover_url, song) ? (
                                            <img src={resolveCoverUrl(song.cover_url, song)!} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs truncate uppercase tracking-tight">{song.title}</h4>
                                        <p className="text-[10px] text-white/30 truncate font-medium">{song.artist}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromQueue(actualIndex); }}
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {queue.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-20">
                        <ListMusic className="w-12 h-12 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Queue Empty</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (isSidebar) return content;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed inset-0 z-[100] md:inset-auto md:right-0 md:top-0 md:bottom-24 md:w-[420px]"
                >
                    {content}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QueuePanel;
