import React, { useState, useEffect } from 'react';
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
import { usePlayer } from './context/PlayerContext';
import { Languages, X, Activity, Music, Users, Clock, Menu, Keyboard, History } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from './lib/api';

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

    const formatDuration = (seconds: number) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
const SettingsView: React.FC = () => {
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
        <div className="flex-1 p-8 md:p-12 overflow-y-auto pb-32">
            <div className="mb-12">
                <h2 className="text-3xl font-black italic tracking-tighter mb-2">SETTINGS</h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Configure your Vlone Player 999 experience</p>
            </div>

            <div className="space-y-6 max-w-2xl">
                {/* Keyboard Shortcuts */}
                <div className="bg-[#121217] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Keyboard className="w-5 h-5 text-primary" />
                        <h3 className="font-black italic text-sm uppercase">Keyboard Shortcuts</h3>
                    </div>
                    <div className="space-y-3">
                        {shortcuts.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2">
                                <span className="text-sm text-white/40 font-medium">{s.action}</span>
                                <div className="flex items-center gap-1">
                                    {s.keys.split(' + ').map((key, kidx) => (
                                        <React.Fragment key={kidx}>
                                            {kidx > 0 && <span className="text-white/10 text-xs mx-1">+</span>}
                                            <kbd className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/60 min-w-[32px] text-center">
                                                {key}
                                            </kbd>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className="bg-[#121217] border border-white/5 rounded-3xl p-8">
                    <h3 className="font-black italic text-sm uppercase mb-6">About</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-sm font-medium">Version</span>
                            <span className="font-bold text-sm">2.0.0 — Phase 2</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-sm font-medium">API</span>
                            <span className="font-bold text-sm">juicewrldapi.com</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-sm font-medium">Storage Used</span>
                            <span className="font-bold text-sm">
                                {(new Blob([JSON.stringify(localStorage)]).size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                    </div>
                </div>

                {/* Data */}
                <div className="bg-[#121217] border border-white/5 rounded-3xl p-8">
                    <h3 className="font-black italic text-sm uppercase mb-6">Data</h3>
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                if (confirm('Clear all playlists and custom covers? This cannot be undone.')) {
                                    localStorage.removeItem('999_playlists');
                                    localStorage.removeItem('999_custom_covers');
                                    window.location.reload();
                                }
                            }}
                            className="w-full py-3 px-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
                        >
                            Clear All Local Data
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Clear listening history?')) {
                                    localStorage.removeItem('999_history');
                                    window.location.reload();
                                }
                            }}
                            className="w-full py-3 px-6 bg-white/5 border border-white/5 rounded-xl text-white/40 font-bold text-sm hover:bg-white/10 transition-colors"
                        >
                            Clear Listening History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsDashboard: React.FC = () => {
    const stats = [
        { label: 'Total Tracks', value: '2,742', icon: Music, color: 'text-primary' },
        { label: 'Active Sessions', value: '184', icon: Activity, color: 'text-green-500' },
        { label: 'Unique Artists', value: '124', icon: Users, color: 'text-accent' },
        { label: 'Uptime', value: '99.9%', icon: Clock, color: 'text-blue-400' },
    ];

    return (
        <div className="flex-1 p-8 md:p-12 overflow-y-auto pb-32">
            <div className="mb-12">
                <h2 className="text-3xl font-black italic tracking-tighter mb-2">999 TRACKER</h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Database Health & Discography Insights</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-white/20 transition-all group">
                        <stat.icon className={clsx("w-8 h-8 mb-6 group-hover:scale-110 transition-transform", stat.color)} />
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8 min-h-[400px]">
                    <h3 className="text-lg font-black italic mb-8 uppercase text-white/60 tracking-widest">Era Distribution</h3>
                    <div className="space-y-6">
                        {[
                            { era: 'Goodbye & Good Riddance', percent: 85, color: 'bg-primary' },
                            { era: 'Death Race for Love', percent: 72, color: 'bg-accent' },
                            { era: 'Legends Never Die', percent: 94, color: 'bg-blue-500' },
                            { era: 'Unreleased / Leaks', percent: 100, color: 'bg-white/20' },
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span>{item.era}</span>
                                    <span className="text-white/40">{item.percent}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className={clsx("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#121217] to-primary/10 border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col justify-center">
                    <Activity className="w-12 h-12 text-primary mb-8 animate-pulse" />
                    <h3 className="text-2xl font-black italic mb-4 uppercase">Live Sync Active</h3>
                    <p className="text-white/50 font-medium leading-relaxed">
                        Our tracker monitors the Juice WRLD API in real-time. New leaks, updated metadata, and high-fidelity masters are automatically indexed as they appear on the main repository.
                    </p>
                    <button className="mt-8 self-start bg-white text-black font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform active:scale-95">
                        REFRESH DATABASE
                    </button>
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
