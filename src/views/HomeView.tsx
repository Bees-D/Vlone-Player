import React, { useEffect, useState } from 'react';
import { Search, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { Song, Category, Era } from '../lib/types';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { generateShareUrl } from '../lib/utils';
import { useApiStatus } from '../hooks/useApiStatus';
import { clsx } from 'clsx';

// Sub-components
import HeroSection from '../components/Home/HeroSection';
import EraDiscovery from '../components/Home/EraDiscovery';
import SongListItem from '../components/Home/SongListItem';

interface HomeViewProps {
    producerFilter?: string | null;
    onProducerClick?: (producer: string) => void;
    onClearProducer?: () => void;
    onSongClick?: (songId: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ producerFilter, onProducerClick, onClearProducer, onSongClick }) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [eras, setEras] = useState<Era[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { stats } = useApiStatus();
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

    const handleShareSong = (song: Song, e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = generateShareUrl('song', {
            songs: [{ id: song.id, title: song.title, artist: song.artist, file_path: song.file_path }]
        });
        navigator.clipboard.writeText(shareUrl);
    };

    return (
        <div className="p-8 pb-12">
            {/* Producer Filter Banner */}
            {producerFilter && (
                <div className="mb-8 bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                            <Search className="w-6 h-6 text-accent" />
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
                        placeholder={stats?.total_songs ? `Search ${stats.total_songs.toLocaleString()}+ tracks...` : "Search tracks..."}
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
            <HeroSection
                songs={songs}
                playSong={playSong}
                setPlaybackMode={setPlaybackMode}
            />

            {/* Eras / Albums Grid */}
            <EraDiscovery
                eras={eras}
                onEraClick={(eraName) => setSearch(eraName)}
            />

            {/* Song List */}
            <div>
                <h3 className="text-xl font-black mb-8 flex items-center gap-4">
                    <Clock className="text-primary w-6 h-6" />
                    {producerFilter ? `PRODUCED BY ${producerFilter.toUpperCase()}` : 'RECENTLY ADDED'}
                </h3>

                <div className="space-y-2">
                    {songs.map((song, idx) => (
                        <SongListItem
                            key={song.id}
                            song={song}
                            index={idx}
                            currentSong={currentSong}
                            isPlaying={isPlaying}
                            playlists={playlists}
                            resolveCoverUrl={resolveCoverUrl}
                            playSong={(s) => playSong(s, songs)}
                            addToPlaylist={addToPlaylist}
                            downloadSong={downloadSong}
                            handleShareSong={handleShareSong}
                            onProducerClick={onProducerClick}
                            onSongClick={onSongClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeView;
