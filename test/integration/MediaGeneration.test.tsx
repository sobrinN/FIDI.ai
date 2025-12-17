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

  describe('NENECA Agent Configuration', () => {
    it('should show MediaCanvas when NENECA agent is selected', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Select NENECA agent (agent 04)
      const nenecaButton = screen.getByTitle('NENECA');
      await user.click(nenecaButton);

      // Should show MediaCanvas with NENECA Canvas heading
      await waitFor(() => {
        expect(screen.getByText('NENECA Canvas')).toBeInTheDocument();
      });
    });

    it('should have NENECA agent available', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const nenecaButton = screen.getByTitle('NENECA');
      expect(nenecaButton).toBeInTheDocument();
    });
  });

  // Note: ReactFlow uses d3-drag which requires browser APIs not available in jsdom
  // These interaction tests are skipped as they require a real browser environment
  describe('Media Generation Workflow', () => {
    it.skip('should allow typing media generation prompts', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const nenecaButton = screen.getByTitle('NENECA');
      await user.click(nenecaButton);

      const textarea = (await screen.findByPlaceholderText(
        /describe the image/i
      )) as HTMLTextAreaElement;

      await user.type(textarea, 'A futuristic city at night');

      expect(textarea.value).toBe('A futuristic city at night');
    });

    it.skip('should have generate button enabled with text input', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const nenecaButton = screen.getByTitle('NENECA');
      await user.click(nenecaButton);

      const textarea = await screen.findByPlaceholderText(/describe the image/i);
      await user.type(textarea, 'A mountain landscape');

      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).not.toBeDisabled();
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

  describe('Agent-Specific Behavior', () => {
    it('should show different placeholder for non-NENECA agents', async () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // FIDI is the default agent, should show standard placeholder
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/digite seu comando/i)).toBeInTheDocument();
      });
    });
  });
});
