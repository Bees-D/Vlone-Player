import React from 'react';
import { PlaybackMode } from '../lib/types';
import { Shuffle, List, Radio, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface PlaybackModeSelectorProps {
    mode: PlaybackMode;
    onChange: (mode: PlaybackMode) => void;
}

const PlaybackModeSelector: React.FC<PlaybackModeSelectorProps> = ({ mode, onChange }) => {
    const modes: Array<{ value: PlaybackMode; icon: React.ElementType; label: string; description: string }> = [
        {
            value: 'normal',
            icon: List,
            label: 'Normal',
            description: 'Play in order'
        },
        {
            value: 'shuffle',
            icon: Shuffle,
            label: 'Shuffle',
            description: 'Random order'
        },
        {
            value: 'smart-shuffle',
            icon: Sparkles,
            label: 'Smart Shuffle',
            description: 'Mix with Radio'
        },
        {
            value: 'radio',
            icon: Radio,
            label: '999 Radio',
            description: 'Continuous discovery'
        }
    ];

    return (
        <div className="flex items-center gap-2">
            {modes.map(({ value, icon: Icon, label, description }) => (
                <button
                    key={value}
                    onClick={() => onChange(value)}
                    className={clsx(
                        "group relative p-3 rounded-xl transition-all",
                        mode === value
                            ? "bg-primary text-white"
                            : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                    )}
                    title={description}
                >
                    <Icon className="w-5 h-5" />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        <p className="text-xs font-black uppercase">{label}</p>
                        <p className="text-[10px] text-white/60 font-medium">{description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default PlaybackModeSelector;
