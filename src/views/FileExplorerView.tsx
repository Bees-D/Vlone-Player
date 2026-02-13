import React, { useState, useEffect } from 'react';
import { Folder, FileAudio, Film, ChevronRight, Search, HardDrive, Download, Share2, Play, Info } from 'lucide-react';
import { api } from '../lib/api';
import { Folder as FolderType } from '../lib/types';
import { usePlayer } from '../context/PlayerContext';
import { getMediaType, formatFileSize, downloadFile } from '../lib/utils';
import { clsx } from 'clsx';

const FileExplorerView: React.FC = () => {
    const [currentPath, setCurrentPath] = useState<string>('/');
    const [items, setItems] = useState<FolderType[]>([]);
    const [loading, setLoading] = useState(true);
    const { playByPath } = usePlayer();

    const loadFiles = async (path: string) => {
        setLoading(true);
        try {
            const folders = await api.browseFiles(path);
            setItems(folders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles(currentPath);
    }, [currentPath]);

    const breadcrumbs = currentPath.split('/').filter(Boolean);

    const navigateTo = (path: string) => {
        setCurrentPath(path);
    };

    const goBack = () => {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        setCurrentPath('/' + parts.join('/'));
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0a0c]">
            {/* Explorer Header */}
            <div className="p-8 border-b border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <HardDrive className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic tracking-tighter">FILE EXPLORER</h2>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Raw Archive Access</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder="Find in files..."
                                className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-bold">
                    <button
                        onClick={() => navigateTo('/')}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        Root
                    </button>
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            <ChevronRight className="w-4 h-4 text-white/10" />
                            <button
                                onClick={() => navigateTo('/' + breadcrumbs.slice(0, idx + 1).join('/'))}
                                className={clsx(
                                    "transition-colors",
                                    idx === breadcrumbs.length - 1 ? "text-primary" : "text-white/40 hover:text-white"
                                )}
                            >
                                {crumb}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-white/20 font-bold text-xs animate-pulse">Scanning Disk Structure...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {currentPath !== '/' && (
                            <div
                                onClick={goBack}
                                className="group p-4 rounded-2xl border border-white/5 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <ChevronRight className="w-5 h-5 text-white/40 rotate-180" />
                                </div>
                                <span className="font-bold text-sm text-white/40 group-hover:text-white">Go Back</span>
                            </div>
                        )}

                        {items.map((item, idx) => {
                            const mediaType = item.type === 'file' ? getMediaType(item.name) : 'unknown';
                            const isVideo = mediaType === 'video';
                            const isAudio = mediaType === 'audio';

                            return (
                                <div
                                    key={idx}
                                    onClick={() => item.type === 'directory' ? navigateTo(item.path) : null}
                                    className="group relative bg-[#121217] border border-white/5 rounded-3xl p-5 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={clsx(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                            item.type === 'directory' ? "bg-primary/10 text-primary" :
                                                isVideo ? "bg-purple-500/10 text-purple-400" :
                                                    isAudio ? "bg-accent/10 text-accent" :
                                                        "bg-white/10 text-white/40"
                                        )}>
                                            {item.type === 'directory' ?
                                                <Folder className="w-8 h-8 fill-current" /> :
                                                isVideo ? <Film className="w-8 h-8" /> :
                                                    isAudio ? <FileAudio className="w-8 h-8 fill-current" /> :
                                                        <FileAudio className="w-8 h-8" />
                                            }
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.type === 'file' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const fileUrl = `https://juicewrldapi.com/juicewrld/stream?path=${encodeURIComponent(item.path)}`;
                                                        downloadFile(fileUrl, item.name);
                                                    }}
                                                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="font-black italic text-sm truncate uppercase group-hover:text-primary transition-colors">{item.name}</h4>
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                            {item.type === 'directory' ? 'Collection / Folder' :
                                                isVideo ? 'Video File / MP4' :
                                                    isAudio ? 'MPEG Audio Layer 3' :
                                                        'Unknown File Type'}
                                        </p>
                                    </div>

                                    {item.type === 'file' && (isAudio || isVideo) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); playByPath(item.path, item.name); }}
                                            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all active:scale-90"
                                            title={isVideo ? "Play Video" : "Play Audio"}
                                        >
                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                        </button>
                                    )}
                                </div>
                            )
                        })}

                    </div>
                )}
            </div>
        </div>
    );
};

export default FileExplorerView;
