/**
 * useConversations Hook
 * Manages conversation state and persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, User } from '../types';
import { getUserConversations, setUserConversations } from '../lib/storageUtils';

interface UseConversationsReturn {
  conversations: Conversation[];
  currentId: string | null;
  isInitialized: boolean;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setCurrentId: React.Dispatch<React.SetStateAction<string | null>>;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  loadConversations: () => void;
  saveConversations: () => void;
}

export const useConversations = (currentUser: User | null): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track the current user ID to detect actual user changes (not just object reference changes)
  const currentUserIdRef = useRef<string | null>(null);

  // Load conversations on mount and when user ID changes (not when user object reference changes)
  // FIX: Changed dependency from entire currentUser to currentUser?.id to prevent
  // unnecessary reloads when user data (like creditBalance) updates
  const loadConversations = useCallback(() => {
    const userId = currentUser?.id ?? null;

    // Only reload if user ID actually changed (prevents reload on creditBalance updates)
    if (userId === currentUserIdRef.current && currentUserIdRef.current !== null) {
      return; // Skip reload - same user, already loaded
    }

    currentUserIdRef.current = userId;

    if (currentUser) {
      const userConvos = getUserConversations(currentUser.id);
      setConversations(userConvos);

      // Use functional update to avoid stale closure with currentId
      // Only select first conversation if there's no current selection
      setCurrentId(prevId => {
        if (prevId === null && userConvos.length > 0) {
          return userConvos[0].id;
        }
        return prevId;
      });

      setIsInitialized(true);
    } else {
      // Clear state when user logs out
      setConversations([]);
      setCurrentId(null);
      setIsInitialized(false);
    }
  }, [currentUser?.id]); // FIX: Only depend on user ID, not entire user object

  // Load on mount and user change
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);


  // Keep ref up to date for immediate saving
  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Save conversations whenever they change (debounced)
  // FIXED: Also persist empty conversation list to properly handle deletions
  // PERF: Debounce writes to prevent trashing during streaming (writes every 1s max)
  useEffect(() => {
    if (!currentUser) return;

    const timeoutId = setTimeout(() => {
      try {
        // Always save, even if empty (to properly clear deleted conversations)
        setUserConversations(currentUser.id, conversations);
      } catch (error) {
        console.error('[useConversations] Failed to save conversations:', error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [conversations, currentUser?.id]);

  // Manual save method that uses the ref to get latest data (bypassing closure staleness)
  const saveConversations = useCallback(() => {
    if (currentUser?.id && conversationsRef.current) {
      try {
        setUserConversations(currentUser.id, conversationsRef.current);
        // console.log('[useConversations] Manual save triggered');
      } catch (error) {
        console.error('[useConversations] Manual save failed:', error);
      }
    }
  }, [currentUser?.id]);

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
    // FIX: Avoid stale closure and nested state updates
    // Compute the filtered list and next ID in a single pass
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      const nextId = filtered.length > 0 ? filtered[0].id : null;

      // Update currentId using functional form to compare against latest prevId
      // React batches these updates together
      setCurrentId(prevId => (id === prevId ? nextId : prevId));

      return filtered;
    });
  }, []); // Empty deps - no stale closure issues

  return {
    conversations,
    currentId,
    isInitialized,
    setConversations,
    setCurrentId,
    addConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    saveConversations
  };
};
