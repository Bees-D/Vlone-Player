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
import SettingsView from './views/SettingsView';
import HistoryView from './views/HistoryView';
import TrackerView from './views/TrackerView';
import { usePlayer } from './context/PlayerContext';
import { X, Menu, Languages } from 'lucide-react';
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
    const { currentSong } = usePlayer();

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
        setSongDetailId(null);
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
            case 'radio':
                return (
                    <HomeView
                        producerFilter={activeView === 'radio' ? null : producerFilter}
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
            case 'stats':
                return <TrackerView />;
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

            {/* Desktop Navigation Sidebar */}
            <div className="hidden md:block flex-shrink-0 border-r border-white/5 bg-black">
                <Sidebar activeView={activeView} setActiveView={handleSetActiveView} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {showMobileSidebar && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setShowMobileSidebar(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="md:hidden fixed inset-y-0 left-0 w-[85%] bg-black z-[70] border-r border-white/10"
                        >
                            <Sidebar activeView={activeView} setActiveView={handleSetActiveView} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="flex-1 flex flex-row overflow-hidden min-h-0">
                    <div className="flex-1 overflow-y-auto w-full relative custom-scrollbar">
                        {renderView()}
                    </div>

                    {/* Right Side Queue (Desktop) */}
                    <AnimatePresence>
                        {showQueue && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '380px' }}
                                exit={{ width: 0 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                                className="hidden md:block flex-shrink-0 border-l border-white/5 bg-black overflow-hidden relative"
                            >
                                <div className="w-[380px] h-full">
                                    <QueuePanel isOpen={true} onClose={() => setShowQueue(false)} isSidebar={true} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Player UI */}
                <div className="relative z-50 border-t border-white/5">
                    <Player
                        onExpand={() => setShowImmersive(true)}
                        onQueueToggle={() => setShowQueue(!showQueue)}
                        showQueue={showQueue}
                    />
                </div>
            </main>

            {/* Immersive Fullscreen Player */}
            <ImmersivePlayer
                isOpen={showImmersive}
                onClose={() => setShowImmersive(false)}
            />

            {/* Mobile Queue (Overlay) */}
            <div className="md:hidden">
                <QueuePanel isOpen={showQueue} onClose={() => setShowQueue(false)} />
            </div>

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

const App: React.FC = () => {
    return (
        <PlayerProvider>
            <MainLayout />
        </PlayerProvider>
    );
};

export default App;
