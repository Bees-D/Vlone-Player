import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { History as HistoryIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDuration } from '../lib/utils';

interface HistoryViewProps {
    onSongClick?: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSongClick }) => {
    const { history, playSong, currentSong } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <HistoryIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter">LISTENING HISTORY</h2>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{history.length} tracks played</p>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                {history.map((song, idx) => {
                    const coverUrl = resolveCoverUrl(song.cover_url, song);
                    const isCurrent = currentSong?.id === song.id;

                    return (
                        <div
                            key={`${song.id}-${idx}`}
                            onClick={() => playSong(song)}
                            className={clsx(
                                "group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 border border-transparent",
                                isCurrent && "bg-primary/10 border-primary/10"
                            )}
                        >
                            <div className="w-8 text-center text-xs font-bold text-white/15">{idx + 1}</div>
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-surface flex-shrink-0 relative">
                                {coverUrl ? (
                                    <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={clsx("font-bold text-sm truncate", isCurrent && "text-primary")}>{song.title}</h4>
                                <p className="text-xs text-white/40 truncate">{song.artist}</p>
                            </div>
                            <div className="text-xs font-mono text-white/20">{formatDuration(song.duration)}</div>
                        </div>
                    );
                })}
                {history.length === 0 && (
                    <div className="text-center py-20">
                        <HistoryIcon className="w-16 h-16 text-white/5 mx-auto mb-4" />
                        <p className="text-white/20 font-black italic uppercase">No Listening History</p>
                        <p className="text-white/10 text-xs mt-2">Play a song to start tracking</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryView;
