import { memo } from 'react';
import { Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { Message, User } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
    msg: Message;
    currentUser: User | null;
}

export const ChatMessage = memo(({ msg, currentUser }: ChatMessageProps) => {
    const isUser = msg.role === 'user';

    return (
        <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-white text-black flex-shrink-0 mt-1 rounded-sm">
                    <span className="font-mono text-xs font-bold">AI</span>
                </div>
            )}

            <div className={`max-w-[85%] md:max-w-[75%] space-y-2`}>
                {/* Media Display */}
                {msg.media && (
                    <div className="mb-2 overflow-hidden border border-gray-200 bg-gray-50 rounded-sm">
                        {msg.media.type === 'image' ? (
                            <img src={msg.media.url} alt="Generated Content" className="w-full h-auto max-h-[400px] object-contain" />
                        ) : (
                            <video src={msg.media.url} controls className="w-full h-auto max-h-[400px]" />
                        )}
                        <div className="px-3 py-1.5 bg-gray-100 text-[10px] font-mono text-gray-500 flex justify-between tracking-wider border-t border-gray-200">
                            <span>{msg.media.type.toUpperCase()} GERADO</span>
                            <span>HD</span>
                        </div>
                    </div>
                )}

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 justify-end">
                        {msg.attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-sm px-3 py-2 text-xs text-text-primary">
                                {att.type.startsWith('image') ? <ImageIcon size={14} className="opacity-70" /> : <FileText size={14} className="opacity-70" />}
                                <span className="truncate max-w-[150px] font-mono">{att.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Text Content */}
                {msg.content && (
                    <div className={`p-5 rounded-sm transition-colors duration-200 ${isUser
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-text-primary'
                        }`}>
                        <div className={`prose prose-sm max-w-none leading-relaxed font-sans ${isUser ? 'prose-invert' : 'prose-neutral'}`}>
                            <MarkdownRenderer content={msg.content} />
                        </div>
                    </div>
                )}

                <p className={`text-[10px] font-mono text-text-secondary ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {isUser && (
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center flex-shrink-0 mt-1 rounded-sm">
                    <span className="text-xs font-bold font-mono">{currentUser?.name.charAt(0)}</span>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.msg.id === nextProps.msg.id &&
        prevProps.msg.content === nextProps.msg.content &&
        prevProps.msg.timestamp === nextProps.msg.timestamp &&
        prevProps.currentUser?.name === nextProps.currentUser?.name
    );
});

ChatMessage.displayName = 'ChatMessage';
