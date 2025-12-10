/**
 * Application Messages (Portuguese)
 * Essential message strings for chat functionality
 */

export const MESSAGES = {
  // Core Error Messages
  ERRORS: {
    GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    TIMEOUT: 'Tempo limite excedido. O modelo pode estar sobrecarregado. Tente novamente ou use outro agente.',
    FILE_TOO_LARGE: 'Arquivo muito grande. O tamanho máximo é',
    FILE_UPLOAD_ERROR: 'Erro ao fazer upload do arquivo.',
  },

  // Processing States
  INFO: {
    PROCESSING: 'Processando...',
    GENERATING_IMAGE: 'Gerando imagem...',
    GENERATING_VIDEO: 'Gerando vídeo...',
    TYPING: 'Digitando...',
  },
} as const;
