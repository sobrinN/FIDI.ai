/**
 * MediaCanvas - Main node-based canvas for FIDI.ai media generation
 * Uses @xyflow/react for draggable, connectable nodes
 * REFACTORED: Industrial Light Theme
 */
import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
    ReactFlow,
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
import { ChevronLeft } from 'lucide-react';
import { User } from '../../types';
import { TokenBalance } from '../TokenBalance';
import { CanvasToolbar } from './CanvasToolbar';
import { ImageNode, ImageNodeData } from './nodes/ImageNode';
import { VideoNode, VideoNodeData } from './nodes/VideoNode';

interface MediaCanvasProps {
    currentUser: User | null;
    onBack: () => void;
}

const nodeTypes: NodeTypes = {
    imageNode: ImageNode,
    videoNode: VideoNode,
};

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
    const nodeIdRef = useRef(2);
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

    const handleClearCanvas = useCallback(() => {
        setNodes([]);
        setEdges([]);
        nodeIdRef.current = 1;
    }, []);

    const proOptions = useMemo(() => ({ hideAttribution: true }), []);

    return (
        <div className="flex h-screen bg-page text-text-primary overflow-hidden relative font-sans">
            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative z-10">
                {/* Header */}
                <header className="border-b border-black bg-white shadow-sm">
                    <div className="h-14 px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={18} />
                                <span className="font-mono text-xs uppercase tracking-widest font-bold">Voltar</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300" />
                            <h1 className="font-sans font-bold text-text-primary text-lg tracking-tight">
                                FIDI<span className="text-accent">.canvas</span>
                            </h1>
                        </div>

                        {/* Credits panel in header */}
                        {currentUser && (
                            <TokenBalance user={currentUser} compact />
                        )}
                    </div>
                </header>

                {/* ReactFlow Canvas */}
                <div className="flex-1 relative bg-page">
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
                        className="bg-page"
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={24}
                            size={1}
                            color="rgba(0, 0, 0, 0.15)"
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};
