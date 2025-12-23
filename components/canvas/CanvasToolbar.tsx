/**
 * CanvasToolbar - Toolbar for spawning nodes and canvas controls
 * REFACTORED: Industrial Light Theme
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 bg-white border border-black shadow-md rounded-sm pointer-events-auto">
            {/* Add buttons */}
            <button
                onClick={onAddImageNode}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wide text-text-primary hover:bg-gray-100 rounded-sm transition-colors"
            >
                <ImageIcon size={14} />
                <span>Image</span>
                <Plus size={10} className="text-text-secondary" />
            </button>

            <div className="h-5 w-px bg-gray-200" />

            <button
                onClick={onAddVideoNode}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wide text-text-primary hover:bg-gray-100 rounded-sm transition-colors"
            >
                <Video size={14} />
                <span>Video</span>
                <Plus size={10} className="text-text-secondary" />
            </button>

            <div className="h-5 w-px bg-gray-200" />

            {/* Clear button */}
            <button
                onClick={onClearCanvas}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wide text-red-500 hover:bg-red-50 rounded-sm transition-colors"
            >
                <Trash2 size={14} />
                <span>Clear</span>
            </button>
        </div>
    );
};
