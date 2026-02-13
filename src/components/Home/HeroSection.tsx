import React from 'react';
import { Play, Radio } from 'lucide-react';
import type { Song, PlaybackMode } from '../../lib/types';

interface HeroSectionProps {
    songs: Song[];
    playSong: (song: Song, queue: Song[]) => void;
    setPlaybackMode: (mode: PlaybackMode) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ songs, playSong, setPlaybackMode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="col-span-1 md:col-span-2 relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
                <img
                    src="https://juicewrldapi.com/icons/og-image.png"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Juice WRLD"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Verified Vault</span>
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">999 Era</span>
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter mb-2 uppercase">UNRELEASED VAULT</h2>
                    <p className="text-white/60 font-semibold max-w-md">Access the complete archive of over 2,700 Juice WRLD tracks, leaked sessions, and high-quality masters.</p>
                    <button
                        onClick={() => { if (songs.length > 0) playSong(songs[0], songs); }}
                        className="mt-6 bg-white text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 self-start hover:scale-105 transition-transform active:scale-95"
                    >
                        <Play className="w-5 h-5 fill-current" /> STREAM NOW
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-primary/40 to-accent/40 rounded-3xl p-10 flex flex-col justify-center border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Radio className="w-32 h-32" />
                </div>
                <h3 className="text-3xl font-black italic mb-4 uppercase">999 Radio</h3>
                <p className="text-white/80 font-medium mb-8">Non-stop shuffle of every track in the database. Discover something new.</p>
                <button
                    onClick={() => setPlaybackMode('radio')}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/10 font-bold py-4 rounded-2xl hover:bg-black/60 transition-colors"
                >
                    START RADIO
                </button>
            </div>
        </div>
    );
};

export default HeroSection;
