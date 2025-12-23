import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedConnectionProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isActive?: boolean;
}

export const AnimatedConnection: React.FC<AnimatedConnectionProps> = ({
    startX,
    startY,
    endX,
    endY,
    isActive = false,
}) => {
    // Calculate control points for a smooth Bezier curve (industrial circuit style)
    const midX = (startX + endX) / 2;
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
            <svg className="w-full h-full overflow-visible">
                {/* Background Line */}
                <path
                    d={path}
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="4 4"
                />

                {/* Active Flowing Line */}
                {isActive && (
                    <>
                        <motion.path
                            d={path}
                            stroke="rgba(0,0,0,0.2)"
                            strokeWidth="1.5"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />

                        {/* Data Packet */}
                        <motion.circle
                            r="3"
                            fill="#F97316"
                            initial={{ offsetDistance: "0%" }}
                            animate={{ offsetDistance: "100%" }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                                repeatDelay: 0.5
                            }}
                            style={{ offsetPath: `path('${path}')` }}
                        />
                    </>
                )}
            </svg>
        </div>
    );
};
