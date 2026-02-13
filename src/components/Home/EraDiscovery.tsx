import React from 'react';
import { Disc } from 'lucide-react';
import type { Era } from '../../lib/types';

interface EraDiscoveryProps {
    eras: Era[];
    onEraClick: (eraName: string) => void;
}

const EraDiscovery: React.FC<EraDiscoveryProps> = ({ eras, onEraClick }) => {
    return (
        <div className="mb-16">
            <h3 className="text-xl font-black mb-8 flex items-center gap-4">
                <Disc className="text-accent w-6 h-6 animate-spin-slow" />
                BROWSE BY ERA
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {eras.map((era) => (
                    <div
                        key={era.name}
                        onClick={() => onEraClick(era.name)}
                        className="bg-white/5 border border-white/5 rounded-3xl p-4 cursor-pointer hover:bg-white/10 hover:-translate-y-2 transition-all group"
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden bg-surface mb-4">
                            <img
                                src={era.image || `https://juicewrldapi.com/icons/og-image.png`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                alt={era.name}
                            />
                        </div>
                        <h4 className="font-black italic text-xs uppercase truncate tracking-tighter">{era.name}</h4>
                        <p className="text-[10px] font-bold text-white/30 uppercase mt-1">{era.year || '999'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EraDiscovery;
