import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Image as ImageIcon, Sparkles, Terminal, Code } from 'lucide-react';
import { AnimatedNode } from './AnimatedNode';
import { AnimatedConnection } from './AnimatedConnection';

export const HeroAnimation: React.FC = () => {
    // Flow State: 0 = Idle/Reset, 1 = Prompt->Process, 2 = Processing, 3 = Process->Output, 4 = Complete
    const [flowStage, setFlowStage] = useState(0);

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                // Reset
                setFlowStage(1);
                // Wait for travel to processor
                await new Promise(r => setTimeout(r, 2000));

                // Processing Stage
                setFlowStage(2);
                await new Promise(r => setTimeout(r, 2500));

                // Travel to output
                setFlowStage(3);
                await new Promise(r => setTimeout(r, 2000));

                // Show Result
                setFlowStage(4);
                await new Promise(r => setTimeout(r, 3000));

                // Quick fade out/reset
                setFlowStage(0);
                await new Promise(r => setTimeout(r, 500));
            }
        };

        sequence();
    }, []);

    return (
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center pointer-events-none select-none">
            {/* Subtle Grid Background for this specific Area */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* --- CONNECTIONS --- */}
            {/* Input -> Processor */}
            <AnimatedConnection
                startX={50} startY={250}
                endX={250} endY={250}
                isActive={flowStage === 1}
            />

            {/* Processor -> Image Output */}
            <AnimatedConnection
                startX={250} startY={250}
                endX={450} endY={150}
                isActive={flowStage === 3}
            />

            {/* Processor -> Code Output */}
            <AnimatedConnection
                startX={250} startY={250}
                endX={450} endY={350}
                isActive={flowStage === 3}
            />

            {/* --- NODES --- */}

            {/* 1. Input Node (Prompt) */}
            <AnimatedNode
                x={50} y={250}
                icon={Terminal}
                label="Prompt"
                isActive={flowStage === 1}
                delay={0}
            />

            {/* 2. Processor Node (AI Agent) */}
            <AnimatedNode
                x={250} y={250}
                icon={Brain}
                label="AI Core"
                isActive={flowStage === 2}
                delay={0.2}
            />

            {/* Processing Indicator floating above Processor */}
            <AnimatePresence>
                {flowStage === 2 && (
                    <motion.div
                        className="absolute text-orange-500 font-mono text-xs"
                        style={{ left: 250, top: 200 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        Thinking...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. Output Nodes */}
            <AnimatedNode
                x={450} y={150}
                icon={ImageIcon}
                label="Visual"
                isActive={flowStage === 4}
                delay={0.4}
            />

            <AnimatedNode
                x={450} y={350}
                icon={Code}
                label="Logic"
                isActive={flowStage === 4}
                delay={0.5}
            />

            {/* Result Popups */}
            <AnimatePresence>
                {flowStage === 4 && (
                    <>
                        {/* Image Result */}
                        <motion.div
                            className="absolute"
                            style={{ left: 500, top: 130 }}
                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-sm shadow-md flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-blue-50 opacity-50" />
                                <Sparkles className="absolute text-orange-500/50" />
                            </div>
                        </motion.div>

                        {/* Code Result */}
                        <motion.div
                            className="absolute"
                            style={{ left: 500, top: 330 }}
                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <div className="w-32 p-2 bg-gray-900 border border-black rounded-sm shadow-md">
                                <div className="space-y-1">
                                    <div className="h-1.5 w-full bg-gray-700 rounded-full opacity-50" />
                                    <div className="h-1.5 w-2/3 bg-orange-500 rounded-full opacity-80" />
                                    <div className="h-1.5 w-3/4 bg-gray-700 rounded-full opacity-50" />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
};
