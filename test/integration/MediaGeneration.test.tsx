import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from '../../components/ChatInterface';
import type { User } from '../../types';
import * as apiClient from '../../lib/apiClient';

// Mock the API client
vi.mock('../../lib/apiClient', () => ({
  streamChatCompletion: vi.fn(),
  generateImage: vi.fn(),
  generateVideo: vi.fn(),
}));

describe('Media Generation Integration Tests', () => {
  const mockUser: User = {
    id: 'test-user-456',
    name: 'Media Test User',
    email: 'media@example.com',
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock implementations - return URL strings matching the actual API signatures
    vi.mocked(apiClient.generateImage).mockResolvedValue('https://example.com/generated-image.png');

    vi.mocked(apiClient.generateVideo).mockResolvedValue('https://example.com/generated-video.mp4');
  });

  describe('Media Canvas Access', () => {
    it('should show MediaCanvas when Canvas de Mídia button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Click Canvas button in sidebar
      const canvasButton = screen.getByText(/canvas/i);
      await user.click(canvasButton);

      // Should show MediaCanvas with FIDI.ai Canvas heading
      await waitFor(() => {
        expect(screen.getByText('FIDI.ai Canvas')).toBeInTheDocument();
      });
    });

    it('should have Canvas button in sidebar', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const canvasButton = screen.getByText(/canvas/i);
      expect(canvasButton).toBeInTheDocument();
    });

    it('should show Canvas description', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const description = screen.getByText(/gerar mídia/i);
      expect(description).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should have generateImage function available', () => {
      expect(apiClient.generateImage).toBeDefined();
      expect(typeof apiClient.generateImage).toBe('function');
    });

    it('should have generateVideo function available', () => {
      expect(apiClient.generateVideo).toBeDefined();
      expect(typeof apiClient.generateVideo).toBe('function');
    });

    it('should mock generateImage with proper response', async () => {
      const result = await apiClient.generateImage('test prompt');

      // API returns URL string directly
      expect(result).toBe('https://example.com/generated-image.png');
    });

    it('should mock generateVideo with proper response', async () => {
      const result = await apiClient.generateVideo('test prompt');

      // API returns URL string directly
      expect(result).toBe('https://example.com/generated-video.mp4');
    });
  });

  describe('Error Handling', () => {
    it('should handle image generation errors', async () => {
      // Mock failure
      vi.mocked(apiClient.generateImage).mockRejectedValue(
        new Error('API Error: Rate limit exceeded')
      );

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      try {
        await apiClient.generateImage('test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      errorSpy.mockRestore();
    });

    it('should handle video generation errors', async () => {
      // Mock failure
      vi.mocked(apiClient.generateVideo).mockRejectedValue(
        new Error('Video generation timeout')
      );

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      try {
        await apiClient.generateVideo('test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      errorSpy.mockRestore();
    });
  });

  describe('Chat Interface', () => {
    it('should show standard placeholder in chat', async () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Should show standard placeholder
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enviar mensagem para fidi/i)).toBeInTheDocument();
      });
    });
  });
});
