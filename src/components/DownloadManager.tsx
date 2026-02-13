import React, { useState } from 'react';
import { Download, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { DownloadItem } from '../lib/types';
import { downloadFile, formatFileSize } from '../lib/utils';
import { clsx } from 'clsx';

interface DownloadManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ isOpen, onClose }) => {
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);

    const addDownload = (item: Omit<DownloadItem, 'id' | 'status' | 'progress'>) => {
        const newItem: DownloadItem = {
            ...item,
            id: Date.now().toString(),
            status: 'pending',
            progress: 0
        };

        setDownloads(prev => [...prev, newItem]);
        startDownload(newItem);
    };

    const startDownload = async (item: DownloadItem) => {
        try {
            setDownloads(prev => prev.map(d =>
                d.id === item.id ? { ...d, status: 'downloading' as const } : d
            ));

            await downloadFile(item.url, item.name);

            setDownloads(prev => prev.map(d =>
                d.id === item.id ? { ...d, status: 'completed' as const, progress: 100 } : d
            ));
        } catch (error) {
            setDownloads(prev => prev.map(d =>
                d.id === item.id ? { ...d, status: 'error' as const } : d
            ));
        }
    };

    const clearCompleted = () => {
        setDownloads(prev => prev.filter(d => d.status !== 'completed'));
    };

    const clearAll = () => {
        setDownloads([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-28 right-8 w-96 max-h-[500px] bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-black italic text-sm uppercase">Downloads</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {downloads.filter(d => d.status === 'completed').length} / {downloads.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {downloads.length > 0 && (
                        <button
                            onClick={clearCompleted}
                            className="text-xs font-bold text-white/40 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Download List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {downloads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                        <Download className="w-8 h-8 text-white/10 mb-2" />
                        <p className="text-white/20 text-xs font-bold">No downloads yet</p>
                    </div>
                ) : (
                    downloads.map(item => (
                        <div
                            key={item.id}
                            className="bg-white/5 rounded-2xl p-4 space-y-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs truncate">{item.name}</p>
                                    <p className="text-[10px] text-white/40 font-medium">
                                        {formatFileSize(item.size)}
                                    </p>
                                </div>

                                <div className="flex-shrink-0">
                                    {item.status === 'completed' && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                    {item.status === 'downloading' && (
                                        <Loader className="w-4 h-4 text-primary animate-spin" />
                                    )}
                                    {item.status === 'error' && (
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                            </div>

                            {item.status === 'downloading' && (
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-300"
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Export function to trigger downloads from other components
export const useDownloadManager = () => {
    const [isOpen, setIsOpen] = useState(false);

    const download = (url: string, name: string, path: string, size?: number) => {
        setIsOpen(true);
        // This would ideally be handled by a global state manager
        // For now, we'll use the direct download function
        downloadFile(url, name).catch(err => console.error('Download failed:', err));
    };

    return {
        isOpen,
        setIsOpen,
        download
    };
};

export default DownloadManager;
