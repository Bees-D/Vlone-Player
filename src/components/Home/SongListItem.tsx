import React from 'react';
import { Play, Plus, Clock, Disc, Download, Share2, Info } from 'lucide-react';
import type { Song, Playlist } from '../../lib/types';
import { formatDuration } from '../../lib/utils';
import { clsx } from 'clsx';

interface SongListItemProps {
    song: Song;
    index: number;
    currentSong: Song | null;
    isPlaying: boolean;
    playlists: Playlist[];
    resolveCoverUrl: (url: string | undefined, song: Song) => string;
    playSong: (song: Song) => void;
    addToPlaylist: (playlistId: string, songId: string) => void;
    downloadSong: (song: Song) => void;
    handleShareSong: (song: Song, e: React.MouseEvent) => void;
    onProducerClick?: (producer: string) => void;
    onSongClick?: (songId: string) => void;
}

const SongListItem: React.FC<SongListItemProps> = ({
    song, index, currentSong, isPlaying, playlists,
    resolveCoverUrl, playSong, addToPlaylist,
    downloadSong, handleShareSong, onProducerClick, onSongClick
}) => {
    const isCurrent = currentSong?.id === song.id;
    const coverUrl = resolveCoverUrl(song.cover_url, song);

    return (
        <div
            onClick={() => playSong(song)}
            className={clsx(
                "group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                isCurrent ? "bg-primary/20 border border-primary/20 shadow-lg" : "hover:bg-white/5 border border-transparent"
            )}
        >
            <div className="w-12 text-center text-lg font-black italic text-white/10 group-hover:text-primary transition-colors">{index + 1}</div>
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface flex-shrink-0 relative shadow-xl shadow-black/40">
                {coverUrl ? (
                    <img src={coverUrl} className="w-full h-full object-cover" alt={song.title} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Disc className="w-6 h-6 text-white/20" />
                    </div>
                )}
                {isCurrent && isPlaying && (
                    <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex gap-1 items-end h-6">
                            <div className="w-1.5 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 bg-white animate-bounce h-full" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 bg-white animate-bounce h-1/2" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={clsx("font-black tracking-tighter truncate text-base uppercase italic", isCurrent ? "text-primary" : "text-white")}>{song.title}</h4>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-white/40 truncate font-black uppercase tracking-widest">{song.artist}</p>
                    {song.producer && (
                        <>
                            <span className="text-white/10">·</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onProducerClick?.(song.producer!); }}
                                className="text-[10px] text-accent/60 hover:text-accent font-bold uppercase tracking-widest transition-colors"
                                title={`Filter by producer: ${song.producer}`}
                            >
                                {song.producer}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <Disc className="w-3 h-3 text-white/20" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{song.era || 'Raw Tape'}</span>
            </div>
            <div className="text-xs font-mono text-white/40 w-12 text-right">{formatDuration(song.duration)}</div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                    onClick={(e) => { e.stopPropagation(); downloadSong(song); }}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                    title="Download"
                >
                    <Download className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => handleShareSong(song, e)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                    title="Share"
                >
                    <Share2 className="w-4 h-4" />
                </button>
                {onSongClick && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSongClick(song.id); }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                        title="Details"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (playlists.length > 0) {
                            addToPlaylist(playlists[0].id, song.id);
                        }
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                    title="Add to playlist"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SongListItem;
