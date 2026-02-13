import React, { useState, useRef } from 'react';
import { HardDrive, Upload, Trash2, Play, Music, FileAudio, Plus, X } from 'lucide-react';
import { useLocalVault, LocalTrack } from '../hooks/useLocalVault';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration, formatFileSize } from '../lib/utils';
import { clsx } from 'clsx';

const LocalVaultView: React.FC = () => {
    const { localTracks, addLocalTrack, removeLocalTrack, loading } = useLocalVault();
    const { playSong, currentSong, isPlaying } = usePlayer();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                await addLocalTrack(files[i], {});
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-8 pb-12">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <HardDrive className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter">LOCAL VAULT</h2>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Personal Archive — Stored in Browser Storage</p>
                    </div>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Upload className={clsx("w-5 h-5", uploading && "animate-bounce")} />
                    {uploading ? 'UPLOADING...' : 'IMPORT FILES'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                </div>
            ) : localTracks.length === 0 ? (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <FileAudio className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-black italic mb-2 uppercase">Vault is Empty</h3>
                    <p className="max-w-md text-sm font-bold text-white/20 uppercase tracking-widest mb-8">
                        Upload your own .mp3 or .wav files to play them with the 999 premium experience.
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform"
                    >
                        CHOOSE FILES
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {localTracks.map((track, idx) => {
                        const isCurrent = currentSong?.id === track.id;
                        return (
                            <div
                                key={track.id}
                                onClick={() => playSong(track, localTracks)}
                                className={clsx(
                                    "group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border border-transparent",
                                    isCurrent ? "bg-primary/20 border-primary/20 shadow-lg shadow-primary/5" : "hover:bg-white/5"
                                )}
                            >
                                <div className="w-10 text-center text-lg font-black italic text-white/10 group-hover:text-primary transition-colors">{idx + 1}</div>
                                <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center relative flex-shrink-0">
                                    <Music className={clsx("w-6 h-6", isCurrent ? "text-primary" : "text-white/20")} />
                                    {isCurrent && isPlaying && (
                                        <div className="absolute inset-0 bg-primary/60 rounded-xl flex items-center justify-center">
                                            <div className="flex gap-0.5 items-end h-4">
                                                <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1 bg-white animate-bounce h-full" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1 bg-white animate-bounce h-1/2" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={clsx("font-black italic text-sm truncate uppercase", isCurrent ? "text-primary" : "text-white")}>
                                        {track.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                        {formatFileSize(track.fileSize)} · Added {new Date(track.addedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeLocalTrack(track.id); }}
                                        className="p-3 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded-xl transition-colors"
                                        title="Delete from Vault"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LocalVaultView;
