import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversations } from '../useConversations';
import { User, Conversation } from '../../types';
import * as storageUtils from '../../lib/storageUtils';

// Mock the storage utils
vi.mock('../../lib/storageUtils', () => ({
  getUserConversations: vi.fn(),
  setUserConversations: vi.fn()
}));

describe('useConversations', () => {
  const mockUser: User = {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Setup default mock return values
    vi.mocked(storageUtils.getUserConversations).mockReturnValue([]);
    vi.mocked(storageUtils.setUserConversations).mockImplementation(() => {});
  });

  it('should initialize with empty conversations for new user', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    expect(result.current.conversations).toEqual([]);
    expect(result.current.currentId).toBeNull();
  });

  it('should initialize with null user', () => {
    const { result } = renderHook(() => useConversations(null));

    expect(result.current.conversations).toEqual([]);
    expect(result.current.currentId).toBeNull();
  });

  it('should load conversations from storage on mount', () => {
    const existingConversations: Conversation[] = [
      {
        id: 'conv-1',
        agentId: '01',
        title: 'Test Conversation',
        messages: [],
        createdAt: Date.now(),
        lastModified: Date.now()
      }
    ];

    vi.mocked(storageUtils.getUserConversations).mockReturnValue(existingConversations);

    const { result } = renderHook(() => useConversations(mockUser));

    expect(storageUtils.getUserConversations).toHaveBeenCalledWith(mockUser.id);
    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('Test Conversation');
    expect(result.current.currentId).toBe('conv-1'); // Auto-selects first
  });

  it('should add new conversation', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const newConversation: Conversation = {
      id: 'conv-new',
      agentId: '01',
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(newConversation);
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.currentId).toBe('conv-new');
    expect(result.current.conversations[0].title).toBe('New Chat');
  });

  it('should add conversation at the beginning of the list', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const firstConversation: Conversation = {
      id: 'conv-1',
      agentId: '01',
      title: 'First',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    const secondConversation: Conversation = {
      id: 'conv-2',
      agentId: '02',
      title: 'Second',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(firstConversation);
    });

    act(() => {
      result.current.addConversation(secondConversation);
    });

    // Second should be at index 0 (prepended)
    expect(result.current.conversations[0].id).toBe('conv-2');
    expect(result.current.conversations[1].id).toBe('conv-1');
  });

  it('should update conversation', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const conversation: Conversation = {
      id: 'conv-update',
      agentId: '01',
      title: 'Original Title',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(conversation);
    });

    // Update it
    act(() => {
      result.current.updateConversation('conv-update', {
        title: 'Updated Title'
      });
    });

    expect(result.current.conversations[0].title).toBe('Updated Title');
    expect(result.current.conversations[0].updatedAt).toBeDefined();
    expect(result.current.conversations[0].id).toBe('conv-update');
  });

  it('should not modify other conversations when updating one', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const conv1: Conversation = {
      id: 'conv-1',
      agentId: '01',
      title: 'First',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    const conv2: Conversation = {
      id: 'conv-2',
      agentId: '02',
      title: 'Second',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(conv1);
      result.current.addConversation(conv2);
    });

    act(() => {
      result.current.updateConversation('conv-1', {
        title: 'First Updated'
      });
    });

    // conv-2 is at index 0 (prepended), conv-1 is at index 1
    expect(result.current.conversations[1].title).toBe('First Updated');
    expect(result.current.conversations[0].title).toBe('Second'); // Unchanged
  });

  it('should delete conversation', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const conv1: Conversation = {
      id: 'conv-1',
      agentId: '01',
      title: 'First',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    const conv2: Conversation = {
      id: 'conv-2',
      agentId: '02',
      title: 'Second',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(conv1);
      result.current.addConversation(conv2);
    });

    expect(result.current.conversations).toHaveLength(2);
    expect(result.current.currentId).toBe('conv-2');

    // Delete the current conversation
    act(() => {
      result.current.deleteConversation('conv-2');
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.currentId).toBe('conv-1'); // Switched to remaining
  });

  it('should set currentId to null when deleting last conversation', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const conversation: Conversation = {
      id: 'conv-only',
      agentId: '01',
      title: 'Only One',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(conversation);
    });

    expect(result.current.currentId).toBe('conv-only');

    act(() => {
      result.current.deleteConversation('conv-only');
    });

    expect(result.current.conversations).toHaveLength(0);
    expect(result.current.currentId).toBeNull();
  });

  it('should not change currentId when deleting non-current conversation', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const conv1: Conversation = {
      id: 'conv-1',
      agentId: '01',
      title: 'First',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    const conv2: Conversation = {
      id: 'conv-2',
      agentId: '02',
      title: 'Second',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(conv1);
      result.current.addConversation(conv2);
    });

    expect(result.current.currentId).toBe('conv-2');

    // Delete non-current conversation
    act(() => {
      result.current.deleteConversation('conv-1');
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.currentId).toBe('conv-2'); // Still the same
  });

  it('should save conversations to storage when they change', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    const conversation: Conversation = {
      id: 'conv-save',
      agentId: '01',
      title: 'Save Test',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    act(() => {
      result.current.addConversation(conversation);
    });

    // Should call setUserConversations with the new conversations
    expect(storageUtils.setUserConversations).toHaveBeenCalledWith(
      mockUser.id,
      expect.arrayContaining([
        expect.objectContaining({
          id: 'conv-save',
          title: 'Save Test'
        })
      ])
    );
  });

  it('should reload conversations when user changes', () => {
    const user1Conversations: Conversation[] = [
      {
        id: 'conv-user1',
        agentId: '01',
        title: 'User 1 Chat',
        messages: [],
        createdAt: Date.now(),
        lastModified: Date.now()
      }
    ];

    const user2Conversations: Conversation[] = [
      {
        id: 'conv-user2',
        agentId: '02',
        title: 'User 2 Chat',
        messages: [],
        createdAt: Date.now(),
        lastModified: Date.now()
      }
    ];

    // Setup mock to return different conversations based on user ID
    vi.mocked(storageUtils.getUserConversations).mockImplementation((userId: string) => {
      if (userId === 'test-user-123') return user1Conversations;
      if (userId === 'test-user-456') return user2Conversations;
      return [];
    });

    const { result, rerender } = renderHook(
      ({ user }) => useConversations(user),
      { initialProps: { user: mockUser } }
    );

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('User 1 Chat');

    // Switch to different user
    const mockUser2: User = {
      id: 'test-user-456',
      name: 'User 2',
      email: 'user2@example.com'
    };

    rerender({ user: mockUser2 });

    // Should load new user's conversations
    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('User 2 Chat');
  });

  it('should provide setConversations function', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    expect(typeof result.current.setConversations).toBe('function');

    const newConversations: Conversation[] = [
      {
        id: 'manual-1',
        agentId: '01',
        title: 'Manual',
        messages: [],
        createdAt: Date.now(),
        lastModified: Date.now()
      }
    ];

    act(() => {
      result.current.setConversations(newConversations);
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('Manual');
  });

  it('should provide setCurrentId function', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    expect(typeof result.current.setCurrentId).toBe('function');

    act(() => {
      result.current.setCurrentId('custom-id');
    });

    expect(result.current.currentId).toBe('custom-id');
  });

  it('should provide loadConversations function', () => {
    const { result } = renderHook(() => useConversations(mockUser));

    expect(typeof result.current.loadConversations).toBe('function');

    const newConversations: Conversation[] = [
      {
        id: 'reload-1',
        agentId: '01',
        title: 'Reload Test',
        messages: [],
        createdAt: Date.now(),
        lastModified: Date.now()
      }
    ];

    // Update mock to return new conversations
    vi.mocked(storageUtils.getUserConversations).mockReturnValue(newConversations);

    act(() => {
      result.current.loadConversations();
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('Reload Test');
  });
});
