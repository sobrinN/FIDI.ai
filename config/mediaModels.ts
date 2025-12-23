/**
 * Media Models Configuration
 * Replicate models for NENECA's Media Studio
 */

export interface MediaModel {
    id: string;
    name: string;
    provider: string;
    badge: 'FREE' | 'FAST' | 'PRO';
    badgeColor: string;
    description: string;
    supportsResolutions: ('720p' | '1080p' | '4k')[];
    supportsAspectRatios: ('16:9' | '4:3' | '4:5' | '1:1' | '9:16')[];
    pricing: string;
}

export interface VideoModel extends Omit<MediaModel, 'supportsResolutions'> {
    supportsResolutions: ('720p' | '1080p')[];
    supportsDurations: ('5s' | '10s')[];
}

// Image generation models - Official Replicate models from api-manipulator skill
export const IMAGE_MODELS: MediaModel[] = [
    {
        id: 'black-forest-labs/flux-2-pro',
        name: 'FLUX 2 Pro',
        provider: 'Black Forest Labs',
        badge: 'PRO',
        badgeColor: 'bg-purple-500/20 text-purple-400',
        description: 'Maior qualidade com compreensão avançada de prompts',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '4:5', '1:1', '9:16'],
        pricing: 'Premium'
    },
    {
        id: 'black-forest-labs/flux-2-dev',
        name: 'FLUX 2 Dev',
        provider: 'Black Forest Labs',
        badge: 'FAST',
        badgeColor: 'bg-green-500/20 text-green-400',
        description: 'Geração rápida otimizada para velocidade e qualidade',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '4:5', '1:1', '9:16'],
        pricing: 'Fast'
    },
    {
        id: 'qwen/qwen-image',
        name: 'Qwen Image',
        provider: 'Qwen',
        badge: 'PRO',
        badgeColor: 'bg-blue-500/20 text-blue-400',
        description: 'Forte compreensão de prompts com suporte a chinês',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '4:5', '1:1', '9:16'],
        pricing: 'Standard'
    },
    {
        id: 'qwen/qwen-image-edit-plus',
        name: 'Qwen Edit Plus',
        provider: 'Qwen',
        badge: 'PRO',
        badgeColor: 'bg-orange-500/20 text-orange-400',
        description: 'Edição e manipulação avançada de imagens',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '4:5', '1:1', '9:16'],
        pricing: 'Standard'
    },
    {
        id: 'bytedance/seedream-4.5',
        name: 'Seedream 4.5',
        provider: 'Bytedance',
        badge: 'PRO',
        badgeColor: 'bg-pink-500/20 text-pink-400',
        description: 'Geração de alta fidelidade até 4K',
        supportsResolutions: ['720p', '1080p', '4k'],
        supportsAspectRatios: ['16:9', '4:3', '4:5', '1:1', '9:16'],
        pricing: 'Premium'
    }
];

// Video generation models - Official Replicate models from api-manipulator skill
export const VIDEO_MODELS: VideoModel[] = [
    {
        id: 'wan-video/wan-2.2-animate-replace',
        name: 'WAN Animate Replace',
        provider: 'WAN Video',
        badge: 'PRO',
        badgeColor: 'bg-purple-500/20 text-purple-400',
        description: 'Substitua personagens em vídeos existentes por novos',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '1:1'],
        supportsDurations: ['5s'],
        pricing: 'Standard'
    },
    {
        id: 'wan-video/wan-2.2-i2v-fast',
        name: 'WAN i2v Fast',
        provider: 'WAN Video',
        badge: 'FAST',
        badgeColor: 'bg-green-500/20 text-green-400',
        description: 'Imagem para vídeo rápido com descrição de movimento',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '1:1'],
        supportsDurations: ['5s'],
        pricing: 'Fast'
    },
    {
        id: 'minimax/hailuo-02-fast',
        name: 'Hailuo 02 Fast',
        provider: 'MiniMax',
        badge: 'FAST',
        badgeColor: 'bg-blue-500/20 text-blue-400',
        description: 'Vídeo guiado por movimento a partir de frames estáticos',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '9:16', '1:1'],
        supportsDurations: ['5s'],
        pricing: 'Fast'
    }
];

// Aspect ratio options with labels
export const ASPECT_RATIOS = [
    { value: '16:9', label: '16:9', description: 'Paisagem (YouTube, Cinema)' },
    { value: '4:3', label: '4:3', description: 'Clássico' },
    { value: '4:5', label: '4:5', description: 'Retrato (Instagram)' },
    { value: '1:1', label: '1:1', description: 'Quadrado' },
    { value: '9:16', label: '9:16', description: 'Vertical (Stories, TikTok)' }
] as const;

// Resolution options with pixel dimensions
export const RESOLUTIONS = [
    { value: '720p', label: '720p HD', pixels: '1280×720' },
    { value: '1080p', label: '1080p Full HD', pixels: '1920×1080' },
    { value: '4k', label: '4K Ultra HD', pixels: '3840×2160' }
] as const;

// Duration options for video
export const DURATIONS = [
    { value: '5s', label: '5 segundos', description: 'Clipes rápidos' },
    { value: '10s', label: '10 segundos', description: 'Cenas estendidas' }
] as const;

// Helper functions
export const getImageModelById = (id: string): MediaModel | undefined =>
    IMAGE_MODELS.find(m => m.id === id);

export const getVideoModelById = (id: string): VideoModel | undefined =>
    VIDEO_MODELS.find(m => m.id === id);

export const getDefaultImageModel = (): MediaModel =>
    IMAGE_MODELS.find(m => m.id === 'black-forest-labs/flux-2-dev') || IMAGE_MODELS[0];

export const getDefaultVideoModel = (): VideoModel =>
    VIDEO_MODELS.find(m => m.id === 'wan-video/wan-2.2-i2v-fast') || VIDEO_MODELS[0];

// Check if a model supports a specific aspect ratio
export const modelSupportsAspectRatio = (
    modelId: string,
    aspectRatio: string,
    type: 'image' | 'video'
): boolean => {
    const model = type === 'image'
        ? getImageModelById(modelId)
        : getVideoModelById(modelId);
    return model?.supportsAspectRatios.includes(
        aspectRatio as '16:9' | '4:3' | '4:5' | '1:1' | '9:16'
    ) ?? false;
};

// Check if a model supports a specific resolution
export const modelSupportsResolution = (
    modelId: string,
    resolution: string,
    type: 'image' | 'video'
): boolean => {
    const model = type === 'image'
        ? getImageModelById(modelId)
        : getVideoModelById(modelId);
    return model?.supportsResolutions.includes(
        resolution as '720p' | '1080p' | '4k'
    ) ?? false;
};
