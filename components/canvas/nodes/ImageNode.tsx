/**
 * ImageNode - A draggable node for image generation
 * Contains prompt input, model selector, and preview
 */
import React, { useState, useCallback, memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Image as ImageIcon, Loader2, Download, Settings, Sparkles } from 'lucide-react';
import { IMAGE_MODELS, ASPECT_RATIOS, RESOLUTIONS, getImageModelById } from '../../../config/mediaModels';
import { generateImage } from '../../../lib/apiClient';

export interface ImageNodeData {
    prompt: string;
    model: string;
    aspectRatio: string;
    resolution: string;
    outputUrl: string | null;
    isGenerating: boolean;
    error: string | null;
}

const ImageNodeComponent: React.FC<NodeProps> = ({ data }) => {
    const nodeData = data as unknown as ImageNodeData;
    const [prompt, setPrompt] = useState(nodeData.prompt || '');
    const [model, setModel] = useState(nodeData.model || IMAGE_MODELS[0].id);
    const [aspectRatio, setAspectRatio] = useState(nodeData.aspectRatio || '1:1');
    const [resolution, setResolution] = useState(nodeData.resolution || '1080p');
    const [isGenerating, setIsGenerating] = useState(false);
    const [outputUrl, setOutputUrl] = useState<string | null>(nodeData.outputUrl || null);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setError(null);

        try {
            const url = await generateImage({
                prompt,
                model,
                aspectRatio,
                resolution
            });
            setOutputUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, model, aspectRatio, resolution, isGenerating]);

    const currentModel = getImageModelById(model) || IMAGE_MODELS[0];
    const supportedResolutions = RESOLUTIONS.filter(r =>
        currentModel.supportsResolutions.includes(r.value as '720p' | '1080p' | '4k')
    );

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl min-w-[320px] overflow-hidden">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-4 !h-4 !bg-pink-500 !border-2 !border-zinc-800"
            />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800/50">
                <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-pink-400" />
                    <span className="text-sm font-semibold text-white">Image</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono">{currentModel.name}</span>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1 rounded transition-colors ${showSettings ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <Settings size={14} />
                    </button>
                </div>
            </div>

            {/* Settings Panel (Collapsible) */}
            {showSettings && (
                <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/30 space-y-3">
                    {/* Model Selector */}
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Model</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full mt-1 px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-sm text-white focus:border-pink-500 focus:outline-none"
                        >
                            {IMAGE_MODELS.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.badge})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Aspect Ratio</label>
                        <div className="flex gap-1 mt-1 flex-wrap">
                            {ASPECT_RATIOS.map(ar => (
                                <button
                                    key={ar.value}
                                    onClick={() => setAspectRatio(ar.value)}
                                    className={`px-2 py-1 text-xs rounded border transition-colors ${aspectRatio === ar.value
                                        ? 'bg-pink-500/20 border-pink-500 text-white'
                                        : 'bg-zinc-800 border-zinc-600 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                >
                                    {ar.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resolution */}
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Resolution</label>
                        <div className="flex gap-1 mt-1">
                            {supportedResolutions.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => setResolution(r.value)}
                                    className={`px-2 py-1 text-xs rounded border transition-colors ${resolution === r.value
                                        ? 'bg-pink-500/20 border-pink-500 text-white'
                                        : 'bg-zinc-800 border-zinc-600 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                    title={r.pixels}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt Input */}
            <div className="p-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none resize-none"
                />
            </div>

            {/* Preview Area */}
            {(outputUrl || isGenerating || error) && (
                <div className="px-4 pb-4">
                    {isGenerating && (
                        <div className="flex items-center justify-center h-40 bg-zinc-800/50 rounded-lg border border-zinc-700">
                            <div className="flex flex-col items-center gap-2 text-zinc-400">
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-xs">Generating...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    {outputUrl && !isGenerating && (
                        <div className="relative group">
                            <img
                                src={outputUrl}
                                alt="Generated"
                                className="w-full h-auto rounded-lg"
                            />
                            <a
                                href={outputUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Download size={14} className="text-white" />
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Generate Button */}
            <div className="px-4 pb-4">
                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${!prompt.trim() || isGenerating
                        ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500'
                        }`}
                >
                    {isGenerating ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Sparkles size={16} />
                    )}
                    <span>Generate</span>
                </button>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-4 !h-4 !bg-blue-500 !border-2 !border-zinc-800"
            />
        </div>
    );
};

export const ImageNode = memo(ImageNodeComponent);
