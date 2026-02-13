import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
    User, ImagePlus, ShieldCheck, Palette, Activity, Keyboard,
    Settings as SettingsIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import VaultAuth from '../components/VaultAuth';

const SettingsView: React.FC = () => {
    const {
        themeColor, setThemeColor,
        eqEnabled, setEqEnabled, eqGains, setEqGain, eqLabelMode, setEqLabelMode,
        eqPresets, saveEqPreset, loadEqPreset, deleteEqPreset,
        user, updateUser, cloudSync, setCloudSync
    } = usePlayer();
    const [pat, setPat] = useState(import.meta.env.VITE_API_PAT || '');

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

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
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">v2.2.0 — Powered by <a href="https://juicewrldapi.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">https://juicewrldapi.com</a></p>
                </div>

                {/* User Profile */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <User className="w-5 h-5" />
                        <h3 className="font-black italic uppercase tracking-tighter">User Profile</h3>
                    </div>
                    <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-white/5 border-2 border-primary/20 group-hover:border-primary transition-colors">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-12 h-12 text-white/10" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[40px]">
                                    <ImagePlus className="w-6 h-6 text-white" />
                                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Username</label>
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        onChange={(e) => updateUser({ username: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 outline-none focus:border-primary/50 transition-colors font-bold"
                                        placeholder="Vault Guardian"
                                    />
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-10 h-6 rounded-full relative transition-colors cursor-pointer",
                                            cloudSync ? "bg-primary" : "bg-white/10"
                                        )} onClick={() => setCloudSync(!cloudSync)}>
                                            <div className={clsx(
                                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                                cloudSync ? "left-5" : "left-1"
                                            )} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest">Cloud Sync</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cloud Sync & Auth */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                        <h3 className="font-black italic uppercase tracking-tighter">Vault Connectivity</h3>
                    </div>
                    <VaultAuth />
                </section>

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
                                    eqEnabled ? "bg-primary text-white shadow-lg" : "bg-white/5 text-white/20 hover:text-white"
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

export default SettingsView;
