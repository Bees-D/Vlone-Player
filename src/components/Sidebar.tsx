import React from 'react';
import { Home, Music2, ListMusic, FolderTree, Disc, BarChart3, Radio, Settings, ImagePlus } from 'lucide-react';
import { clsx } from 'clsx';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const { currentSong, isPlaying, playbackMode } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();

    const menuItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'library', label: 'Music Library', icon: Music2 },
        { id: 'playlists', label: 'Playlists', icon: ListMusic },
        { id: 'files', label: 'File Explorer', icon: FolderTree },
        { id: 'radio', label: 'Radio 999', icon: Radio },
        { id: 'stats', label: 'Tracker / Stats', icon: BarChart3 },
        { id: 'covers', label: 'Custom Covers', icon: ImagePlus },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const coverUrl = currentSong ? resolveCoverUrl(currentSong.cover_url, currentSong) : '';

    return (
        <aside className="w-64 bg-black/40 backdrop-blur-md border-r border-white/5 flex flex-col h-full">
            <div className="p-8">
                <h1 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm not-italic">999</span>
                    VLONE PLAYER
                </h1>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mt-1 pl-10">Powered by Juice WRLD API</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-4 px-4">Menu</div>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                            activeView === item.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className={clsx("w-5 h-5", activeView === item.id ? "text-white" : "text-white/40 group-hover:text-white")} />
                        <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 space-y-4">
                {currentSong && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0">
                            {coverUrl ? (
                                <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
                            )}
                            {isPlaying && <div className="absolute inset-0 bg-primary/20 animate-pulse" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black italic uppercase text-primary truncate">{currentSong.title}</p>
                            <p className="text-[8px] font-bold text-white/40 uppercase truncate">{currentSong.artist}</p>
                        </div>
                    </motion.div>
                )}

                {/* Playback Mode Indicator */}
                {playbackMode !== 'normal' && (
                    <div className={clsx(
                        "border rounded-xl px-3 py-2 flex items-center gap-2",
                        playbackMode === 'radio' ? "bg-primary/10 border-primary/20" :
                            playbackMode === 'smart-shuffle' ? "bg-accent/10 border-accent/20" :
                                "bg-white/5 border-white/10"
                    )}>
                        <Radio className={clsx("w-3 h-3", playbackMode === 'radio' ? "text-primary" : "text-accent")} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                            {playbackMode === 'radio' ? '999 Radio Active' :
                                playbackMode === 'smart-shuffle' ? 'Smart Shuffle On' :
                                    'Shuffle On'}
                        </span>
                    </div>
                )}

                <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 rounded-2xl p-4">
                    <p className="text-xs font-bold text-white/60 mb-2">NOW TRACKING</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                            <Disc className="w-6 h-6 text-primary animate-spin-slow" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">2,742 Songs</p>
                            <p className="text-[10px] text-white/40">Real-time DB Sync</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
