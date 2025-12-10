import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoScroll } from '../useAutoScroll';

describe('useAutoScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with scroll container and messages end refs', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: [],
        enabled: true
      })
    );

    expect(result.current.scrollContainerRef).toBeDefined();
    expect(result.current.scrollContainerRef.current).toBeNull(); // Not attached yet
    expect(result.current.messagesEndRef).toBeDefined();
    expect(result.current.messagesEndRef.current).toBeNull();
  });

  it('should provide isNearBottom function', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: [],
        enabled: true
      })
    );

    expect(typeof result.current.isNearBottom).toBe('function');

    // Should return true when no container (default safe behavior)
    expect(result.current.isNearBottom()).toBe(true);
  });

  it('should detect when user is near bottom', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: [],
        enabled: true
      })
    );

    // Mock a container element that's scrolled to bottom
    const mockContainer = {
      scrollTop: 900,
      scrollHeight: 1000,
      clientHeight: 100
    };

    // Attach mock container
    Object.defineProperty(result.current.scrollContainerRef, 'current', {
      writable: true,
      value: mockContainer
    });

    // Distance from bottom: 1000 - 900 - 100 = 0 (at bottom)
    expect(result.current.isNearBottom()).toBe(true);
  });

  it('should detect when user is NOT near bottom', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: [],
        enabled: true
      })
    );

    // Mock a container element scrolled up (more than threshold)
    const mockContainer = {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 100
    };

    Object.defineProperty(result.current.scrollContainerRef, 'current', {
      writable: true,
      value: mockContainer
    });

    // Distance from bottom: 1000 - 0 - 100 = 900 (far from bottom, threshold is 100)
    expect(result.current.isNearBottom()).toBe(false);
  });

  it('should provide scrollToBottom function', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: [],
        enabled: true
      })
    );

    expect(typeof result.current.scrollToBottom).toBe('function');

    // Should not crash when no element attached
    expect(() => result.current.scrollToBottom()).not.toThrow();
  });

  it('should call scrollIntoView when scrollToBottom is called with smooth behavior', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: [],
        enabled: true
      })
    );

    // Mock messagesEndRef with scrollIntoView
    const scrollIntoViewMock = vi.fn();
    Object.defineProperty(result.current.messagesEndRef, 'current', {
      writable: true,
      value: { scrollIntoView: scrollIntoViewMock }
    });

    act(() => {
      result.current.scrollToBottom(true);
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should call scrollIntoView with auto behavior when smooth is false', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: [],
        enabled: true
      })
    );

    // Mock messagesEndRef with scrollIntoView
    const scrollIntoViewMock = vi.fn();
    Object.defineProperty(result.current.messagesEndRef, 'current', {
      writable: true,
      value: { scrollIntoView: scrollIntoViewMock }
    });

    act(() => {
      result.current.scrollToBottom(false);
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('should respect enabled flag', () => {
    const { result } = renderHook(() =>
      useAutoScroll({
        dependencies: ['test'],
        enabled: false
      })
    );

    // Even with dependencies, refs should still be provided when disabled
    expect(result.current.scrollContainerRef).toBeDefined();
    expect(result.current.messagesEndRef).toBeDefined();
    expect(typeof result.current.scrollToBottom).toBe('function');
    expect(typeof result.current.isNearBottom).toBe('function');
  });
});
