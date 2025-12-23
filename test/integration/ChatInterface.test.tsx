import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from '../../components/ChatInterface';
import type { User } from '../../types';

// Mock API client
vi.mock('../../lib/apiClient', () => ({
  streamChatCompletion: vi.fn(),
  generateImage: vi.fn().mockResolvedValue({
    id: 'test-image-123',
    url: 'https://example.com/test-image.png',
  }),
  generateVideo: vi.fn().mockResolvedValue({
    id: 'test-video-456',
    url: 'https://example.com/test-video.mp4',
  }),
}));

describe('ChatInterface Integration Tests', () => {
  const mockUser: User = {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Component Mounting', () => {
    it('should render ChatInterface without crashing', () => {
      const { container } = render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Component should render
      expect(container).toBeTruthy();
    });

    it('should have sidebar with navigation elements', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Look for back button with "Retornar" text
      const backButton = screen.getByText(/retornar/i);
      expect(backButton).toBeInTheDocument();
    });

    it('should display model selector', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Check for model selector section header
      expect(screen.getByText('Modelo')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const backButton = screen.getByText(/retornar/i).closest('button');
      await user.click(backButton!);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should have input field for messages', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Look for the message input with new placeholder
      const input = screen.getByPlaceholderText(/enviar mensagem para fidi/i);
      expect(input).toBeInTheDocument();
    });

    it('should update input value when typing', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText(/enviar mensagem para fidi/i) as HTMLInputElement;

      await user.type(input, 'Test message');

      expect(input.value).toBe('Test message');
    });
  });

  describe('Conversation Management', () => {
    it('should have new session button', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Look for "Nova Sessão" button
      const newSessionButton = screen.getByText(/nova sessão/i);
      expect(newSessionButton).toBeInTheDocument();
    });

    it('should allow creating new session', async () => {
      const user = userEvent.setup();
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Click new session button
      const newSessionButton = screen.getByText(/nova sessão/i);
      await user.click(newSessionButton);

      // Should still have the input field (conversation cleared)
      expect(screen.getByPlaceholderText(/enviar mensagem para fidi/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render gracefully with null user', () => {
      const { container } = render(<ChatInterface currentUser={null} onBack={mockOnBack} />);

      // Should still render (error boundary will catch any crashes)
      expect(container).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have input with proper placeholder', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText(/enviar mensagem para fidi/i);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should have Media Canvas button', () => {
      render(<ChatInterface currentUser={mockUser} onBack={mockOnBack} />);

      // Check for Canvas button (displays as "Canvas" with "Gerar Mídia" subtitle)
      const canvasButton = screen.getByText(/canvas/i);
      expect(canvasButton).toBeInTheDocument();
    });
  });
});
