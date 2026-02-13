import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import ImmersivePlayer from './components/ImmersivePlayer';
import QueuePanel from './components/QueuePanel';
import HomeView from './views/HomeView';
import FileExplorerView from './views/FileExplorerView';
import PlaylistsView from './views/PlaylistsView';
import CoversView from './views/CoversView';
import SongDetailView from './views/SongDetailView';
import LocalVaultView from './views/LocalVaultView';
import { usePlayer } from './context/PlayerContext';
import { useApiStatus } from './hooks/useApiStatus';
import {
    Languages, X, Activity, Music, Users, Clock, Menu, Keyboard, History,
    ListMusic, Disc, Signal, WifiOff, Settings as SettingsIcon, Palette
} from 'lucide-react';
import { clsx } from 'clsx';
import { api } from './lib/api';
import { formatDuration } from './lib/utils';
import type { Era } from './lib/types';

const MainLayout: React.FC = () => {
    const [activeView, setActiveView] = useState('home');
    const [showLyrics, setShowLyrics] = useState(false);
    const [showImmersive, setShowImmersive] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [lyrics, setLyrics] = useState<string>('');
    const [producerFilter, setProducerFilter] = useState<string | null>(null);
    const [songDetailId, setSongDetailId] = useState<string | null>(null);
    const { currentSong, history } = usePlayer();

    useEffect(() => {
        if (currentSong) {
            const fetchLyrics = async () => {
                const text = await api.getLyrics(currentSong.id);
                setLyrics(text);
            };
            fetchLyrics();
        }
    }, [currentSong]);

    const handleSetActiveView = (view: string) => {
        setActiveView(view);
        setShowMobileSidebar(false);
        setSongDetailId(null); // Clear song detail when navigating
    };

    const handleProducerClick = (producer: string) => {
        setProducerFilter(producer);
        setSongDetailId(null);
        setActiveView('home');
    };

    const handleSongClick = (songId: string) => {
        setSongDetailId(songId);
    };

    const renderView = () => {
        // Song detail takes priority
        if (songDetailId) {
            return (
                <SongDetailView
                    songId={songDetailId}
                    onBack={() => setSongDetailId(null)}
                    onProducerClick={handleProducerClick}
                />
            );
        }

        switch (activeView) {
            case 'home':
            case 'library':
                return (
                    <HomeView
                        producerFilter={producerFilter}
                        onProducerClick={handleProducerClick}
                        onClearProducer={() => setProducerFilter(null)}
                        onSongClick={handleSongClick}
                    />
                );
            case 'vault':
                return <LocalVaultView />;
            case 'files':
                return <FileExplorerView />;
            case 'playlists':
                return <PlaylistsView />;
            case 'covers':
                return <CoversView />;
            case 'radio':
                return (
                    <HomeView
                        producerFilter={null}
                        onProducerClick={handleProducerClick}
                        onClearProducer={() => setProducerFilter(null)}
                        onSongClick={handleSongClick}
                    />
                );
            case 'stats':
                return <StatsDashboard />;
            case 'history':
                return <HistoryView onSongClick={handleSongClick} />;
            case 'settings':
                return <SettingsView />;
            default:
                return (
                    <HomeView
                        producerFilter={producerFilter}
                        onProducerClick={handleProducerClick}
                        onClearProducer={() => setProducerFilter(null)}
                        onSongClick={handleSongClick}
                    />
                );
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setShowMobileSidebar(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "md:block",
                showMobileSidebar
                    ? "fixed inset-y-0 left-0 z-50 block"
                    : "hidden"
            )}>
                <Sidebar activeView={activeView} setActiveView={handleSetActiveView} />
            </div>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {renderView()}

                {/* Top Header Decor */}
                <div className="absolute top-0 right-0 p-4 md:p-8 flex items-center gap-4 md:gap-6 pointer-events-none">
                    <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Vlone Player 999
                    </div>
                </div>
            </main>

            {/* Queue Panel */}
            <QueuePanel isOpen={showQueue} onClose={() => setShowQueue(false)} />

            {/* Lyrics Panel Overlay */}
            <div className={clsx(
                "fixed right-0 top-0 bottom-24 w-full md:w-[450px] bg-black/60 backdrop-blur-3xl border-l border-white/10 z-40 transition-transform duration-500 ease-in-out p-8 md:p-12 overflow-y-auto",
                showLyrics ? "translate-x-0" : "translate-x-full"
            )}>
                <button
                    onClick={() => setShowLyrics(false)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 p-3 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {currentSong ? (
                    <div className="space-y-12">
                        <div>
                            <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">Lyrics / Transcription</p>
                            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-tight uppercase">{currentSong.title}</h2>
                            <p className="text-white/40 font-bold mt-2 italic text-lg">{currentSong.artist}</p>
                        </div>

                        <div className="space-y-6 text-xl md:text-2xl font-bold leading-relaxed text-white select-none whitespace-pre-wrap">
                            {lyrics || "Scanning vault for transcriptions..."}
                        </div>

                        <div className="pt-12 border-t border-white/5">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Metadata Source</p>
                            <p className="text-xs font-bold mt-2">Juice WRLD API Comprehensive Database</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <Languages className="w-12 h-12 text-white/10" />
                        <p className="text-white/20 font-black italic uppercase">Select a track to view lyrics</p>
                    </div>
                )}
            </div>

            {/* Persistent Player */}
            <Player
                onExpand={() => setShowImmersive(true)}
                onProducerClick={handleProducerClick}
                onQueueToggle={() => setShowQueue(!showQueue)}
                showQueue={showQueue}
            />

            {/* Immersive Player Overlay */}
            <ImmersivePlayer isOpen={showImmersive} onClose={() => setShowImmersive(false)} />

            {/* Lyrics Toggle Button */}
            {currentSong && (
                <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={clsx(
                        "fixed bottom-28 right-4 md:right-8 z-50 p-3 md:p-4 rounded-2xl border transition-all duration-300 shadow-2xl",
                        showLyrics ? "bg-primary text-white border-primary" : "bg-black/60 text-white/60 border-white/10 hover:border-white/20 backdrop-blur-md"
                    )}
                >
                    <Languages className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

// History View
const HistoryView: React.FC<{ onSongClick?: (id: string) => void }> = ({ onSongClick }) => {
    const { history, playSong, currentSong, isPlaying } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();


    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <History className="w-5 h-5 text-primary" />
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
                        <History className="w-16 h-16 text-white/5 mx-auto mb-4" />
                        <p className="text-white/20 font-black italic uppercase">No Listening History</p>
                        <p className="text-white/10 text-xs mt-2">Play a song to start tracking</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Settings View with Keyboard Shortcuts display
// Settings View with Keyboard Shortcuts display
const SettingsView: React.FC = () => {
    const {
        themeColor, setThemeColor,
        eqEnabled, setEqEnabled, eqGains, setEqGain, eqLabelMode, setEqLabelMode
    } = usePlayer();
    const [pat, setPat] = useState(import.meta.env.VITE_API_PAT || '');

    const themes = [
        { name: 'Dark', color: '#0a0a0c' },
        { name: 'Light', color: '#f8f9fa' },
        { name: '999', color: '#ff004c' },
        { name: 'Midnight', color: '#0f172a' },
        { name: 'Ocean', color: '#075985' },
    ];

    const bands = [
        { hz: '31', text: 'Sub' },
        { hz: '62', text: 'Bass' },
        { hz: '125', text: 'L-Mid' },
        { hz: '250', text: 'Mid' },
        { hz: '500', text: 'Mid' },
        { hz: '1k', text: 'H-Mid' },
        { hz: '2k', text: 'Pres' },
        { hz: '4k', text: 'Treb' },
        { hz: '8k', text: 'High' },
        { hz: '16k', text: 'Air' },
    ];

    const shortcuts = [
        { keys: 'Space', action: 'Play / Pause' },
        { keys: '←', action: 'Seek back 10s' },
        { keys: '→', action: 'Seek forward 10s' },
        { keys: 'Shift + ←', action: 'Previous track' },
        { keys: 'Shift + →', action: 'Next track' },
        { keys: '↑', action: 'Volume up' },
        { keys: '↓', action: 'Volume down' },
        { keys: 'M', action: 'Mute / Unmute' },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
            <div className="max-w-4xl mx-auto space-y-12">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter mb-2 uppercase text-gradient">Settings</h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Vlone Player v2.2.0 — Powered by 999 Archive</p>
                </div>

                {/* Appearance Settings */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <Palette className="w-5 h-5" />
                        <h3 className="font-black italic uppercase tracking-tighter">Appearance & Theme</h3>
                    </div>
                    <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8">
                        <div>
                            <p className="text-sm font-bold mb-4 uppercase tracking-widest text-white/60">Theme Selection</p>
                            <div className="flex flex-wrap gap-4">
                                {themes.map((t) => (
                                    <button
                                        key={t.name}
                                        onClick={() => setThemeColor(t.color)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all hover:scale-105",
                                            themeColor === t.color ? "border-primary bg-primary/10 text-white" : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                                        )}
                                    >
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color, border: '1px solid rgba(255,255,255,0.1)' }} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.name}</span>
                                    </button>
                                ))}
                                <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 bg-white/5">
                                    <input
                                        type="color"
                                        value={themeColor}
                                        onChange={(e) => setThemeColor(e.target.value)}
                                        className="w-5 h-5 bg-transparent border-none cursor-pointer"
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Custom</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Equalizer Settings */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-primary">
                            <Activity className="w-5 h-5" />
                            <h3 className="font-black italic uppercase tracking-tighter">Acoustic Equalizer</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setEqLabelMode(eqLabelMode === 'hz' ? 'text' : 'hz')}
                                className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors"
                            >
                                Mode: {eqLabelMode.toUpperCase()}
                            </button>
                            <button
                                onClick={() => setEqEnabled(!eqEnabled)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    eqEnabled ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white/20 hover:text-white"
                                )}
                            >
                                {eqEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8">
                        <div className="flex justify-between items-end h-48 gap-2 md:gap-4 overflow-x-auto pb-4">
                            {bands.map((band, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 min-w-[40px]">
                                    <div className="flex-1 relative w-full flex justify-center group">
                                        <input
                                            type="range"
                                            min="-12"
                                            max="12"
                                            step="0.5"
                                            value={eqGains[i]}
                                            onChange={(e) => setEqGain(i, parseFloat(e.target.value))}
                                            className="appearance-none w-32 h-1 bg-white/5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 cursor-ns-resize accent-primary"
                                        />
                                        <div className="absolute top-0 text-[8px] font-bold text-white/20 group-hover:text-primary transition-colors">
                                            {eqGains[i] > 0 ? `+${eqGains[i]}` : eqGains[i]}
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-white/30 truncate w-full text-center">
                                        {eqLabelMode === 'hz' ? band.hz : band.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => Array.from({ length: 10 }).forEach((_, i) => setEqGain(i, 0))}
                                className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                            >
                                Reset Bands
                            </button>
                        </div>
                    </div>
                </section>

                {/* Keyboard Shortcuts */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <Keyboard className="w-5 h-5" />
                        <h3 className="font-black italic uppercase tracking-tighter">Keyboard Control</h3>
                    </div>
                    <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {shortcuts.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{s.action}</span>
                                    <div className="flex items-center gap-1">
                                        {s.keys.split(' + ').map((key, kidx) => (
                                            <React.Fragment key={kidx}>
                                                {kidx > 0 && <span className="text-white/10 text-[10px] mx-1">+</span>}
                                                <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-white/60 min-w-[24px] text-center">
                                                    {key}
                                                </kbd>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* API & Data */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <Activity className="w-5 h-5" />
                        <h3 className="font-black italic uppercase tracking-tighter">API & Data Management</h3>
                    </div>
                    <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8">
                        <div>
                            <p className="text-sm font-bold mb-2 uppercase tracking-widest text-white/60">Personal Access Token (PAT)</p>
                            <p className="text-[10px] text-white/30 mb-4 uppercase font-bold">Required for high-bandwidth streaming and global discovery scans.</p>
                            <div className="flex gap-3">
                                <input
                                    type="password"
                                    value={pat}
                                    onChange={(e) => setPat(e.target.value)}
                                    placeholder="Enter VITE_API_PAT..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-primary outline-none transition-colors"
                                />
                                <button className="bg-white text-black font-black px-6 py-2 rounded-xl hover:scale-105 transition-transform text-xs uppercase">SAVE</button>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h4 className="text-xs font-black uppercase text-white/40 mb-4 tracking-widest">Storage & Cache</h4>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        if (confirm('Clear all playlists and custom covers?')) {
                                            localStorage.removeItem('999_playlists');
                                            localStorage.removeItem('999_custom_covers');
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full flex justify-between items-center py-4 px-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400 group hover:bg-red-500/10 transition-colors"
                                >
                                    <span className="text-xs font-black uppercase tracking-widest">Wipe Local Datastore</span>
                                    <span className="text-[10px] opacity-40 group-hover:opacity-100 italic transition-opacity">IRREVERSIBLE</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Clear playback statistics and metrics?')) {
                                            localStorage.removeItem('999_history');
                                            localStorage.removeItem('999_most_played');
                                            localStorage.removeItem('999_listening_time');
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full flex justify-between items-center py-4 px-6 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:bg-white/10 transition-colors"
                                >
                                    <span className="text-xs font-black uppercase tracking-widest">Reset Analytics</span>
                                    <span className="text-[10px] italic">Clear History & Stats</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const StatsDashboard: React.FC = () => {
    const { stats, isOnline, latency } = useApiStatus();
    const { totalListeningTime, mostPlayed, playSong } = usePlayer();
    const [eras, setEras] = useState<Era[]>([]);

    useEffect(() => {
        api.getEras().then(setEras);
    }, []);

    const statItems = [
        { label: 'Total Tracks', value: stats?.total_songs?.toLocaleString() || '...', icon: Music, color: 'text-primary' },
        { label: 'Listening Time', value: `${Math.floor(totalListeningTime)} Min`, icon: Clock, color: 'text-blue-400' },
        { label: 'Categories', value: stats?.categories_count?.toString() || '...', icon: ListMusic, color: 'text-green-500' },
        { label: 'Eras Discovery', value: stats?.eras_count?.toString() || '...', icon: Disc, color: 'text-accent' },
    ];

    const topTracks = Object.values(mostPlayed)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="flex-1 p-8 md:p-12 overflow-y-auto pb-32">
            <div className="mb-12">
                <h2 className="text-3xl font-black italic tracking-tighter mb-2">999 TRACKER</h2>
                <div className="flex items-center gap-4">
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Database Health & Discography Insights</p>
                    <div className={clsx(
                        "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                        isOnline ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                        {isOnline ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                API Online ({latency}ms)
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                API Offline
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                {statItems.map((stat, idx) => (
                    <div key={idx} className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-white/20 transition-all group">
                        <stat.icon className={clsx("w-8 h-8 mb-6 group-hover:scale-110 transition-transform", stat.color)} />
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Era Bar Chart */}
                <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8">
                    <h3 className="text-lg font-black italic mb-8 uppercase text-white/60 tracking-widest">Era Distribution</h3>
                    <div className="space-y-4">
                        {eras.slice(0, 6).map((era, idx) => {
                            // Mock distribution since API doesn't provide per-era count in stats
                            const width = 100 - (idx * 12);
                            return (
                                <div key={era.name} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-white/60">{era.name}</span>
                                        <span className="text-primary">{width}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${width}%` }}
                                            transition={{ delay: idx * 0.1, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-primary to-accent"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Most Played */}
                <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8">
                    <h3 className="text-lg font-black italic mb-8 uppercase text-white/60 tracking-widest">Most Played Tracks</h3>
                    <div className="space-y-2">
                        {topTracks.map((item, idx) => (
                            <div
                                key={item.song.id}
                                onClick={() => playSong(item.song)}
                                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
                            >
                                <div className="w-8 text-center text-xs font-black text-white/10 group-hover:text-primary">0{idx + 1}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate uppercase italic tracking-tighter">{item.song.title}</h4>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{item.song.artist}</p>
                                </div>
                                <div className="text-[10px] font-black bg-primary/20 text-primary px-2 py-1 rounded-lg">
                                    {item.count} PLAYS
                                </div>
                            </div>
                        ))}
                        {topTracks.length === 0 && (
                            <div className="h-48 flex flex-col items-center justify-center text-center opacity-20">
                                <Activity className="w-12 h-12 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Awaiting playback data...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Need to import useCustomCovers for HistoryView
import { useCustomCovers } from './hooks/useCustomCovers';

const App: React.FC = () => {
    return (
        <PlayerProvider>
            <MainLayout />
        </PlayerProvider>
    );
};

export default App;
