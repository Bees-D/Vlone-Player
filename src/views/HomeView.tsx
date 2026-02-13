import React, { useEffect, useState } from 'react';
import { Search, Play, Plus, Clock, MoreHorizontal, Radio, Disc, Download, Share2, User } from 'lucide-react';
import { api } from '../lib/api';
import type { Song, Category, Era } from '../lib/types';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { downloadFile, generateShareUrl } from '../lib/utils';
import { clsx } from 'clsx';

interface HomeViewProps {
    producerFilter?: string | null;
    onProducerClick?: (producer: string) => void;
    onClearProducer?: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ producerFilter, onProducerClick, onClearProducer }) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [eras, setEras] = useState<Era[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { playSong, currentSong, isPlaying, playlists, addToPlaylist, setPlaybackMode, downloadSong } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();

    useEffect(() => {
        const fetchData = async () => {
            const [{ data }, cats, eraData] = await Promise.all([
                api.getSongs({
                    search,
                    category: selectedCategory || undefined,
                    producer: producerFilter || undefined
                }),
                api.getCategories(),
                api.getEras()
            ]);
            setSongs(data);
            setCategories(cats);
            setEras(eraData);
        };
        fetchData();
    }, [search, selectedCategory, producerFilter]);

    const formatDuration = (seconds: number) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleShareSong = (song: Song, e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = generateShareUrl('song', {
            songs: [{ id: song.id, title: song.title, artist: song.artist, file_path: song.file_path }]
        });
        navigator.clipboard.writeText(shareUrl);
        // Could add a toast notification here
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 pb-32">
            {/* Producer Filter Banner */}
            {producerFilter && (
                <div className="mb-8 bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Filtering by Producer</p>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">{producerFilter}</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClearProducer}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors"
                    >
                        Clear Filter
                    </button>
                </div>
            )}

            {/* Header / Search */}
            <div className="flex items-center justify-between mb-12">
                <div className="relative w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search 2,742+ tracks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={clsx("px-4 py-2 rounded-lg text-xs font-bold transition-all", !selectedCategory ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white")}
                        >
                            All
                        </button>
                        {categories.slice(0, 4).map(cat => (
                            <button
                                key={cat.slug}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={clsx("px-4 py-2 rounded-lg text-xs font-bold transition-all", selectedCategory === cat.name ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white")}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured / Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="col-span-1 md:col-span-2 relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
                    <img
                        src="https://juicewrldapi.com/icons/og-image.png"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Juice WRLD"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Verified Vault</span>
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">999 Era</span>
                        </div>
                        <h2 className="text-5xl font-black italic tracking-tighter mb-2">UNRELEASED VAULT</h2>
                        <p className="text-white/60 font-semibold max-w-md">Access the complete archive of over 2,700 Juice WRLD tracks, leaked sessions, and high-quality masters.</p>
                        <button
                            onClick={() => { if (songs.length > 0) playSong(songs[0], songs); }}
                            className="mt-6 bg-white text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 self-start hover:scale-105 transition-transform active:scale-95"
                        >
                            <Play className="w-5 h-5 fill-current" /> STREAM NOW
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary/40 to-accent/40 rounded-3xl p-10 flex flex-col justify-center border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Radio className="w-32 h-32" />
                    </div>
                    <h3 className="text-3xl font-black italic mb-4">999 RADIO</h3>
                    <p className="text-white/80 font-medium mb-8">Non-stop shuffle of every track in the database. Discover something new.</p>
                    <button
                        onClick={() => setPlaybackMode('radio')}
                        className="w-full bg-black/40 backdrop-blur-md border border-white/10 font-bold py-4 rounded-2xl hover:bg-black/60 transition-colors"
                    >
                        START RADIO
                    </button>
                </div>
            </div>

            {/* Eras / Albums Grid */}
            <div className="mb-16">
                <h3 className="text-xl font-black mb-8 flex items-center gap-4">
                    <Disc className="text-accent w-6 h-6 animate-spin-slow" />
                    BROWSE BY ERA
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {eras.map((era) => (
                        <div
                            key={era.name}
                            onClick={() => setSearch(era.name)}
                            className="bg-white/5 border border-white/5 rounded-3xl p-4 cursor-pointer hover:bg-white/10 hover:-translate-y-2 transition-all group"
                        >
                            <div className="aspect-square rounded-2xl overflow-hidden bg-surface mb-4">
                                <img
                                    src={era.image || `https://juicewrldapi.com/icons/og-image.png`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    alt={era.name}
                                />
                            </div>
                            <h4 className="font-black italic text-xs uppercase truncate tracking-tighter">{era.name}</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase mt-1">{era.year || '999'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Song List */}
            <div>
                <h3 className="text-xl font-black mb-8 flex items-center gap-4">
                    <Clock className="text-primary w-6 h-6" />
                    {producerFilter ? `PRODUCED BY ${producerFilter.toUpperCase()}` : 'RECENTLY ADDED'}
                </h3>

                <div className="space-y-2">
                    {songs.map((song, idx) => {
                        const coverUrl = resolveCoverUrl(song.cover_url, song);

                        return (
                            <div
                                key={song.id}
                                onClick={() => playSong(song, songs)}
                                className={clsx(
                                    "group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                                    currentSong?.id === song.id ? "bg-primary/20 border border-primary/20 shadow-lg shadow-primary/5" : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="w-12 text-center text-lg font-black italic text-white/10 group-hover:text-primary transition-colors">{idx + 1}</div>
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface flex-shrink-0 relative shadow-xl shadow-black/40">
                                    {coverUrl ? (
                                        <img src={coverUrl} className="w-full h-full object-cover" alt={song.title} />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                            <Disc className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                    {currentSong?.id === song.id && isPlaying && (
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
                                    <h4 className={clsx("font-black tracking-tighter truncate text-base uppercase italic", currentSong?.id === song.id ? "text-primary" : "text-white")}>{song.title}</h4>
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
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default HomeView;
