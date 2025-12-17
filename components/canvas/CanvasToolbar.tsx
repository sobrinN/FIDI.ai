/**
 * CanvasToolbar - Toolbar for spawning nodes and canvas controls
 */
import React from 'react';
import { Image as ImageIcon, Video, Plus, Trash2 } from 'lucide-react';

interface CanvasToolbarProps {
    onAddImageNode: () => void;
    onAddVideoNode: () => void;
    onClearCanvas: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
    onAddImageNode,
    onAddVideoNode,
    onClearCanvas
}) => {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-2xl">
            {/* Add buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onAddImageNode}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors group"
                >
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-pink-500/20 text-pink-400 group-hover:bg-pink-500/30">
                        <ImageIcon size={12} />
                    </div>
                    <span>Image</span>
                    <Plus size={12} className="text-zinc-500" />
                </button>

                <button
                    onClick={onAddVideoNode}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors group"
                >
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30">
                        <Video size={12} />
                    </div>
                    <span>Video</span>
                    <Plus size={12} className="text-zinc-500" />
                </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-zinc-700" />

            {/* Clear button */}
            <button
                onClick={onClearCanvas}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
                <Trash2 size={14} />
                <span>Clear</span>
            </button>
        </div>
    );
};
