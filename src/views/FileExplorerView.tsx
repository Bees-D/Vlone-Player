import React, { useState, useEffect, useMemo } from 'react';
import {
    Folder, FileAudio, Film, ChevronRight, ChevronDown, Search, HardDrive,
    Download, Share2, Play, ArrowUpDown, ArrowUp, ArrowDown, FolderOpen,
    File, Grid, List as ListIcon, Home, RefreshCw
} from 'lucide-react';
import { api } from '../lib/api';
import { Folder as FolderType } from '../lib/types';
import { usePlayer } from '../context/PlayerContext';
import { getMediaType, formatFileSize, downloadFile } from '../lib/utils';
import { clsx } from 'clsx';

type SortField = 'name' | 'type' | 'size';
type SortDir = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const FileExplorerView: React.FC = () => {
    const [currentPath, setCurrentPath] = useState<string>('/');
    const [items, setItems] = useState<FolderType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [treeData, setTreeData] = useState<Record<string, FolderType[]>>({});
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const { playByPath, currentSong } = usePlayer();

    const loadFiles = async (path: string) => {
        setLoading(true);
        try {
            const folders = await api.browseFiles(path);
            setItems(folders);
            setTreeData(prev => ({ ...prev, [path]: folders }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles(currentPath);
    }, [currentPath]);

    // Load root tree data on mount
    useEffect(() => {
        loadFiles('/');
    }, []);

    const loadTreeFolder = async (path: string) => {
        if (treeData[path]) return; // Already loaded
        try {
            const folders = await api.browseFiles(path);
            setTreeData(prev => ({ ...prev, [path]: folders }));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTreeFolder = async (path: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
            await loadTreeFolder(path);
        }
        setExpandedFolders(newExpanded);
    };

    const breadcrumbs = currentPath.split('/').filter(Boolean);

    const navigateTo = (path: string) => {
        setCurrentPath(path);
        setSearchQuery('');
    };

    const goBack = () => {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        setCurrentPath('/' + parts.join('/'));
    };

    // Filter and sort items
    const processedItems = useMemo(() => {
        let filtered = items.filter(item =>
            !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.sort((a, b) => {
            // Directories first always
            if (a.type === 'directory' && b.type !== 'directory') return -1;
            if (a.type !== 'directory' && b.type === 'directory') return 1;

            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'type':
                    comparison = (a.type || '').localeCompare(b.type || '');
                    break;
                default:
                    comparison = a.name.localeCompare(b.name);
            }
            return sortDir === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [items, searchQuery, sortField, sortDir]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const getFileIcon = (item: FolderType) => {
        if (item.type === 'directory') return <FolderOpen className="w-5 h-5 text-primary" />;
        const mediaType = getMediaType(item.name);
        if (mediaType === 'video') return <Film className="w-5 h-5 text-purple-400" />;
        if (mediaType === 'audio') return <FileAudio className="w-5 h-5 text-accent" />;
        return <File className="w-5 h-5 text-white/30" />;
    };

    const getExtLabel = (name: string): string => {
        const ext = name.split('.').pop()?.toUpperCase();
        if (!ext) return '';
        const labels: Record<string, string> = {
            'MP3': 'MP3 Audio', 'WAV': 'WAV Audio', 'FLAC': 'FLAC Lossless',
            'M4A': 'AAC Audio', 'OGG': 'OGG Vorbis', 'OPUS': 'Opus Audio',
            'MP4': 'MP4 Video', 'WEBM': 'WebM Video', 'MOV': 'QuickTime',
            'AVI': 'AVI Video', 'MKV': 'Matroska Video',
        };
        return labels[ext] || `${ext} File`;
    };

    // Recursive tree node component
    const TreeNode: React.FC<{ item: FolderType; depth: number }> = ({ item, depth }) => {
        const isExpanded = expandedFolders.has(item.path);
        const isActive = currentPath === item.path;
        const children = treeData[item.path] || [];

        if (item.type !== 'directory') return null;

        return (
            <div>
                <button
                    onClick={() => {
                        navigateTo(item.path);
                        toggleTreeFolder(item.path);
                    }}
                    className={clsx(
                        "w-full flex items-center gap-2 py-1.5 pr-2 rounded-lg text-left transition-all text-xs",
                        isActive ? "bg-primary/20 text-primary" : "text-white/50 hover:bg-white/5 hover:text-white"
                    )}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    )}
                    <Folder className={clsx("w-3.5 h-3.5 flex-shrink-0", isActive ? "text-primary" : "text-white/30")} />
                    <span className="truncate font-medium">{item.name}</span>
                </button>
                {isExpanded && children.filter(c => c.type === 'directory').map(child => (
                    <TreeNode key={child.path} item={child} depth={depth + 1} />
                ))}
            </div>
        );
    };

    const selectItem = (path: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(path)) {
            newSelected.delete(path);
        } else {
            newSelected.add(path);
        }
        setSelectedItems(newSelected);
    };

    const downloadSelected = () => {
        selectedItems.forEach(path => {
            const item = items.find(i => i.path === path);
            if (item && item.type === 'file') {
                const fileUrl = `${api.BASE_URL}/files/download/?path=${encodeURIComponent(item.path)}`;
                downloadFile(fileUrl, item.name);
            }
        });
        setSelectedItems(new Set());
    };

    return (
        <div className="flex-1 flex h-full bg-[#0a0a0c] overflow-hidden">
            {/* Left Tree Panel */}
            <div className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-black/30">
                <div className="p-4 border-b border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Directory Tree</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    <button
                        onClick={() => navigateTo('/')}
                        className={clsx(
                            "w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left transition-all text-xs",
                            currentPath === '/' ? "bg-primary/20 text-primary" : "text-white/50 hover:bg-white/5"
                        )}
                    >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span className="font-bold">Root</span>
                    </button>
                    {(treeData['/'] || []).filter(i => i.type === 'directory').map(item => (
                        <TreeNode key={item.path} item={item} depth={1} />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Explorer Header */}
                <div className="p-4 md:p-6 border-b border-white/5 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <HardDrive className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black italic tracking-tighter">FILE EXPLORER</h2>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Raw Archive Access</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-white/5 rounded-lg border border-white/5 p-0.5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={clsx("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/30")}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={clsx("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-white/30")}
                                >
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {selectedItems.size > 0 && (
                                <button
                                    onClick={downloadSelected}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-xs font-bold"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download ({selectedItems.size})
                                </button>
                            )}

                            <button
                                onClick={() => loadFiles(currentPath)}
                                className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Search + Sort bar */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder="Search in this directory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => toggleSort('name')}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors",
                                sortField === 'name' ? "bg-white/10 border-white/10 text-white" : "border-white/5 text-white/40 hover:text-white"
                            )}
                        >
                            Name
                            {sortField === 'name' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>
                        <button
                            onClick={() => toggleSort('type')}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors",
                                sortField === 'type' ? "bg-white/10 border-white/10 text-white" : "border-white/5 text-white/40 hover:text-white"
                            )}
                        >
                            Type
                            {sortField === 'type' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-sm font-bold mt-4 overflow-x-auto pb-1">
                        <button
                            onClick={() => navigateTo('/')}
                            className="flex items-center gap-1 text-white/40 hover:text-white transition-colors flex-shrink-0"
                        >
                            <Home className="w-3.5 h-3.5" />
                            Root
                        </button>
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={idx}>
                                <ChevronRight className="w-3 h-3 text-white/10 flex-shrink-0" />
                                <button
                                    onClick={() => navigateTo('/' + breadcrumbs.slice(0, idx + 1).join('/'))}
                                    className={clsx(
                                        "transition-colors flex-shrink-0",
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
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-white/20 font-bold text-xs animate-pulse">Scanning Disk Structure...</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {currentPath !== '/' && (
                                <div
                                    onClick={goBack}
                                    className="group p-4 rounded-2xl border border-white/5 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <ChevronRight className="w-5 h-5 text-white/40 rotate-180" />
                                    </div>
                                    <span className="font-bold text-sm text-white/40 group-hover:text-white">Back</span>
                                </div>
                            )}

                            {processedItems.map((item, idx) => {
                                const mediaType = item.type === 'file' ? getMediaType(item.name) : 'unknown';
                                const isVideo = mediaType === 'video';
                                const isAudio = mediaType === 'audio';
                                const isCurrentlyPlaying = currentSong?.file_path === item.path || currentSong?.id === `file-${item.path}`;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => item.type === 'directory' ? navigateTo(item.path) : null}
                                        className={clsx(
                                            "group relative bg-[#121217] border rounded-2xl p-4 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden",
                                            isCurrentlyPlaying ? "border-primary/30 bg-primary/10" : "border-white/5"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                item.type === 'directory' ? "bg-primary/10" :
                                                    isVideo ? "bg-purple-500/10" :
                                                        isAudio ? "bg-accent/10" : "bg-white/5"
                                            )}>
                                                {item.type === 'directory' ?
                                                    <Folder className="w-7 h-7 text-primary fill-current" /> :
                                                    isVideo ? <Film className="w-7 h-7 text-purple-400" /> :
                                                        isAudio ? <FileAudio className="w-7 h-7 text-accent fill-current" /> :
                                                            <File className="w-7 h-7 text-white/30" />
                                                }
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.type === 'file' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const fileUrl = `${api.BASE_URL}/files/download/?path=${encodeURIComponent(item.path)}`;
                                                            downloadFile(fileUrl, item.name);
                                                        }}
                                                        className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white"
                                                        title="Download"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="font-black italic text-xs truncate uppercase group-hover:text-primary transition-colors">{item.name}</h4>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                                {item.type === 'directory' ? 'Folder' : getExtLabel(item.name)}
                                            </p>
                                        </div>

                                        {item.type === 'file' && (isAudio || isVideo) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); playByPath(item.path, item.name); }}
                                                className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all active:scale-90"
                                            >
                                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-0.5">
                            {/* Header Row */}
                            <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">
                                <div className="w-8" />
                                <div className="flex-1">Name</div>
                                <div className="w-32 hidden md:block">Type</div>
                                <div className="w-20" />
                            </div>

                            {currentPath !== '/' && (
                                <div
                                    onClick={goBack}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
                                >
                                    <div className="w-8 flex items-center justify-center">
                                        <ChevronRight className="w-4 h-4 text-white/20 rotate-180" />
                                    </div>
                                    <span className="flex-1 text-sm font-bold text-white/40 group-hover:text-white">..</span>
                                </div>
                            )}

                            {processedItems.map((item, idx) => {
                                const mediaType = item.type === 'file' ? getMediaType(item.name) : 'unknown';
                                const isPlayable = mediaType === 'audio' || mediaType === 'video';
                                const isCurrentlyPlaying = currentSong?.file_path === item.path || currentSong?.id === `file-${item.path}`;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => item.type === 'directory' ? navigateTo(item.path) : null}
                                        className={clsx(
                                            "group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
                                            isCurrentlyPlaying ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <div className="w-8 flex items-center justify-center">
                                            {getFileIcon(item)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={clsx(
                                                "text-sm font-bold truncate block",
                                                isCurrentlyPlaying ? "text-primary" : "group-hover:text-white"
                                            )}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="w-32 hidden md:block text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                            {item.type === 'directory' ? 'Folder' : getExtLabel(item.name)}
                                        </div>
                                        <div className="w-20 flex items-center justify-end gap-1">
                                            {item.type === 'file' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const fileUrl = `${api.BASE_URL}/files/download/?path=${encodeURIComponent(item.path)}`;
                                                        downloadFile(fileUrl, item.name);
                                                    }}
                                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {isPlayable && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); playByPath(item.path, item.name); }}
                                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-primary/20 rounded-lg text-white/30 hover:text-primary transition-all"
                                                >
                                                    <Play className="w-3.5 h-3.5 fill-current" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && processedItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Folder className="w-16 h-16 text-white/5 mb-4" />
                            <p className="text-white/20 font-black italic uppercase">
                                {searchQuery ? 'No matching files' : 'Empty Directory'}
                            </p>
                            <p className="text-white/10 text-xs mt-2">
                                {searchQuery ? 'Try a different search term' : 'This folder contains no files'}
                            </p>
                        </div>
                    )}

                    {/* Item Count Footer */}
                    {!loading && processedItems.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <span>
                                {processedItems.filter(i => i.type === 'directory').length} folders · {processedItems.filter(i => i.type === 'file').length} files
                            </span>
                            <span>{currentPath}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileExplorerView;
