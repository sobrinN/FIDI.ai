import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedNodeProps {
    icon?: LucideIcon;
    label?: string;
    x: number;
    y: number;
    isActive?: boolean;
    delay?: number;
}

export const AnimatedNode: React.FC<AnimatedNodeProps> = ({
    icon: Icon,
    label,
    x,
    y,
    isActive = false,
    delay = 0,
}) => {
    return (
        <motion.div
            className="absolute flex flex-col items-center gap-2 pointer-events-none"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
        >
            <div className="relative">
                {/* Active Pulse Effect */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full border border-orange-500/50"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                )}

                {/* Node Body */}
                <div className={`
          w-12 h-12 rounded-full flex items-center justify-center 
          bg-white border-2 transition-colors duration-500 z-10 relative
          ${isActive ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-gray-800'}
        `}>
                    {Icon && (
                        <Icon
                            size={20}
                            className={`transition-colors duration-500 ${isActive ? 'text-orange-500' : 'text-gray-800'}`}
                        />
                    )}
                </div>

                {/* Decorators */}
                <div className="absolute top-1/2 -left-1 w-2 h-2 bg-white border border-gray-800 rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white border border-gray-800 rounded-full -translate-y-1/2" />
            </div>

            {/* Label */}
            {label && (
                <motion.div
                    className="bg-white/90 border border-gray-200 px-2 py-1 rounded-sm shadow-sm backdrop-blur-sm"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.2 }}
                >
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        {label}
                    </span>
                </motion.div>
            )}
        </motion.div>
    );
};
