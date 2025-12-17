/**
 * MediaCanvas - Main node-based canvas for NENECA media generation
 * Uses @xyflow/react for draggable, connectable nodes
 */
import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { NeuralBackground } from '../NeuralBackground';
import { TokenBalance } from '../TokenBalance';
import { CanvasToolbar } from './CanvasToolbar';
import { ImageNode, ImageNodeData } from './nodes/ImageNode';
import { VideoNode, VideoNodeData } from './nodes/VideoNode';

interface MediaCanvasProps {
    currentUser: User | null;
    onBack: () => void;
}

// Define custom node types
const nodeTypes: NodeTypes = {
    imageNode: ImageNode,
    videoNode: VideoNode,
};

// Initial node - spawn one ImageNode by default
const createInitialNodes = (): Node[] => [{
    id: 'image-1',
    type: 'imageNode',
    position: { x: 250, y: 150 },
    data: {
        prompt: '',
        model: 'black-forest-labs/flux-1.1-pro',
        aspectRatio: '1:1',
        resolution: '1080p',
        outputUrl: null,
        isGenerating: false,
        error: null,
    } as ImageNodeData & Record<string, unknown>,
}];

const initialEdges: Edge[] = [];

export const MediaCanvas: React.FC<MediaCanvasProps> = ({ currentUser, onBack }) => {
    const nodeIdRef = useRef(2); // Start from 2 since we have initial image-1
    const [nodes, setNodes] = useState<Node[]>(createInitialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect: OnConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    // Add new Image node
    const handleAddImageNode = useCallback(() => {
        const newNode: Node = {
            id: `image-${nodeIdRef.current++}`,
            type: 'imageNode',
            position: {
                x: Math.random() * 400 + 100,
                y: Math.random() * 300 + 100
            },
            data: {
                prompt: '',
                model: 'black-forest-labs/flux-1.1-pro',
                aspectRatio: '1:1',
                resolution: '1080p',
                outputUrl: null,
                isGenerating: false,
                error: null,
            } as ImageNodeData & Record<string, unknown>,
        };
        setNodes((nds) => [...nds, newNode]);
    }, []);

    // Add new Video node
    const handleAddVideoNode = useCallback(() => {
        const newNode: Node = {
            id: `video-${nodeIdRef.current++}`,
            type: 'videoNode',
            position: {
                x: Math.random() * 400 + 100,
                y: Math.random() * 300 + 100
            },
            data: {
                prompt: '',
                model: 'wan-video/wan-2.2-t2v-fast',
                aspectRatio: '16:9',
                duration: '5s',
                outputUrl: null,
                isGenerating: false,
                error: null,
            } as VideoNodeData & Record<string, unknown>,
        };
        setNodes((nds) => [...nds, newNode]);
    }, []);

    // Clear all nodes
    const handleClearCanvas = useCallback(() => {
        setNodes([]);
        setEdges([]);
        nodeIdRef.current = 1;
    }, []);

    // Custom styles for ReactFlow
    const proOptions = useMemo(() => ({ hideAttribution: true }), []);

    return (
        <div className="flex h-screen bg-black overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <NeuralBackground />
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 to-black/90 opacity-40 mix-blend-overlay" />
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative z-10">
                {/* Header */}
                <header className="border-b border-pink-900/30 bg-black/60 backdrop-blur-sm">
                    <div className="h-14 px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="text-pink-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={20} />
                                <span className="font-mono text-sm uppercase tracking-widest">Voltar</span>
                            </button>
                            <div className="h-6 w-px bg-pink-900/30" />
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-pink-400" size={18} />
                                <h1 className="font-display font-bold text-white">NENECA Canvas</h1>
                            </div>
                        </div>
                        {currentUser && <TokenBalance user={currentUser} />}
                    </div>
                </header>

                {/* ReactFlow Canvas */}
                <div className="flex-1 relative">
                    <CanvasToolbar
                        onAddImageNode={handleAddImageNode}
                        onAddVideoNode={handleAddVideoNode}
                        onClearCanvas={handleClearCanvas}
                    />

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        proOptions={proOptions}
                        fitView
                        fitViewOptions={{ padding: 0.5 }}
                        minZoom={0.3}
                        maxZoom={1.5}
                        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                        className="bg-transparent"
                    >
                        <Controls
                            className="!bg-zinc-900/80 !border-zinc-700 !rounded-lg !shadow-xl"
                            showInteractive={false}
                        />
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={20}
                            size={1}
                            color="rgba(255,255,255,0.1)"
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};
