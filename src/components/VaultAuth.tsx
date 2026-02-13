import React, { useState } from 'react';
import { User, Lock, LogIn, LogOut, Cloud, CloudOff, ShieldCheck, Loader, CheckCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clsx } from 'clsx';

const VaultAuth: React.FC = () => {
    const { user, login, logout, cloudSync, setCloudSync } = usePlayer();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        setLoading(true);
        setError('');
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Signed In As</p>
                            <h4 className="text-xl font-black italic uppercase italic tracking-tighter">{user.username}</h4>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-3 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 rounded-xl transition-all group"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {cloudSync ? <Cloud className="w-5 h-5 text-green-500" /> : <CloudOff className="w-5 h-5 text-white/20" />}
                        <div>
                            <p className="text-xs font-bold uppercase">Cloud Sync</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                {cloudSync ? 'Syncing playlists to GitHub Storage' : 'Cloud saving disabled'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCloudSync(!cloudSync)}
                        className={clsx(
                            "w-12 h-6 rounded-full relative transition-colors",
                            cloudSync ? "bg-primary" : "bg-white/10"
                        )}
                    >
                        <div className={clsx(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                            cloudSync ? "left-7" : "left-1"
                        )} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 md:p-8">
            <div className="mb-8">
                <h3 className="text-lg font-black italic uppercase mb-2">Private Vault Login</h3>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                    Sync your playlists and metadata across all devices using Bees-D/Vlone-Storage.
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="text"
                        placeholder="USERNAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold placeholder:text-white/10 focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold placeholder:text-white/10 focus:border-primary outline-none transition-all"
                    />
                </div>

                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative w-5 h-5 rounded border border-white/10 bg-white/5 flex items-center justify-center transition-all group-hover:border-primary/50">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="peer absolute opacity-0 w-full h-full cursor-pointer"
                            />
                            <CheckCircle className="w-3 h-3 text-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Remember Me</span>
                    </label>
                    <a href="#" className="text-[10px] font-bold text-primary/40 hover:text-primary uppercase tracking-widest transition-colors">Forgot Hash?</a>
                </div>

                {error && (
                    <p className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <LogIn className="w-5 h-5" />
                            SIGN INTO VAULT
                        </>
                    )}
                </button>
            </form>
            <p className="text-[9px] text-center mt-6 text-white/20 font-bold uppercase tracking-[0.2em]">
                Your credentials are never shared. A unique ID is generated locally.
            </p>
        </div>
    );
};

export default VaultAuth;
