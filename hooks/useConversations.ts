/**
 * useConversations Hook
 * Manages conversation state and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { Conversation, User } from '../types';
import { getUserConversations, setUserConversations } from '../lib/storageUtils';

interface UseConversationsReturn {
  conversations: Conversation[];
  currentId: string | null;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setCurrentId: React.Dispatch<React.SetStateAction<string | null>>;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  loadConversations: () => void;
}

export const useConversations = (currentUser: User | null): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Load conversations on mount and when user changes
  const loadConversations = useCallback(() => {
    if (currentUser) {
      const userConvos = getUserConversations(currentUser.id);
      setConversations(userConvos);

      // Select first conversation if available and no current selection
      if (userConvos.length > 0 && !currentId) {
        setCurrentId(userConvos[0].id);
      }
    }
  }, [currentUser, currentId]);

  // Load on mount and user change
  useEffect(() => {
    loadConversations();
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save conversations whenever they change
  // FIXED: Also persist empty conversation list to properly handle deletions
  useEffect(() => {
    if (currentUser) {
      // Always save, even if empty (to properly clear deleted conversations)
      setUserConversations(currentUser.id, conversations);
    }
  }, [conversations, currentUser?.id]);

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
    setCurrentId(conversation.id);
  }, []);

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, ...updates, updatedAt: Date.now() } : conv
      )
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);

      // If deleting current conversation, select another
      if (id === currentId) {
        setCurrentId(filtered.length > 0 ? filtered[0].id : null);
      }

      return filtered;
    });
  }, [currentId]);

  return {
    conversations,
    currentId,
    setConversations,
    setCurrentId,
    addConversation,
    updateConversation,
    deleteConversation,
    loadConversations
  };
};
