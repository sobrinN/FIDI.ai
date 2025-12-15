import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { Send, Menu, Plus, MessageSquare, Settings, X, Sparkles, ChevronLeft, Trash2, Activity, Paperclip, Loader2, FileText, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { User, Message, Conversation, Attachment } from '../types';
import { NeuralBackground } from './NeuralBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS } from '../config/agents';
import { streamChatCompletion, generateImage, generateVideo, APIError } from '../lib/apiClient';
import { convertToOpenRouterHistory } from '../lib/historyUtils';
import DOMPurify from 'dompurify';
import { useFileAttachments } from '../hooks/useFileAttachments';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useConversations } from '../hooks/useConversations';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MESSAGE_LIMITS, UI } from '../config/constants';
import { TokenBalance } from './TokenBalance';
import { ModelSelector } from './ModelSelector';
import { getModelInfo } from '../config/models';

interface ChatInterfaceProps {
  onBack: () => void;
  currentUser: User | null;
}

/**
 * Sanitize user input to prevent XSS attacks
 * Strips all HTML tags and dangerous content
 */
const sanitizeInput = (input: string): string => {
  // DOMPurify with strict configuration
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed in user input
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true // Keep text content
  });
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, currentUser }) => {
  // Conversation state management hook
  const {
    conversations,
    currentId,
    setConversations,
    setCurrentId,
    updateConversation,
    deleteConversation
  } = useConversations(currentUser);

  const [selectedAgentId, setSelectedAgentId] = useState<keyof typeof AGENTS>('01');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isKeySet, setIsKeySet] = useState<boolean>(true);

  // File attachments hook
  const {
    attachments,
    isUploading,
    fileInputRef,
    handleFileSelect,
    removeAttachment,
    clearAttachments
  } = useFileAttachments();

  // Smart auto-scroll hook
  const { scrollContainerRef, messagesEndRef } = useAutoScroll({
    dependencies: [conversations, currentId, processingStatus],
    enabled: true
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Component mount/unmount lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    // Backend handles API keys now, just check if backend is reachable
    setIsKeySet(true);

    return () => {
      // Cleanup on unmount
      isMountedRef.current = false;
      isProcessingRef.current = false;

      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleSelectKey = () => {
    alert('Please ensure the backend server is running on port 3001');
  };

  // Sync selected agent and model with current chat - FIXED: Added conversations to dependency array
  useEffect(() => {
    if (currentId) {
      const conv = conversations.find(c => c.id === currentId);
      if (conv?.agentId && AGENTS[conv.agentId as keyof typeof AGENTS]) {
        setSelectedAgentId(conv.agentId as keyof typeof AGENTS);
      } else {
        setSelectedAgentId('01');
      }

      // Sync model selection from conversation
      if (conv?.modelId !== undefined) {
        setSelectedModel(conv.modelId);
      } else {
        setSelectedModel(null); // Use agent default
      }
    }
  }, [currentId, conversations]);

  // Memoized current conversation to avoid repeated lookups
  const currentConversation = useMemo(
    () => conversations.find(c => c.id === currentId),
    [conversations, currentId]
  );

  // Keep getCurrentConversation for compatibility but use memoized value
  const getCurrentConversation = useCallback(() => currentConversation, [currentConversation]);

  const currentAgent = AGENTS[selectedAgentId];

  // Model locking logic - lock model per conversation after first message
  const canChangeModel = !currentConversation || currentConversation.messages.length === 0;
  const isModelLocked = !canChangeModel;
  const modelLockReason = isModelLocked
    ? 'Model locked: conversation has messages. Start a new session to change models.'
    : undefined;

  const handleNewChat = () => {
    setCurrentId(null);
    setSelectedModel(null); // Reset model selection for new conversation
    clearAttachments();
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  // ========================================
  // Helper Functions for handleSend
  // ========================================

  /**
   * Creates a user message object
   */
  const createUserMessage = (content: string, attachmentsList: Attachment[]): Message => ({
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: Date.now(),
    attachments: [...attachmentsList]
  });

  /**
   * Creates an assistant message object
   */
  const createAssistantMessage = (
    content: string,
    media?: { type: 'image' | 'video'; url: string; mimeType: string }
  ): Message => ({
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content,
    timestamp: Date.now(),
    ...(media && { media })
  });

  /**
   * Handles image generation for NENECA agent
   */
  const handleImageGeneration = async (prompt: string, conversationId: string) => {
    setProcessingStatus('Generating high-resolution image...');

    try {
      const imageUrl = await generateImage(prompt);
      const aiMsg = createAssistantMessage('Image generated successfully.', {
        type: 'image',
        url: imageUrl,
        mimeType: 'image/png'
      });

      // Use functional update to ensure latest state
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, aiMsg],
            lastModified: Date.now()
          };
        }
        return conv;
      }));

      setProcessingStatus(null);
      setIsTyping(false);
    } catch (error) {
      console.error('Image generation error:', error);
      setProcessingStatus(null);
      setIsTyping(false);

      // Handle insufficient tokens error
      let errorMessage = `Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`;

      if (error instanceof APIError && error.code === 'INSUFFICIENT_TOKENS') {
        const daysText = currentUser?.daysUntilReset === 1 ? 'day' : 'days';
        errorMessage = `**Insufficient Tokens**\n\n` +
          `You don't have enough tokens to generate images. Your current balance is ${currentUser?.tokenBalance?.toLocaleString() || 0} tokens.\n\n` +
          `Your token balance will automatically reset in ${currentUser?.daysUntilReset || 0} ${daysText}.\n\n` +
          `Image generation typically uses 2,000-5,000 tokens depending on complexity.`;
      }

      // Show error message using functional update
      const errorMsg = createAssistantMessage(errorMessage);
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMsg],
            lastModified: Date.now()
          };
        }
        return conv;
      }));
    }
  };

  /**
   * Handles video generation for NENECA agent
   */
  const handleVideoGeneration = async (prompt: string, conversationId: string) => {
    setProcessingStatus('Rendering video (this may take a moment)...');

    try {
      const videoUrl = await generateVideo(prompt);
      const aiMsg = createAssistantMessage('Video rendered successfully.', {
        type: 'video',
        url: videoUrl,
        mimeType: 'video/mp4'
      });

      // Use functional update to ensure latest state
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, aiMsg],
            lastModified: Date.now()
          };
        }
        return conv;
      }));

      setProcessingStatus(null);
      setIsTyping(false);
    } catch (error) {
      console.error('Video generation error:', error);
      setProcessingStatus(null);
      setIsTyping(false);

      // Handle insufficient tokens error
      let errorMessage = `Error generating video: ${error instanceof Error ? error.message : 'Unknown error'}`;

      if (error instanceof APIError && error.code === 'INSUFFICIENT_TOKENS') {
        const daysText = currentUser?.daysUntilReset === 1 ? 'day' : 'days';
        errorMessage = `**Insufficient Tokens**\n\n` +
          `You don't have enough tokens to generate videos. Your current balance is ${currentUser?.tokenBalance?.toLocaleString() || 0} tokens.\n\n` +
          `Your token balance will automatically reset in ${currentUser?.daysUntilReset || 0} ${daysText}.\n\n` +
          `Video generation typically uses 5,000-10,000 tokens depending on length and complexity.`;
      }

      // Show error message using functional update
      const errorMsg = createAssistantMessage(errorMessage);
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMsg],
            lastModified: Date.now()
          };
        }
        return conv;
      }));
    }
  };

  /**
   * Handles text chat streaming with OpenRouter
   * @param conversationId - The ID of the conversation
   * @param previousMessages - Messages to include in the context
   * @param isNewConversation - If true, the conversation was just created and may not be in state yet
   */
  const handleTextChatStream = async (
    conversationId: string,
    previousMessages: Message[],
    isNewConversation: boolean = false
  ) => {
    const history = convertToOpenRouterHistory(previousMessages);
    let fullResponse = '';
    const tempAiMsgId = (Date.now() + 1).toString();

    // Add placeholder AI message using functional update to ensure latest state
    // FIXED: For new conversations, we need to handle the case where the conversation
    // might not be in state yet due to React's async state updates
    const placeholderMsg = createAssistantMessage('');
    setConversations(prev => {
      const existingConv = prev.find(c => c.id === conversationId);

      if (existingConv) {
        // Conversation exists in state - update it
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, { ...placeholderMsg, id: tempAiMsgId }],
              lastModified: Date.now()
            };
          }
          return conv;
        });
      } else if (isNewConversation) {
        // New conversation not yet in state - this shouldn't happen with proper ordering
        // but handle it gracefully by returning prev unchanged
        // The addConversation call should have added it before we get here
        console.warn('[ChatInterface] New conversation not found in state, will retry');
        return prev;
      }

      return prev;
    });

    // Stream chat completion with selected model or agent default
    const modelToUse = selectedModel || currentAgent.model;

    await streamChatCompletion({
      model: modelToUse,
      systemPrompt: currentAgent.systemPrompt,
      messages: history,
      onChunk: (text: string) => {
        if (!isMountedRef.current) return;
        fullResponse += text;
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            const msgs = [...conv.messages];
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.id === tempAiMsgId) {
              msgs[msgs.length - 1] = { ...lastMsg, content: fullResponse };
            }
            return { ...conv, messages: msgs };
          }
          return conv;
        }));
      },
      onComplete: () => {
        if (!isMountedRef.current) return;
        setIsTyping(false);
        setProcessingStatus(null);
      },
      onError: (error: Error) => {
        if (!isMountedRef.current) return;
        console.error('OpenRouter Error:', error);

        if (error.message?.includes('403') || error.message?.includes('401')) {
          setIsKeySet(false);
        }

        // Determine error message
        let errorContent: string;

        if (error instanceof APIError && error.code === 'INSUFFICIENT_TOKENS') {
          const daysText = currentUser?.daysUntilReset === 1 ? 'day' : 'days';
          errorContent = `**Insufficient Tokens**\n\n` +
            `You don't have enough tokens to send this message. Your current balance is ${currentUser?.tokenBalance?.toLocaleString() || 0} tokens.\n\n` +
            `Your token balance will automatically reset in ${currentUser?.daysUntilReset || 0} ${daysText}.\n\n` +
            `Each message typically uses 100-500 tokens depending on length and complexity.`;
        } else if (error.message?.includes('403') || error.message?.includes('401')) {
          errorContent = "Authentication error: Check your OPENROUTER_API_KEY in server/.env";
        } else {
          errorContent = `Connection error: ${error.message || 'Please try again.'}`;
        }

        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            const msgs = [...conv.messages];
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...lastMsg,
                content: errorContent
              };
            }
            return { ...conv, messages: msgs };
          }
          return conv;
        }));

        setIsTyping(false);
        setProcessingStatus(null);
      }
    });
  };

  // ========================================
  // Main Send Handler (Refactored)
  // ========================================

  const handleSend = async () => {
    // Validation
    if (!input.trim() && attachments.length === 0) return;
    if (isProcessingRef.current) return;

    // Check message count limit
    const currentConv = getCurrentConversation();
    if (currentConv && currentConv.messages.length >= MESSAGE_LIMITS.MAX_MESSAGES_PER_CONVERSATION) {
      alert(`Maximum ${MESSAGE_LIMITS.MAX_MESSAGES_PER_CONVERSATION} messages per conversation reached. Please start a new conversation.`);
      return;
    }

    // Check low balance warning (< 1000 tokens)
    if (currentUser?.tokenBalance !== undefined && currentUser.tokenBalance < 1000) {
      const daysText = currentUser.daysUntilReset === 1 ? 'day' : 'days';
      const confirmed = window.confirm(
        `Low token balance (${currentUser.tokenBalance.toLocaleString()} tokens remaining).\n\n` +
        `Your balance will reset in ${currentUser.daysUntilReset} ${daysText}.\n\n` +
        `Do you want to continue?`
      );
      if (!confirmed) return;
    }

    isProcessingRef.current = true;

    try {
      // Sanitize and create user message
      const sanitizedInput = sanitizeInput(input.trim());
      const userMsg = createUserMessage(sanitizedInput, attachments);

      // Create or update conversation
      let conversationId = currentId;
      let previousMessages: Message[];
      let isNewConversation = false;

      if (!conversationId) {
        // New conversation: create with the user message
        isNewConversation = true;
        const now = Date.now();
        conversationId = now.toString();
        const newConv: Conversation = {
          id: conversationId,
          title: sanitizedInput.length > UI.TITLE_MAX_LENGTH
            ? sanitizedInput.substring(0, UI.TITLE_MAX_LENGTH) + '...'
            : (attachments.length > 0 ? "File Attached" : "New Conversation"),
          messages: [userMsg],
          lastModified: now,
          agentId: selectedAgentId,
          modelId: selectedModel || undefined, // Lock model on first message
          createdAt: now,
          updatedAt: now
        };

        // Add the conversation to state
        // FIXED: Use flushSync to ensure state updates are committed synchronously
        // before we try to stream the response. This prevents race conditions where
        // the conversation might not be in state when streaming handlers update it.
        flushSync(() => {
          setConversations(prev => [newConv, ...prev]);
          setCurrentId(conversationId);
        });

        previousMessages = [userMsg];
      } else {
        // Existing conversation: add user message using functional update
        // Capture messages before the update for history
        const existingConv = conversations.find(c => c.id === conversationId);
        previousMessages = existingConv ? [...existingConv.messages, userMsg] : [userMsg];

        // Use functional update to add the message to the conversation
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, userMsg],
              lastModified: Date.now(),
              updatedAt: Date.now(),
              // Lock model on first message if not already set
              modelId: conv.modelId || selectedModel || undefined
            };
          }
          return conv;
        }));
      }

      // Clear input and prepare for response
      setInput('');
      clearAttachments();
      setIsTyping(true);

      // Route to appropriate handler based on agent and keywords
      if (selectedAgentId === '04') {
        const lowerInput = input.toLowerCase();
        const imageKeywords = ['imagem', 'foto', 'desenho', 'picture', 'image'];
        const videoKeywords = ['video', 'animation', 'filme', 'movie'];

        if (imageKeywords.some(kw => lowerInput.includes(kw))) {
          await handleImageGeneration(input, conversationId);
          return;
        }

        if (videoKeywords.some(kw => lowerInput.includes(kw))) {
          await handleVideoGeneration(input, conversationId);
          return;
        }
      }

      // Default: regular text chat
      // FIXED: Pass isNewConversation flag to handle potential state timing issues
      await handleTextChatStream(conversationId, previousMessages, isNewConversation);

    } catch (error) {
      console.error("Error in handleSend:", error);
      setIsTyping(false);
      setProcessingStatus(null);
    } finally {
      isProcessingRef.current = false;
    }
  };

  // Handle Agent Switching
  const handleAgentSwitch = (agentId: keyof typeof AGENTS) => {
    const currentConv = getCurrentConversation();
    if (!currentId || (currentConv?.messages.length || 0) <= 1) {
      setSelectedAgentId(agentId);
      if (currentId) {
        updateConversation(currentId, { agentId });
      }
    } else {
      handleNewChat();
      setSelectedAgentId(agentId);
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
       {/* Background */}
       <div className="absolute inset-0 z-0">
         <NeuralBackground />
         <div className={`absolute inset-0 bg-gradient-to-br ${currentAgent.bgGradient} to-black/90 opacity-40 mix-blend-overlay transition-colors duration-1000`} />
       </div>

       {/* API Key Modal Overlay */}
       <AnimatePresence>
         {!isKeySet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
               <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-blue-500/30 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  <ShieldAlert className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-pulse" />
                  <h2 className="font-display text-2xl text-white mb-2">Server Unavailable</h2>
                  <p className="font-sans text-blue-200 mb-8 leading-relaxed">
                    The backend server is not responding.<br/>
                    Start the server in: server/ with 'npm run dev'<br/>
                    Default port: 3001
                  </p>

                  <button
                    onClick={handleSelectKey}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 group"
                  >
                    <Activity size={20} />
                    VIEW INSTRUCTIONS
                  </button>
                  <p className="mt-4 text-xs text-blue-500/60 font-mono">
                    FIDI API Server at localhost:3001
                  </p>
               </div>
            </motion.div>
         )}
       </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-black/80 backdrop-blur-xl border-r border-blue-900/30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-4 border-b border-blue-900/30 flex justify-between items-center">
          <button onClick={onBack} className="text-blue-400 hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft size={16} />
            <span className="font-mono text-xs uppercase tracking-widest">Back</span>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Token Balance Display */}
        {currentUser && (
          <div className="p-4 border-b border-blue-900/30">
            <TokenBalance user={currentUser} />
          </div>
        )}

        {/* Model Selector */}
        <div className="p-4 border-b border-blue-900/30">
          <h3 className="font-mono text-xs text-blue-500 uppercase tracking-widest mb-3 px-2">
            AI Model
          </h3>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isModelLocked}
            lockedReason={modelLockReason}
            defaultModel={currentAgent.model}
          />

          {/* Model info display */}
          {selectedModel && (
            <div className="mt-3 px-2">
              <div className="flex items-start gap-2 p-2 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                <Sparkles size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs text-blue-300 font-semibold">
                    {getModelInfo(selectedModel)?.displayName}
                  </p>
                  <p className="font-sans text-[10px] text-gray-400 leading-tight mt-0.5">
                    {getModelInfo(selectedModel)?.costMultiplier === 0
                      ? 'Unlimited usage - no token cost'
                      : `${getModelInfo(selectedModel)?.costMultiplier}x token cost multiplier`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agent Selector */}
        <div className="p-4 border-b border-blue-900/30">
          <h3 className="font-mono text-xs text-blue-500 uppercase tracking-widest mb-3 px-2">Active Agent</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(AGENTS).map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSwitch(agent.id as keyof typeof AGENTS)}
                className={`relative group p-2 rounded-lg border transition-all duration-300 ${
                  selectedAgentId === agent.id
                    ? `${agent.borderColor} bg-blue-900/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                    : 'border-transparent hover:bg-white/5'
                }`}
                title={agent.name}
              >
                <div className={`flex justify-center ${selectedAgentId === agent.id ? agent.color : 'text-gray-500 group-hover:text-gray-300'}`}>
                  <agent.icon size={20} />
                </div>
                {selectedAgentId === agent.id && (
                  <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${agent.color.replace('text-', 'bg-')} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.color.replace('text-', 'bg-')}`}></span>
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 px-2">
            <h4 className={`font-display font-bold text-lg ${currentAgent.color}`}>{currentAgent.name}</h4>
            <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wide">{currentAgent.role}</p>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-500/30 text-blue-100 rounded-lg transition-all duration-200 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-sans font-medium text-sm">New Session</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-blue-900/50">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => { setCurrentId(conv.id); setIsSidebarOpen(false); }}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentId === conv.id
                  ? 'bg-blue-900/20 border border-blue-500/30 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <MessageSquare size={16} className={currentId === conv.id ? currentAgent.color : 'text-gray-600'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-[10px] opacity-50 font-mono mt-0.5">
                   {new Date(conv.lastModified).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {conv.agentId ? AGENTS[conv.agentId as keyof typeof AGENTS].name : 'FIDI'}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {currentUser && (
          <div className="p-4 border-t border-blue-900/30 bg-black/40">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-500/30">
                  <span className="font-display font-bold text-xs">{currentUser.name.substring(0, 2).toUpperCase()}</span>
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                 <p className="text-[10px] text-blue-400 font-mono truncate">{currentUser.email}</p>
               </div>
               <Settings size={14} className="text-gray-500 hover:text-white cursor-pointer" />
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-blue-900/30 bg-black/40 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-blue-400">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${isKeySet ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
               <span className="font-mono text-xs text-blue-400 tracking-widest uppercase">
                 {currentAgent.name} v.2.0 // {isKeySet ? 'CONNECTED' : 'AWAITING KEY'}
               </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-blue-900/30">
          {!currentId && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <currentAgent.icon size={64} className={`${currentAgent.color} mb-6 opacity-80`} strokeWidth={1} />
              <h2 className="font-display text-2xl md:text-4xl font-bold text-white mb-2">
                SYSTEM <span className={currentAgent.color}>{currentAgent.name}</span> READY
              </h2>
              <p className="font-sans text-blue-200 max-w-md leading-relaxed">
                {currentAgent.id === '04'
                  ? "Visual generation engine active. Type a prompt to create images or videos."
                  : "Awaiting input for processing. Type a command to start."}
              </p>
            </div>
          )}

          {getCurrentConversation()?.messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 mt-1 ${currentAgent.borderColor} bg-black text-white`}>
                   <currentAgent.icon size={16} />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] space-y-2`}>

                {/* Media Display (Images/Videos) */}
                {msg.media && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-blue-500/30 bg-black/50">
                    {msg.media.type === 'image' ? (
                       <img src={msg.media.url} alt="Generated Content" className="w-full h-auto max-h-[400px] object-contain" />
                    ) : (
                       <video src={msg.media.url} controls className="w-full h-auto max-h-[400px]" />
                    )}
                    <div className="px-3 py-1 bg-blue-900/20 text-[10px] font-mono text-blue-300 flex justify-between">
                       <span>{msg.media.type.toUpperCase()} GENERATED BY {currentAgent.name}</span>
                       <span>HD</span>
                    </div>
                  </div>
                )}

                {/* User Attachments Display */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 justify-end">
                     {msg.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/20 rounded px-3 py-2 text-xs text-blue-200">
                           {att.type.startsWith('image') ? <ImageIcon size={14} /> : <FileText size={14} />}
                           <span className="truncate max-w-[150px]">{att.name}</span>
                        </div>
                     ))}
                  </div>
                )}

                {/* Text Content */}
                {msg.content && (
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm backdrop-blur-sm'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed font-sans markdown-content">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                )}

                <p className={`text-[10px] font-mono opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1 border border-white/10">
                   <span className="text-xs font-bold">{currentUser?.name.charAt(0)}</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator / Processing Status */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                 className="flex gap-4 justify-start"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 mt-1 ${currentAgent.borderColor} bg-black text-white`}>
                   <currentAgent.icon size={16} />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
                  {processingStatus ? (
                    <>
                      <Loader2 className={`animate-spin ${currentAgent.color}`} size={16} />
                      <span className="text-xs font-mono text-blue-200 animate-pulse">{processingStatus}</span>
                    </>
                  ) : (
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                        className={`w-2 h-2 ${currentAgent.color.replace('text-', 'bg-')} rounded-full`}
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        className={`w-2 h-2 ${currentAgent.color.replace('text-', 'bg-')} rounded-full`}
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                        className={`w-2 h-2 ${currentAgent.color.replace('text-', 'bg-')} rounded-full`}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-black/80 backdrop-blur-xl border-t border-blue-900/30">

          {/* Attachment Preview Area */}
          {attachments.length > 0 && (
            <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
               {attachments.map((att, i) => (
                  <div key={i} className="relative group bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 w-24 h-24 flex flex-col items-center justify-center gap-1">
                     <button
                       onClick={() => removeAttachment(i)}
                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <X size={10} />
                     </button>
                     {att.type.startsWith('image') ? (
                       <img src={`data:${att.type};base64,${att.data}`} alt="preview" className="w-full h-full object-cover rounded" />
                     ) : (
                       <FileText className="text-blue-400" size={24} />
                     )}
                     <span className="text-[9px] text-blue-200 truncate w-full text-center">{att.name}</span>
                  </div>
               ))}
            </div>
          )}

          <div className="relative max-w-4xl mx-auto flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept={currentAgent.id === '04' ? "image/*,video/*" : ".pdf,.txt,.md,.csv"}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`p-3 rounded-lg transition-colors border ${
                isUploading
                  ? 'text-gray-500 cursor-not-allowed border-transparent'
                  : 'text-blue-500 hover:text-white hover:bg-blue-900/30 border-transparent hover:border-blue-500/30'
              }`}
              title={isUploading ? "Processing file..." : "Attach file"}
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={currentAgent.id === '04' ? "Describe the image or video you want to generate..." : "Type your command..."}
                className="w-full bg-white/5 border border-white/10 hover:border-blue-500/30 focus:border-blue-500 rounded-xl py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all font-sans"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                 {isTyping ? (
                   <Loader2 className="animate-spin text-blue-500" size={20} />
                 ) : (
                   <Sparkles size={16} className={`opacity-20 ${currentAgent.color}`} />
                 )}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || isTyping}
              className={`p-4 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center ${
                input.trim() || attachments.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:scale-105'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-center mt-3">
             <p className="font-mono text-[10px] text-gray-600 uppercase">
               FIDI.ai may generate inaccurate information. Verify important data.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
