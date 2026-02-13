import React, { useState, useEffect } from 'react';
import {
    Play, Pause, Download, Share2, Plus, Clock, Disc, User, Music, Tag,
    ChevronLeft, Heart, Calendar, FileAudio, Headphones
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { api } from '../lib/api';
import { clsx } from 'clsx';
import { formatDuration } from '../lib/utils';
import type { Song } from '../lib/types';

interface SongDetailViewProps {
    songId: string;
    onBack: () => void;
    onProducerClick?: (producer: string) => void;
}

const SongDetailView: React.FC<SongDetailViewProps> = ({ songId, onBack, onProducerClick }) => {
    const [song, setSong] = useState<Song | null>(null);
    const [lyrics, setLyrics] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const {
        playSong, currentSong, isPlaying, downloadSong,
        playlists, addToPlaylist
    } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();
    const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [songData, lyricsData] = await Promise.all([
                    api.getSongById(songId),
                    api.getLyrics(songId)
                ]);
                setSong(songData);
                setLyrics(lyricsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [songId]);

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/20 font-bold text-xs uppercase tracking-widest">Loading Track Data...</p>
                </div>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center text-center">
                <Music className="w-16 h-16 text-white/5 mb-4" />
                <p className="text-white/20 font-black italic uppercase">Track Not Found</p>
                <button onClick={onBack} className="mt-4 text-primary font-bold text-sm">Go Back</button>
            </div>
        );
    }

    const coverUrl = resolveCoverUrl(song.cover_url, song);
    const isCurrent = currentSong?.id === song.id;


    const metadata = [
        { label: 'Artist', value: song.artist, icon: User },
        { label: 'Album / Era', value: song.album || song.era || 'Unknown', icon: Disc },
        { label: 'Duration', value: formatDuration(song.duration), icon: Clock },
        { label: 'Producer', value: song.producer || 'Unknown', icon: Headphones, clickable: !!song.producer },
        { label: 'Category', value: song.category || 'Uncategorized', icon: Tag },
        { label: 'File', value: song.file_path?.split('/').pop() || 'Unknown', icon: FileAudio },
    ];

    return (
        <div className="flex-1 overflow-y-auto pb-32">
            {/* Back Button */}
            <div className="p-6">
                <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* Hero Section */}
            <div className="px-6 md:px-12 pb-8">
                <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Cover Art */}
                    <div className="w-60 h-60 md:w-72 md:h-72 rounded-3xl overflow-hidden bg-surface shadow-2xl shadow-black/50 flex-shrink-0 relative group">
                        {coverUrl ? (
                            <img src={coverUrl} className="w-full h-full object-cover" alt={song.title} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                <Disc className="w-20 h-20 text-white/10" />
                            </div>
                        )}
                        {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                <div className="flex gap-1.5 items-end h-10">
                                    <div className="w-2 bg-white animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 bg-white animate-bounce h-full rounded-full" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 bg-white animate-bounce h-1/2 rounded-full" style={{ animationDelay: '300ms' }} />
                                    <div className="w-2 bg-white animate-bounce h-3/4 rounded-full" style={{ animationDelay: '75ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                            {song.category || 'Track'}
                        </p>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-3 leading-none">
                            {song.title}
                        </h1>
                        <div className="flex items-center gap-3 text-white/40 mb-6">
                            <span className="font-bold text-lg">{song.artist}</span>
                            {song.producer && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <button
                                        onClick={() => onProducerClick?.(song.producer!)}
                                        className="text-accent/60 hover:text-accent font-bold transition-colors"
                                    >
                                        Prod. {song.producer}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => playSong(song)}
                                className="bg-white text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
                            >
                                {isCurrent && isPlaying ? (
                                    <><Pause className="w-5 h-5" /> Pause</>
                                ) : (
                                    <><Play className="w-5 h-5 fill-current" /> Play</>
                                )}
                            </button>
                            <button
                                onClick={() => downloadSong(song)}
                                className="p-4 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:border-white/20 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    const shareData = { id: song.id, title: song.title, artist: song.artist };
                                    navigator.clipboard.writeText(JSON.stringify(shareData));
                                }}
                                className="p-4 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:border-white/20 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowPlaylistPicker(!showPlaylistPicker)}
                                    className="p-4 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:border-white/20 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                {showPlaylistPicker && (
                                    <div className="absolute left-0 bottom-full mb-2 bg-[#1a1a1f] border border-white/10 rounded-xl p-1 shadow-2xl min-w-[200px] z-10">
                                        <p className="px-3 py-2 text-[10px] font-black text-white/30 uppercase tracking-widest">Add to Playlist</p>
                                        {playlists.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => { addToPlaylist(p.id, song.id); setShowPlaylistPicker(false); }}
                                                className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                        {playlists.length === 0 && (
                                            <p className="px-3 py-2 text-xs text-white/20">No playlists yet</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metadata Grid */}
            <div className="px-6 md:px-12 mb-8">
                <h3 className="text-sm font-black italic uppercase tracking-tighter mb-4 text-white/40">Track Metadata</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {metadata.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => item.clickable && item.label === 'Producer' && onProducerClick?.(item.value)}
                            className={clsx(
                                "bg-[#121217] border border-white/5 rounded-xl p-4 transition-all",
                                item.clickable && "cursor-pointer hover:border-accent/20 hover:bg-accent/5"
                            )}
                        >
                            <item.icon className="w-4 h-4 text-white/20 mb-2" />
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-sm font-bold truncate">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lyrics Section */}
            <div className="px-6 md:px-12">
                <h3 className="text-sm font-black italic uppercase tracking-tighter mb-4 text-white/40">Lyrics</h3>
                <div className="bg-[#121217] border border-white/5 rounded-2xl p-6 md:p-8">
                    <div className="text-white/70 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                        {lyrics || 'Lyrics not available for this track.'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SongDetailView;
