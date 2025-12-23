/**
 * ImageNode - A draggable node for image generation
 * REFACTORED: Industrial Light Theme
 */
import React, { useState, useCallback, memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Image as ImageIcon, Loader2, Download, Settings, Zap } from 'lucide-react';
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
            const url = await generateImage({ prompt, model, aspectRatio, resolution });
            setOutputUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha na geração');
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, model, aspectRatio, resolution, isGenerating]);

    const currentModel = getImageModelById(model) || IMAGE_MODELS[0];
    const supportedResolutions = RESOLUTIONS.filter(r =>
        currentModel.supportsResolutions.includes(r.value as '720p' | '1080p' | '4k')
    );

    return (
        <div className="bg-white border border-black rounded-sm shadow-lg min-w-[300px] overflow-hidden">
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-black !border-2 !border-white" />

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <ImageIcon size={14} className="text-text-primary" />
                    <span className="text-xs font-mono uppercase tracking-wide font-bold text-text-primary">Imagem</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary font-mono">{currentModel.name}</span>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1 rounded-sm transition-colors ${showSettings ? 'bg-black text-white' : 'text-text-secondary hover:bg-gray-200'}`}
                    >
                        <Settings size={12} />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="px-3 py-3 border-b border-gray-200 bg-gray-50 space-y-3">
                    <div>
                        <label className="text-[9px] text-text-secondary uppercase tracking-widest font-mono">Modelo</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full mt-1 px-2 py-1.5 bg-white border border-gray-300 rounded-sm text-xs text-text-primary focus:border-black focus:outline-none font-mono"
                        >
                            {IMAGE_MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] text-text-secondary uppercase tracking-widest font-mono">Proporção</label>
                        <div className="flex gap-1 mt-1 flex-wrap">
                            {ASPECT_RATIOS.map(ar => (
                                <button
                                    key={ar.value}
                                    onClick={() => setAspectRatio(ar.value)}
                                    className={`px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors ${aspectRatio === ar.value
                                        ? 'bg-black border-black text-white'
                                        : 'bg-white border-gray-300 text-text-secondary hover:border-black'
                                        }`}
                                >
                                    {ar.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] text-text-secondary uppercase tracking-widest font-mono">Resolução</label>
                        <div className="flex gap-1 mt-1">
                            {supportedResolutions.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => setResolution(r.value)}
                                    className={`px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors ${resolution === r.value
                                        ? 'bg-black border-black text-white'
                                        : 'bg-white border-gray-300 text-text-secondary hover:border-black'
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt Input */}
            <div className="p-3">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva a imagem..."
                    className="w-full h-16 px-2 py-2 bg-gray-50 border border-gray-200 rounded-sm text-xs text-text-primary placeholder-text-secondary focus:border-black focus:outline-none resize-none font-sans"
                />
            </div>

            {/* Preview */}
            {(outputUrl || isGenerating || error) && (
                <div className="px-3 pb-3">
                    {isGenerating && (
                        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-sm border border-gray-200">
                            <Loader2 size={20} className="animate-spin text-text-secondary" />
                        </div>
                    )}
                    {error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-sm text-red-600 text-[10px] font-mono">{error}</div>
                    )}
                    {outputUrl && !isGenerating && (
                        <div className="relative group">
                            <img src={outputUrl} alt="Generated" className="w-full h-auto rounded-sm border border-gray-200" />
                            <a href={outputUrl} download target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 p-1.5 bg-white border border-black rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download size={12} className="text-text-primary" />
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Generate Button */}
            <div className="px-3 pb-3">
                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className={`w-full py-2 rounded-sm font-mono text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${!prompt.trim() || isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-black text-white hover:bg-gray-800'
                        }`}
                >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    <span>Gerar</span>
                </button>
            </div>

            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-accent !border-2 !border-white" />
        </div>
    );
};

export const ImageNode = memo(ImageNodeComponent);
