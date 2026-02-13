import React, { useState, useEffect } from 'react';
import { useApiStatus } from '../hooks/useApiStatus';
import { usePlayer } from '../context/PlayerContext';
import { api } from '../lib/api';
import type { Era } from '../lib/types';
import {
    Music, Activity, Users, Shield, Clock, Music2, Disc, ListMusic
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const TrackerView: React.FC = () => {
    const { stats, isOnline, latency } = useApiStatus();
    const { totalListeningTime, mostPlayed, playSong } = usePlayer();
    const [eras, setEras] = useState<Era[]>([]);

    useEffect(() => {
        api.getEras().then(setEras);
    }, []);

    const statItems = [
        { label: 'Total Tracks', value: stats?.total_songs?.toLocaleString() || '...', icon: Music, color: 'text-primary' },
        { label: 'Community Plays', value: stats?.total_streamed?.toLocaleString() || '...', icon: Activity, color: 'text-accent' },
        { label: 'Active Guardians', value: stats?.active_users?.toString() || '...', icon: Users, color: 'text-green-500' },
        { label: 'Total Vaults', value: stats?.total_users?.toLocaleString() || '...', icon: Shield, color: 'text-blue-400' },
    ];

    const personalStats = [
        { label: 'My Listening', value: `${Math.floor(totalListeningTime)} Min`, icon: Clock, color: 'text-primary' },
        { label: 'Tracks Played', value: Object.keys(mostPlayed).length.toString(), icon: Music2, color: 'text-accent' },
        { label: 'Era Discovery', value: stats?.eras_count?.toString() || '...', icon: Disc, color: 'text-green-500' },
        { label: 'Collections', value: stats?.categories_count?.toString() || '...', icon: ListMusic, color: 'text-blue-400' },
    ];

    const topTracks = Object.values(mostPlayed)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="flex-1 p-8 md:p-12 overflow-y-auto pb-32">
            <div className="mb-12">
                <h2 className="text-3xl font-black italic tracking-tighter mb-2">GLOBAL TRACKER</h2>
                <div className="flex items-center gap-4">
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time Database Health & Global Insights</p>
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

            <div className="space-y-12">
                {/* Global Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statItems.map((stat, idx) => (
                        <div key={idx} className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-white/20 transition-all group">
                            <stat.icon className={clsx("w-8 h-8 mb-6 group-hover:scale-110 transition-transform", stat.color)} />
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-3xl md:text-2xl lg:text-3xl font-black italic tracking-tighter uppercase truncate">{stat.value}</h4>
                        </div>
                    ))}
                </div>

                {/* Personal Multiplier */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black italic uppercase tracking-widest text-white/40">Personal Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {personalStats.map((stat, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/10 transition-all group">
                                <stat.icon className={clsx("w-6 h-6 mb-4 group-hover:rotate-12 transition-transform", stat.color)} />
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-xl font-black italic tracking-tighter uppercase">{stat.value}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-12">
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

export default TrackerView;
