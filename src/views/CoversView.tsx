import React, { useState, useRef } from 'react';
import { ImagePlus, Trash2, Upload, Sparkles, User, Disc, Music, X } from 'lucide-react';
import { useCustomCovers, CustomCover } from '../hooks/useCustomCovers';
import { clsx } from 'clsx';

const CoversView: React.FC = () => {
    const { uploadCover, removeCover, getAllCovers, covers } = useCustomCovers();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadType, setUploadType] = useState<CustomCover['matchType']>('artist');
    const [uploadValue, setUploadValue] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const allCovers = getAllCovers();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image must be under 5MB');
            return;
        }

        setSelectedFile(file);
        setUploadError('');

        // Create preview
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadValue.trim()) {
            setUploadError('Please select a file and enter a match value');
            return;
        }

        try {
            await uploadCover(selectedFile, uploadType, uploadValue.trim());
            setShowUpload(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            setUploadValue('');
            setUploadError('');
        } catch (err: any) {
            setUploadError(err.message || 'Upload failed');
        }
    };

    const typeIcons: Record<string, React.ElementType> = {
        artist: User,
        album: Disc,
        song: Music,
        producer: Sparkles,
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                        <ImagePlus className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter">CUSTOM COVERS</h2>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Upload custom artwork for any artist, album, song, or producer</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowUpload(true)}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-colors active:scale-95"
                >
                    <Upload className="w-5 h-5" />
                    Upload Cover Art
                </button>
            </div>

            {/* How it works */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 mb-12">
                <h3 className="font-black italic text-lg mb-6 uppercase">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { type: 'artist', label: 'Artist Cover', desc: 'Replaces cover art for ALL songs by this artist', example: 'e.g. "Outsiders" → all Outsiders tracks get your custom art' },
                        { type: 'album', label: 'Album Cover', desc: 'Replaces cover art for ALL songs on this album', example: 'e.g. "Goodbye & Good Riddance"' },
                        { type: 'song', label: 'Song Cover', desc: 'Replaces cover art for a specific song', example: 'Highest priority — overrides artist/album' },
                        { type: 'producer', label: 'Producer Cover', desc: 'Replaces cover art for songs by this producer', example: 'e.g. "Nick Mira"' },
                    ].map(item => {
                        const Icon = typeIcons[item.type];
                        return (
                            <div key={item.type} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <Icon className="w-8 h-8 text-accent mb-4" />
                                <h4 className="font-black text-sm uppercase mb-2">{item.label}</h4>
                                <p className="text-xs text-white/50 mb-3">{item.desc}</p>
                                <p className="text-[10px] text-white/30 italic">{item.example}</p>
                            </div>
                        );
                    })}
                </div>
                <p className="mt-6 text-xs text-white/30 italic">💡 Supports animated images (GIF, WebP, APNG). Max 5MB per image. Stored locally in your browser.</p>
            </div>

            {/* Existing Covers */}
            <div>
                <h3 className="text-xl font-black mb-8 uppercase">
                    Your Custom Covers ({allCovers.length})
                </h3>

                {allCovers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <ImagePlus className="w-16 h-16 text-white/10 mb-4" />
                        <p className="text-white/30 font-bold text-sm mb-2">No custom covers yet</p>
                        <p className="text-white/20 text-xs">Upload your first custom cover art to personalize your experience</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {allCovers.map((cover, idx) => {
                            const Icon = typeIcons[cover.matchType] || User;
                            return (
                                <div key={idx} className="group bg-[#121217] border border-white/5 rounded-3xl overflow-hidden hover:border-accent/30 transition-all">
                                    <div className="aspect-square relative overflow-hidden">
                                        <img
                                            src={cover.dataUrl}
                                            alt={cover.matchValue}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        {cover.animated && (
                                            <div className="absolute top-3 right-3 bg-accent/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                                <span className="text-[8px] font-black uppercase">Animated</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeCover(cover.matchType, cover.matchValue)}
                                            className="absolute top-3 left-3 p-2 bg-red-500/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-3 h-3 text-accent" />
                                            <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{cover.matchType}</span>
                                        </div>
                                        <h4 className="font-black italic text-sm truncate uppercase">{cover.matchValue}</h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#121217] border border-white/10 rounded-3xl w-full max-w-lg p-8 space-y-6 relative">
                        <button
                            onClick={() => { setShowUpload(false); setPreviewUrl(null); setSelectedFile(null); setUploadError(''); }}
                            className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-lg"
                        >
                            <X className="w-5 h-5 text-white/40" />
                        </button>

                        <div>
                            <h3 className="text-2xl font-black italic tracking-tighter">UPLOAD COVER ART</h3>
                            <p className="text-xs text-white/40 mt-1">Supports PNG, JPG, GIF, WebP (including animated). Max 5MB.</p>
                        </div>

                        {/* Match Type */}
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Apply to</label>
                            <div className="flex gap-2">
                                {(['artist', 'album', 'song', 'producer'] as const).map(type => {
                                    const Icon = typeIcons[type];
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setUploadType(type)}
                                            className={clsx(
                                                "flex-1 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all",
                                                uploadType === type ? "bg-accent text-white" : "bg-white/5 text-white/40 hover:text-white"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Match Value */}
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">
                                {uploadType === 'artist' ? 'Artist Name' :
                                    uploadType === 'album' ? 'Album Name' :
                                        uploadType === 'song' ? 'Song Title' :
                                            'Producer Name'}
                            </label>
                            <input
                                type="text"
                                value={uploadValue}
                                onChange={(e) => setUploadValue(e.target.value)}
                                placeholder={uploadType === 'artist' ? 'e.g. Outsiders' : `Enter ${uploadType} name...`}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-accent/50 font-medium"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Image</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/10 hover:border-accent/40 rounded-2xl p-8 text-center cursor-pointer transition-colors"
                            >
                                {previewUrl ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <img src={previewUrl} className="w-32 h-32 object-cover rounded-xl" alt="Preview" />
                                        <p className="text-xs text-white/40">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <Upload className="w-8 h-8 text-white/20" />
                                        <p className="text-sm text-white/40 font-medium">Click to select an image</p>
                                        <p className="text-[10px] text-white/20">PNG, JPG, GIF, WebP</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/gif,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Error */}
                        {uploadError && (
                            <p className="text-red-400 text-xs font-bold">{uploadError}</p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || !uploadValue.trim()}
                            className={clsx(
                                "w-full py-4 rounded-2xl font-black text-sm uppercase transition-all",
                                selectedFile && uploadValue.trim()
                                    ? "bg-accent text-white hover:bg-accent/80 active:scale-95"
                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                            )}
                        >
                            Save Custom Cover
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoversView;
