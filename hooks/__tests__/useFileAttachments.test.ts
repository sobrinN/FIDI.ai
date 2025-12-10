import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileAttachments } from '../useFileAttachments';

describe('useFileAttachments', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();

    // Mock window.alert for all tests
    vi.stubGlobal('alert', vi.fn());
  });

  it('should initialize with empty attachments', () => {
    const { result } = renderHook(() => useFileAttachments());

    expect(result.current.attachments).toEqual([]);
    expect(result.current.isUploading).toBe(false);
  });

  it('should provide file input ref', () => {
    const { result } = renderHook(() => useFileAttachments());

    expect(result.current.fileInputRef).toBeDefined();
    expect(result.current.fileInputRef.current).toBeNull(); // Not attached to DOM yet
  });

  it('should provide attachment management functions', () => {
    const { result } = renderHook(() => useFileAttachments());

    expect(typeof result.current.handleFileSelect).toBe('function');
    expect(typeof result.current.removeAttachment).toBe('function');
    expect(typeof result.current.clearAttachments).toBe('function');
  });

  it('should clear attachments', () => {
    const { result } = renderHook(() => useFileAttachments());

    // Manually add an attachment to test clearing
    act(() => {
      // This is a simplified test - full file upload testing requires more setup
      result.current.clearAttachments();
    });

    expect(result.current.attachments).toEqual([]);
  });

  describe('File Operations', () => {
    it('should handle empty file selection', () => {
      const { result } = renderHook(() => useFileAttachments());

      // Mock event with no files
      const mockEvent = {
        target: {
          files: null
        }
      } as any;

      act(() => {
        result.current.handleFileSelect(mockEvent);
      });

      // Should not crash and attachments remain empty
      expect(result.current.attachments).toEqual([]);
      expect(result.current.isUploading).toBe(false);
    });

    it('should handle empty FileList', () => {
      const { result } = renderHook(() => useFileAttachments());

      // Mock event with empty FileList
      const mockEvent = {
        target: {
          files: []
        }
      } as any;

      act(() => {
        result.current.handleFileSelect(mockEvent);
      });

      expect(result.current.attachments).toEqual([]);
      expect(result.current.isUploading).toBe(false);
    });

    it('should validate file size and reject large files', async () => {
      const { result } = renderHook(() => useFileAttachments());

      // Create a mock file that's too large (> 10MB)
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf'
      });

      // Create a mock change event
      const mockEvent = {
        target: {
          files: [largeFile]
        }
      } as any;

      act(() => {
        result.current.handleFileSelect(mockEvent);
      });

      // Should show alert for file too large
      expect(alert).toHaveBeenCalledWith(
        expect.stringContaining('Arquivo muito grande')
      );
      expect(result.current.attachments.length).toBe(0);
      expect(result.current.isUploading).toBe(false);
    });

    it('should process valid file with FileReader', async () => {
      const { result } = renderHook(() => useFileAttachments());

      // Create a small valid file
      const smallFile = new File(['test content'], 'test.txt', {
        type: 'text/plain'
      });

      // Mock FileReader class
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: 'data:text/plain;base64,dGVzdCBjb250ZW50'
      };

      // Use mockImplementation with a proper function
      const FileReaderMock = vi.fn(function(this: any) {
        this.readAsDataURL = mockFileReader.readAsDataURL;
        this.onload = mockFileReader.onload;
        this.onerror = mockFileReader.onerror;
        this.result = mockFileReader.result;
        return this;
      });

      vi.stubGlobal('FileReader', FileReaderMock);

      const mockEvent = {
        target: {
          files: [smallFile]
        }
      } as any;

      act(() => {
        result.current.handleFileSelect(mockEvent);
      });

      // Should set uploading state
      expect(result.current.isUploading).toBe(true);

      // Get the instance of FileReader that was created
      const fileReaderInstance = FileReaderMock.mock.results[0].value;

      // Trigger FileReader onload
      act(() => {
        fileReaderInstance.onload({
          target: { result: 'data:text/plain;base64,dGVzdCBjb250ZW50' }
        } as any);
      });

      // Should add attachment and clear uploading state
      expect(result.current.attachments).toHaveLength(1);
      expect(result.current.attachments[0]).toMatchObject({
        name: 'test.txt',
        type: 'text/plain',
        data: 'dGVzdCBjb250ZW50',
        size: smallFile.size
      });
      expect(result.current.isUploading).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should handle FileReader error', async () => {
      const { result } = renderHook(() => useFileAttachments());

      const smallFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      // Mock FileReader with error
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any
      };

      const FileReaderMock = vi.fn(function(this: any) {
        this.readAsDataURL = mockFileReader.readAsDataURL;
        this.onload = mockFileReader.onload;
        this.onerror = mockFileReader.onerror;
        return this;
      });

      vi.stubGlobal('FileReader', FileReaderMock);

      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockEvent = {
        target: {
          files: [smallFile]
        }
      } as any;

      act(() => {
        result.current.handleFileSelect(mockEvent);
      });

      // Get the FileReader instance
      const fileReaderInstance = FileReaderMock.mock.results[0].value;

      // Trigger FileReader error
      act(() => {
        fileReaderInstance.onerror();
      });

      expect(consoleErrorMock).toHaveBeenCalledWith('Erro ao ler arquivo');
      expect(alert).toHaveBeenCalledWith(
        'Erro ao processar o arquivo. Tente novamente.'
      );
      expect(result.current.isUploading).toBe(false);
      expect(result.current.attachments).toHaveLength(0);

      consoleErrorMock.mockRestore();
      vi.unstubAllGlobals();
    });

    it('should remove attachment by index', async () => {
      const { result } = renderHook(() => useFileAttachments());

      const smallFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any
      };

      const FileReaderMock = vi.fn(function(this: any) {
        this.readAsDataURL = mockFileReader.readAsDataURL;
        this.onload = mockFileReader.onload;
        this.onerror = mockFileReader.onerror;
        return this;
      });

      vi.stubGlobal('FileReader', FileReaderMock);

      const mockEvent = {
        target: {
          files: [smallFile]
        }
      } as any;

      // Add first file
      act(() => {
        result.current.handleFileSelect(mockEvent);
      });

      const fileReaderInstance = FileReaderMock.mock.results[0].value;

      act(() => {
        fileReaderInstance.onload({
          target: { result: 'data:text/plain;base64,dGVzdA==' }
        } as any);
      });

      expect(result.current.attachments).toHaveLength(1);

      // Remove attachment
      act(() => {
        result.current.removeAttachment(0);
      });

      expect(result.current.attachments).toHaveLength(0);

      vi.unstubAllGlobals();
    });

    it('should not crash when removing non-existent index', () => {
      const { result } = renderHook(() => useFileAttachments());

      // Try to remove from empty array
      act(() => {
        result.current.removeAttachment(0);
      });

      expect(result.current.attachments).toHaveLength(0);

      // Should not crash when removing non-existent index
      act(() => {
        result.current.removeAttachment(999);
      });

      expect(result.current.attachments).toHaveLength(0);
    });
  });
});
