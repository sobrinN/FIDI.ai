import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Menu, Plus, MessageSquare, Settings, X, Sparkles, ChevronLeft, Trash2, Paperclip, Loader2, FileText } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { User, Message, Conversation, Attachment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { streamChatCompletion } from '../lib/apiClient';
import { convertToOpenRouterHistory } from '../lib/historyUtils';
import DOMPurify from 'dompurify';
import { useFileAttachments } from '../hooks/useFileAttachments';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useConversations } from '../hooks/useConversations';
import { MESSAGE_LIMITS, UI } from '../config/constants';
import { TokenBalance } from './TokenBalance';
import { ModelSelector } from './ModelSelector';
import { ALL_SELECTABLE_MODELS } from '../config/models';
import { MediaCanvas } from './canvas/MediaCanvas';

interface ChatInterfaceProps {
  onBack: () => void;
  currentUser: User | null;
  onUpgradeClick?: () => void;
}

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, currentUser, onUpgradeClick }) => {
  const {
    conversations,
    currentId,
    isInitialized,
    setConversations,
    setCurrentId,
    deleteConversation,
    saveConversations
  } = useConversations(currentUser);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fallbackNotification, setFallbackNotification] = useState<{ primaryModel: string; actualModel: string; message: string } | null>(null);
  const [showMediaCanvas, setShowMediaCanvas] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    attachments,
    isUploading,
    fileInputRef,
    handleFileSelect,
    removeAttachment,
    clearAttachments
  } = useFileAttachments();

  const { scrollContainerRef, messagesEndRef } = useAutoScroll({
    dependencies: [conversations, currentId, isTyping],
    enabled: true
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // DEBUG: Persistent logging helper (survives page reload)
  const debugLog = (message: string) => {
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logs.push({ time: new Date().toISOString(), message: `[Chat] ${message}` });
    if (logs.length > 50) logs.shift();
    localStorage.setItem('debug_logs', JSON.stringify(logs));
    console.log(`[DEBUG Chat] ${message}`);
  };

  useEffect(() => {
    debugLog('Component MOUNTED');
    isMountedRef.current = true;
    return () => {
      debugLog('Component UNMOUNTING');
      isMountedRef.current = false;
      isProcessingRef.current = false;
    };
  }, []);

  // DEBUG: Track currentUser changes
  useEffect(() => {
    debugLog(`currentUser changed: ${currentUser?.id} balance: ${currentUser?.creditBalance}`);
  }, [currentUser]);

  // DEBUG: Track conversations changes
  // useEffect(() => {
  //   debugLog(`conversations changed, count: ${conversations.length} currentId: ${currentId}`);
  // }, [conversations, currentId]);

  useEffect(() => {
    if (currentId) {
      const conv = conversations.find(c => c.id === currentId);
      if (conv?.modelId !== undefined) {
        setSelectedModel(conv.modelId);
      } else {
        setSelectedModel(null);
      }
    }
  }, [currentId, conversations]);

  const currentConversation = useMemo(
    () => conversations.find(c => c.id === currentId),
    [conversations, currentId]
  );

  const defaultModel = ALL_SELECTABLE_MODELS[0]?.id || 'mistralai/devstral-2512:free';
  const canChangeModel = !currentConversation || currentConversation.messages.length === 0;
  const isModelLocked = !canChangeModel;
  const modelLockReason = isModelLocked
    ? 'Modelo bloqueado: conversa iniciada.'
    : undefined;

  const handleNewChat = () => {
    setCurrentId(null);
    setSelectedModel(null);
    clearAttachments();
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  const createUserMessage = (content: string, attachmentsList: Attachment[]): Message => ({
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: Date.now(),
    attachments: [...attachmentsList]
  });

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

  const handleTextChatStream = async (
    conversationId: string,
    previousMessages: Message[],
    isNewConversation: boolean = false
  ) => {
    const history = convertToOpenRouterHistory(previousMessages);
    let fullResponse = '';
    const tempAiMsgId = (Date.now() + 1).toString();

    const placeholderMsg = createAssistantMessage('');
    setConversations(prev => {
      const existingConv = prev.find(c => c.id === conversationId);

      if (existingConv) {
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
      }
      return prev;
    });

    const modelToUse = selectedModel || defaultModel;

    await streamChatCompletion({
      model: modelToUse,
      systemPrompt: '',
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
        debugLog('Stream COMPLETE');
        if (!isMountedRef.current) {
          debugLog('Stream complete but component unmounted!');
          return;
        }

        // WORKAROUND: Force immediate save to prevent data loss if page subsequently reloads
        // This ensures the full response is persisted before any potential crash
        saveConversations();

        // Use timeout to break the call stack and allow render cycle to complete
        // This helps prevent "maximum update depth" or layout thrashing crashes
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsTyping(false);
            debugLog('Set isTyping to false (async)');
          }
        }, 100);
      },
      onFallback: (primaryModel: string, actualModel: string, message: string) => {
        debugLog(`Fallback: ${primaryModel} -> ${actualModel}`);
        setFallbackNotification({ primaryModel, actualModel, message });
        setTimeout(() => setFallbackNotification(null), 10000);
      },
      onError: (error: Error) => {
        debugLog(`Stream ERROR: ${error.message}`);
        if (!isMountedRef.current) {
          debugLog('Stream error but component unmounted!');
          return;
        }
        console.error('OpenRouter Error:', error);

        // Simplified error handling for brevity, preserving logic
        const errorContent = `**Erro**: ${error.message || 'Ocorreu um erro inesperado.'}`;

        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            const msgs = [...conv.messages];
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.role === 'assistant') {
              msgs[msgs.length - 1] = { ...lastMsg, content: errorContent };
            }
            return { ...conv, messages: msgs };
          }
          return conv;
        }));

        setIsTyping(false);
        debugLog('Set isTyping to false after error');
      }
    });
  };

  const handleSend = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    // PREVENT RELOAD: Stop propagation and default behavior to avoid implicit form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!input.trim() && attachments.length === 0) return;
    if (isProcessingRef.current) return;

    const currentConv = currentConversation;
    if (currentConv && currentConv.messages.length >= MESSAGE_LIMITS.MAX_MESSAGES_PER_CONVERSATION) {
      setErrorMessage(`Limite de ${MESSAGE_LIMITS.MAX_MESSAGES_PER_CONVERSATION} mensagens atingido.`);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    isProcessingRef.current = true;

    try {
      const sanitizedInput = sanitizeInput(input.trim());
      const userMsg = createUserMessage(sanitizedInput, attachments);

      let conversationId = currentId;
      let previousMessages: Message[];
      let isNewConversation = false;

      if (!conversationId) {
        isNewConversation = true;
        const now = Date.now();
        conversationId = now.toString();
        const newConv: Conversation = {
          id: conversationId,
          title: sanitizedInput.length > UI.TITLE_MAX_LENGTH
            ? sanitizedInput.substring(0, UI.TITLE_MAX_LENGTH) + '...'
            : (attachments.length > 0 ? "Arquivo Anexado" : "Nova Conversa"),
          messages: [userMsg],
          lastModified: now,
          modelId: selectedModel || undefined,
          createdAt: now,
          updatedAt: now
        };

        setConversations(prev => [newConv, ...prev]);
        setCurrentId(conversationId);
        previousMessages = [userMsg];
      } else {
        const existingConv = conversations.find(c => c.id === conversationId);
        previousMessages = existingConv ? [...existingConv.messages, userMsg] : [userMsg];

        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, userMsg],
              lastModified: Date.now(),
              updatedAt: Date.now(),
              modelId: conv.modelId || selectedModel || undefined
            };
          }
          return conv;
        }));
      }

      setInput('');
      clearAttachments();
      setIsTyping(true);
      await handleTextChatStream(conversationId, previousMessages, isNewConversation);

    } catch (error) {
      console.error("Error in handleSend:", error);
      setIsTyping(false);
    } finally {
      isProcessingRef.current = false;
    }
  };

  if (showMediaCanvas) {
    return <MediaCanvas currentUser={currentUser} onBack={() => setShowMediaCanvas(false)} />;
  }

  return (
    <div className="flex h-screen bg-page text-text-primary overflow-hidden relative font-sans">

      {/* Fallback Notification */}
      <AnimatePresence>
        {fallbackNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-lg"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 shadow-lg text-amber-900">
              <span className="font-bold">Fallback: </span> {fallbackNotification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-lg"
          >
            <div className="bg-red-50 border border-red-200 rounded-sm p-4 shadow-lg text-red-900">
              <span className="font-bold">Erro: </span> {errorMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <button type="button" onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            <ChevronLeft size={16} />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">Retornar</span>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        {currentUser && (
          <div className="p-4 border-b border-gray-200">
            <TokenBalance user={currentUser} onUpgradeClick={onUpgradeClick} />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden p-3 bg-white">
          <h3 className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mb-2 px-1">
            Modelo
          </h3>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isModelLocked}
            lockedReason={modelLockReason}
            onMediaClick={() => setShowMediaCanvas(true)}
          />
        </div>

        {currentUser && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm">
                <span className="font-mono font-bold text-xs">{currentUser.name.substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary truncate">{currentUser.name}</p>
                <p className="text-[10px] text-text-secondary font-mono truncate">{currentUser.email}</p>
              </div>
              <Settings size={14} className="text-text-secondary hover:text-black cursor-pointer" />
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 bg-page">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow-sm h-14 flex items-center px-4 md:px-6 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-text-primary mr-3">
            <Menu size={20} />
          </button>

          <button
            onClick={handleNewChat}
            className="group flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-sm hover:bg-gray-800 transition-all font-mono text-xs uppercase tracking-wide"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            <span>Nova Sessão</span>
          </button>

          <div className="h-6 w-px bg-gray-200 mx-4" />

          <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
            <div className="flex gap-2">
              {conversations.length === 0 ? (
                <span className="text-xs text-text-secondary font-mono italic">Nenhuma sessão ativa</span>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => { setCurrentId(conv.id); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs border transition-all whitespace-nowrap max-w-[200px] ${currentId === conv.id
                      ? 'bg-gray-100 border-gray-300 text-text-primary font-medium'
                      : 'bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-gray-50'
                      }`}
                  >
                    <MessageSquare size={12} className="opacity-50" />
                    <span className="truncate">{conv.title}</span>
                    {currentId === conv.id && (
                      <Trash2
                        size={10}
                        className="ml-1 text-red-400 hover:text-red-500"
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-300">
          {!currentId && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-gray-400" />
              </div>
              <h2 className="font-display text-4xl font-bold text-text-primary mb-2 tracking-tight">
                FIDI.ai
              </h2>
              <p className="font-mono text-xs text-text-secondary uppercase tracking-widest max-w-md">
                Sistema Operacional de Agentes
              </p>
            </div>
          )}

          {currentConversation?.messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              currentUser={currentUser}
            />
          ))}

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 justify-start"
              >
                <div className="w-8 h-8 rounded-sm bg-gray-100 flex items-center justify-center border border-gray-200">
                  <Loader2 size={16} className="animate-spin text-text-secondary" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm">
                  <span className="text-xs font-mono text-text-secondary animate-pulse">Processando...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-200 z-20">
          {attachments.length > 0 && (
            <div className="flex gap-3 mb-3 pb-2 overflow-x-auto">
              {attachments.map((att, i) => (
                <div key={i} className="relative group bg-gray-50 border border-gray-200 rounded-sm p-2 w-20 h-20 flex flex-col items-center justify-center gap-1">
                  <button onClick={() => removeAttachment(i)} className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                  <FileText className="text-text-secondary" size={20} />
                  <span className="text-[8px] text-text-secondary truncate w-full text-center">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="relative max-w-4xl mx-auto flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.md,.csv,image/*"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-sm transition-colors"
            >
              <Paperclip size={20} />
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // PREVENT RELOAD: Explicitly handle enter key
                    e.preventDefault();
                    e.stopPropagation();
                    handleSend(e);
                  }
                }}
                placeholder="Enviar mensagem para FIDI..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-black focus:ring-0 rounded-sm py-3 px-4 text-text-primary placeholder-gray-400 font-sans transition-all"
              />
            </div>

            <button
              type="button"
              onClick={(e) => handleSend(e)}
              disabled={(!input.trim() && attachments.length === 0) || isTyping || !isInitialized}
              className={`p-3 rounded-sm transition-all ${input.trim() || attachments.length > 0
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center mt-3 font-mono text-[9px] text-gray-400 uppercase">
            FIDI.ai v2.0 // Sistema Autônomo
          </p>
        </div>
      </div>
    </div>
  );
};
