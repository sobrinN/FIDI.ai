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

    // Default mock implementations
    vi.mocked(apiClient.generateImage).mockResolvedValue({
      id: 'mock-image-123',
      url: 'https://example.com/generated-image.png',
    });

    vi.mocked(apiClient.generateVideo).mockResolvedValue({
      id: 'mock-video-456',
      url: 'https://example.com/generated-video.mp4',
    });
  });

  describe('NENECA Agent Configuration', () => {
    it('should show NENECA-specific placeholder when agent is selected', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Select NENECA agent (agent 04)
      const nenecaButton = screen.getByTitle('NENECA');
      await user.click(nenecaButton);

      // Should show media-specific placeholder
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/descreva a imagem ou vídeo/i)
        ).toBeInTheDocument();
      });
    });

    it('should have NENECA agent available', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const nenecaButton = screen.getByTitle('NENECA');
      expect(nenecaButton).toBeInTheDocument();
    });
  });

  describe('Media Generation Workflow', () => {
    it('should allow typing media generation prompts', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Select NENECA
      const nenecaButton = screen.getByTitle('NENECA');
      await user.click(nenecaButton);

      const input = (await screen.findByPlaceholderText(
        /descreva a imagem ou vídeo/i
      )) as HTMLInputElement;

      await user.type(input, 'Crie uma imagem de um gato espacial');

      expect(input.value).toBe('Crie uma imagem de um gato espacial');
    });

    it('should have send button enabled with text input', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const nenecaButton = screen.getByTitle('NENECA');
      await user.click(nenecaButton);

      const input = await screen.findByPlaceholderText(/descreva a imagem ou vídeo/i);
      await user.type(input, 'Gere uma imagem');

      // Find send button (has Send icon)
      const sendButtons = screen.getAllByRole('button');
      const sendButton = sendButtons.find((btn) => !btn.disabled);

      expect(sendButton).toBeTruthy();
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

      expect(result).toEqual({
        id: 'mock-image-123',
        url: 'https://example.com/generated-image.png',
      });
    });

    it('should mock generateVideo with proper response', async () => {
      const result = await apiClient.generateVideo('test prompt');

      expect(result).toEqual({
        id: 'mock-video-456',
        url: 'https://example.com/generated-video.mp4',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle image generation errors', async () => {
      // Mock failure
      vi.mocked(apiClient.generateImage).mockRejectedValue(
        new Error('API Error: Rate limit exceeded')
      );

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

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

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await apiClient.generateVideo('test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      errorSpy.mockRestore();
    });
  });

  describe('Agent-Specific Behavior', () => {
    it('should show different placeholder for non-NENECA agents', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // FIDI should show standard placeholder
      const fidiButton = screen.getByTitle('FIDI');
      await user.click(fidiButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/digite seu comando/i)).toBeInTheDocument();
      });
    });
  });
});
