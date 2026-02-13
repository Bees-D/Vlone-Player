import React from 'react';
import { Home, Music2, ListMusic, FolderTree, Disc, BarChart3, Radio, Settings, ImagePlus, History, Signal, WifiOff, HardDrive } from 'lucide-react';
import { clsx } from 'clsx';
import { usePlayer } from '../context/PlayerContext';
import { useCustomCovers } from '../hooks/useCustomCovers';
import { useApiStatus } from '../hooks/useApiStatus';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const { currentSong, isPlaying } = usePlayer();
    const { resolveCoverUrl } = useCustomCovers();
    const { isOnline, latency, stats } = useApiStatus();

    const menuItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'library', label: 'Music Library', icon: Music2 },
        { id: 'vault', label: 'Local Vault', icon: HardDrive },
        { id: 'playlists', label: 'Playlists', icon: ListMusic },
        { id: 'files', label: 'File Explorer', icon: FolderTree },
        { id: 'history', label: 'History', icon: History },
        { id: 'radio', label: 'Radio 999', icon: Radio },
        { id: 'stats', label: 'Tracker / Stats', icon: BarChart3 },
        { id: 'covers', label: 'Custom Covers', icon: ImagePlus },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const coverUrl = currentSong ? resolveCoverUrl(currentSong.cover_url, currentSong) : '';

    return (
        <aside className="w-72 bg-black border-r border-white/5 flex flex-col h-full overflow-hidden">
            <div className="p-10">
                <h1 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
                    <span className="w-10 h-10 bespoke-button flex items-center justify-center text-sm not-italic">999</span>
                    VLONE
                </h1>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 pl-1">Legacy Archive v2.2</p>
            </div>

            <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] mb-6 px-4">Navigation</div>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={clsx(
                            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                            activeView === item.id
                                ? "bg-primary text-white shadow-2xl"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {activeView === item.id && (
                            <motion.div
                                layoutId="sidebar-active"
                                className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light opacity-100"
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            />
                        )}
                        <item.icon className={clsx("w-5 h-5 relative z-10", activeView === item.id ? "text-white" : "text-white/30 group-hover:text-white")} />
                        <span className="font-black text-xs uppercase tracking-tight relative z-10">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-6 space-y-4 bg-black/40 backdrop-blur-3xl border-t border-white/5">
                {currentSong && !isPlaying && (
                    <div className="bespoke-card p-3 flex items-center gap-3 bg-white/5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                            {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-surface" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black italic uppercase text-white/40 truncate">{currentSong.title}</p>
                            <p className="text-[8px] font-bold text-white/20 uppercase truncate">Paused</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <div className={clsx(
                        "flex-1 bespoke-card px-3 py-2.5 flex items-center gap-2",
                        isOnline ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"
                    )}>
                        <Signal className={clsx("w-3 h-3", isOnline ? "text-green-500" : "text-red-500")} />
                        <span className={clsx("text-[9px] font-black uppercase tracking-widest", isOnline ? "text-green-500/60" : "text-red-500/60")}>
                            {isOnline ? `${latency}ms` : 'Sync Failed'}
                        </span>
                    </div>
                </div>

                <div className="bespoke-card p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 group cursor-pointer hover:bg-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Disc className="w-5 h-5 text-primary animate-spin-slow" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{stats?.total_songs?.toLocaleString() || '...'}</p>
                            <p className="text-[9px] font-bold text-white/30 uppercase">Tracks Indexed</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
