import React, { useState, useRef } from 'react';
import { Plus, Music2, Trash2, ListMusic, Play, Edit3, Download, Upload, MoreHorizontal, X, Share2, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { clsx } from 'clsx';
import type { Song } from '../lib/types';
import { api } from '../lib/api';

const PlaylistsView: React.FC = () => {
    const {
        playlists, createPlaylist, removeFromPlaylist, deletePlaylist, renamePlaylist,
        playSong, currentSong, isPlaying, addToPlaylist
    } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    const [playlistSongs, setPlaylistSongs] = useState<Record<string, Song[]>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName);
            setNewPlaylistName('');
        }
    };

    const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

    React.useEffect(() => {
        if (selectedPlaylist) {
            const fetchPlaylistSongs = async () => {
                const { data } = await api.getSongs();
                const filtered = data.filter(s => selectedPlaylist.songIds.includes(s.id));
                setPlaylistSongs(prev => ({ ...prev, [selectedPlaylist.id]: filtered }));
            };
            fetchPlaylistSongs();
        }
    }, [selectedPlaylistId, playlists]);

    const handleStartRename = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
        setShowMenu(null);
    };

    const handleConfirmRename = (id: string) => {
        if (editName.trim()) {
            renamePlaylist(id, editName.trim());
        }
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this playlist? This cannot be undone.')) {
            deletePlaylist(id);
            if (selectedPlaylistId === id) setSelectedPlaylistId(null);
        }
        setShowMenu(null);
    };

    const handleExport = (playlistId: string) => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const songs = playlistSongs[playlistId] || [];
        const exportData = {
            version: '1.0',
            name: playlist.name,
            songs: songs.map(s => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                file_path: s.file_path,
            })),
            songIds: playlist.songIds
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${playlist.name.replace(/\s+/g, '_')}.vlone.json`;
        link.click();
        URL.revokeObjectURL(url);
        setShowMenu(null);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                if (data.name && data.songIds) {
                    createPlaylist(data.name);
                    // After creating, find the new playlist and add songs
                    // This is a simplified approach - uses songIds directly
                    setTimeout(() => {
                        const newPlaylist = playlists.find(p => p.name === data.name);
                        if (newPlaylist) {
                            data.songIds.forEach((id: string) => addToPlaylist(newPlaylist.id, id));
                        }
                    }, 100);
                }
            } catch (err) {
                console.error('Failed to import playlist:', err);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handlePlayAll = () => {
        if (!selectedPlaylist) return;
        const songs = playlistSongs[selectedPlaylist.id] || [];
        if (songs.length > 0) {
            playSong(songs[0], songs);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden h-full">
            {/* Playlists List */}
            <div className="w-72 md:w-80 border-r border-white/5 p-6 overflow-y-auto flex flex-col">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black italic tracking-tighter">MY COLLECTIONS</h2>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors"
                            title="Import Playlist"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.vlone.json"
                        onChange={handleImport}
                        className="hidden"
                    />
                    <form onSubmit={handleCreate} className="relative group">
                        <input
                            type="text"
                            placeholder="New Playlist Name..."
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors">
                            <Plus className="w-4 h-4 text-white" />
                        </button>
                    </form>
                </div>

                <div className="space-y-2 flex-1">
                    {playlists.map(p => (
                        <div key={p.id} className="relative group">
                            <button
                                onClick={() => setSelectedPlaylistId(p.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    selectedPlaylistId === p.id ? "bg-primary/20 border-primary/20" : "bg-white/5 border-transparent hover:bg-white/10"
                                )}
                            >
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary flex-shrink-0">
                                    <ListMusic className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {editingId === p.id ? (
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={() => handleConfirmRename(p.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename(p.id)}
                                            className="bg-transparent border-b border-primary outline-none text-sm font-bold w-full"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <h4 className="font-bold text-sm truncate uppercase italic tracking-tighter">{p.name}</h4>
                                    )}
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{p.songIds.length} Tracks</p>
                                </div>
                            </button>

                            {/* Context Menu Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === p.id ? null : p.id); }}
                                className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                            >
                                <MoreHorizontal className="w-4 h-4 text-white/40" />
                            </button>

                            {/* Context Menu */}
                            {showMenu === p.id && (
                                <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1a1f] border border-white/10 rounded-xl p-1 shadow-2xl shadow-black/50 min-w-[160px]">
                                    <button
                                        onClick={() => handleStartRename(p.id, p.name)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Rename
                                    </button>
                                    <button
                                        onClick={() => handleExport(p.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Export
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
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
            <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
                {selectedPlaylist ? (
                    <div>
                        <div className="flex items-end gap-6 mb-10">
                            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl flex-shrink-0">
                                <ListMusic className="w-20 h-20 text-white/40" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">Private Collection</p>
                                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-3 truncate">{selectedPlaylist.name}</h1>
                                <div className="flex items-center gap-4 text-sm font-bold text-white/40 uppercase mb-4">
                                    <span>Jarad Anthony Higgins</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{selectedPlaylist.songIds.length} Songs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handlePlayAll}
                                        className="bg-white text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 text-sm"
                                    >
                                        <Play className="w-4 h-4 fill-current" /> Play All
                                    </button>
                                    <button
                                        onClick={() => handleExport(selectedPlaylist.id)}
                                        className="px-4 py-3 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-colors text-sm font-bold"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const songs = playlistSongs[selectedPlaylist.id] || [];
                                            const shareData = {
                                                name: selectedPlaylist.name,
                                                songs: songs.map(s => ({ id: s.id, title: s.title, artist: s.artist }))
                                            };
                                            navigator.clipboard.writeText(JSON.stringify(shareData));
                                        }}
                                        className="px-4 py-3 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-colors text-sm font-bold"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {(playlistSongs[selectedPlaylist.id] || []).map((song, idx) => {
                                const coverUrl = resolveCoverUrl(song.cover_url, song);
                                const isCurrent = currentSong?.id === song.id;

                                return (
                                    <div
                                        key={song.id}
                                        onClick={() => playSong(song, playlistSongs[selectedPlaylist.id] || [])}
                                        className={clsx(
                                            "group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/5 border border-transparent",
                                            isCurrent && "bg-primary/10 border-primary/10"
                                        )}
                                    >
                                        <div className="w-8 text-center text-xs font-bold text-white/20">{idx + 1}</div>
                                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-surface flex-shrink-0 relative">
                                            {coverUrl ? (
                                                <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                                            )}
                                            {isCurrent && isPlaying && (
                                                <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                                                    <div className="flex gap-0.5 items-end h-4">
                                                        <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-1 bg-white animate-bounce h-full" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-1 bg-white animate-bounce h-1/2" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={clsx("font-bold truncate text-sm", isCurrent && "text-primary")}>{song.title}</h4>
                                            <p className="text-xs text-white/40 truncate font-medium">{song.artist}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFromPlaylist(selectedPlaylist.id, song.id); }}
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                            {selectedPlaylist.songIds.length === 0 && (
                                <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <h3 className="text-xl font-black italic mb-2 uppercase opacity-40">Collection is Empty</h3>
                                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Add tracks from the music library</p>
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
