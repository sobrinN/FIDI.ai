/**
 * useAutoScroll Hook
 * Manages smart auto-scrolling that only triggers when user is near bottom
 */

import { useEffect, useRef } from 'react';
import { UI } from '../config/constants';

interface UseAutoScrollOptions {
  /**
   * Dependencies that should trigger scroll check
   */
  dependencies: unknown[];
  /**
   * Whether auto-scroll is enabled
   */
  enabled?: boolean;
}

interface UseAutoScrollReturn {
  /**
   * Ref to attach to the scroll container
   */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Ref to attach to the element that marks the end of messages
   */
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Check if user is near bottom of scroll area
   */
  isNearBottom: () => boolean;
  /**
   * Force scroll to bottom regardless of position
   */
  scrollToBottom: (smooth?: boolean) => void;
}

export const useAutoScroll = ({
  dependencies,
  enabled = true
}: UseAutoScrollOptions): UseAutoScrollReturn => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Check if user is near the bottom of the scroll area
   */
  const isNearBottom = (): boolean => {
    const container = scrollContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    return distanceFromBottom < UI.SCROLL_NEAR_BOTTOM_THRESHOLD;
  };

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = (smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  /**
   * Auto-scroll when dependencies change, but only if user is near bottom
   */
  useEffect(() => {
    if (!enabled) return;

    // Only auto-scroll if user is already near the bottom
    // This prevents disrupting users who are reading older messages
    if (isNearBottom()) {
      scrollToBottom();
    }
  }, dependencies);

  return {
    scrollContainerRef,
    messagesEndRef,
    isNearBottom,
    scrollToBottom
  };
};
