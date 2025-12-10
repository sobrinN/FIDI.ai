/**
 * useFileAttachments Hook
 * Handles file upload, validation, and base64 encoding
 */

import { useState, useRef } from 'react';
import { Attachment } from '../types';
import { FILE_LIMITS } from '../config/constants';

interface UseFileAttachmentsReturn {
  attachments: Attachment[];
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
}

export const useFileAttachments = (): UseFileAttachmentsReturn => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > FILE_LIMITS.MAX_SIZE) {
      alert(`Arquivo muito grande. O tamanho máximo é ${FILE_LIMITS.MAX_SIZE_MB}MB.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Extract base64 part from data URL (remove "data:image/png;base64," prefix)
        const base64 = dataUrl.split(',')[1];
        const newAttachment: Attachment = {
          name: file.name,
          type: file.type,
          data: base64,
          size: file.size
        };

        setAttachments(prev => [...prev, newAttachment]);
        setIsUploading(false);

        // Clear input for next upload
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        console.error('Erro ao ler arquivo');
        alert('Erro ao processar o arquivo. Tente novamente.');
        setIsUploading(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do arquivo.');
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const clearAttachments = () => {
    setAttachments([]);
  };

  return {
    attachments,
    isUploading,
    fileInputRef,
    handleFileSelect,
    removeAttachment,
    clearAttachments
  };
};
