import React, { useState } from 'react';
import { Plus, Music2, Trash2, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clsx } from 'clsx';
import type { Song } from '../lib/types';
import { api } from '../lib/api';

const PlaylistsView: React.FC = () => {
    const { playlists, createPlaylist, removeFromPlaylist, playSong, currentSong } = usePlayer();
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    const [playlistSongs, setPlaylistSongs] = useState<Record<string, Song[]>>({});

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName);
            setNewPlaylistName('');
        }
    };

    const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

    // Fetch songs for the selected playlist if needed
    // In a real app, we'd batch fetch by IDs. For now, we'll simulate.
    React.useEffect(() => {
        if (selectedPlaylist) {
            const fetchPlaylistSongs = async () => {
                // This is a simplified fetch. In reality, the API should support batch get by IDs.
                // We'll just fetch all or search for now as a mock since the API might not have batch by ID.
                const { data } = await api.getSongs();
                const filtered = data.filter(s => selectedPlaylist.songIds.includes(s.id));
                setPlaylistSongs(prev => ({ ...prev, [selectedPlaylist.id]: filtered }));
            };
            fetchPlaylistSongs();
        }
    }, [selectedPlaylistId, playlists]);

    return (
        <div className="flex-1 flex overflow-hidden h-full">
            {/* Playlists List */}
            <div className="w-80 border-r border-white/5 p-8 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-xl font-black italic tracking-tighter mb-4">MY COLLECTIONS</h2>
                    <form onSubmit={handleCreate} className="relative group">
                        <input
                            type="text"
                            placeholder="New Playlist Name..."
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-lg">
                            <Plus className="w-4 h-4 text-white" />
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    {playlists.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlaylistId(p.id)}
                            className={clsx(
                                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                                selectedPlaylistId === p.id ? "bg-primary/20 border-primary/20" : "bg-white/5 border-transparent hover:bg-white/10"
                            )}
                        >
                            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-primary">
                                <ListMusic className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate uppercase italic tracking-tighter">{p.name}</h4>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{p.songIds.length} Tracks</p>
                            </div>
                        </button>
                    ))}
                    {playlists.length === 0 && (
                        <div className="py-12 text-center">
                            <Music2 className="w-12 h-12 text-white/5 mx-auto mb-4" />
                            <p className="text-xs font-bold text-white/20 uppercase">No playlists created yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Playlist Contents */}
            <div className="flex-1 p-8 overflow-y-auto pb-32">
                {selectedPlaylist ? (
                    <div>
                        <div className="flex items-end gap-8 mb-12">
                            <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                                <ListMusic className="w-24 h-24 text-white/40" />
                            </div>
                            <div>
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">Private Collection</p>
                                <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4">{selectedPlaylist.name}</h1>
                                <div className="flex items-center gap-4 text-sm font-bold text-white/40 uppercase">
                                    <span>Jarad Anthony Higgins</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{selectedPlaylist.songIds.length} Songs Indexed</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(playlistSongs[selectedPlaylist.id] || []).map((song, idx) => (
                                <div
                                    key={song.id}
                                    onClick={() => playSong(song)}
                                    className={clsx(
                                        "group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/5 border border-transparent",
                                        currentSong?.id === song.id && "bg-primary/10 border-primary/10"
                                    )}
                                >
                                    <div className="w-8 text-center text-xs font-bold text-white/20">{idx + 1}</div>
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                                        <img src={song.cover_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold truncate text-sm">{song.title}</h4>
                                        <p className="text-xs text-white/40 truncate font-medium">{song.artist}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromPlaylist(selectedPlaylist.id, song.id); }}
                                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {selectedPlaylist.songIds.length === 0 && (
                                <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <h3 className="text-xl font-black italic mb-2 uppercase opacity-40">Collection is Empty</h3>
                                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Add tracks from the music library to see them here</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                            <ListMusic className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">SELECTOR ACTIVE</h2>
                        <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Select a playlist from the sidebar to manage tracks</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistsView;
