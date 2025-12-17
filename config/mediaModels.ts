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

// Image generation models
export const IMAGE_MODELS: MediaModel[] = [
    {
        id: 'prunaai/z-image-turbo',
        name: 'Z-Image Turbo',
        provider: 'PrunaAI',
        badge: 'FAST',
        badgeColor: 'bg-green-500/20 text-green-400',
        description: 'Ultra-fast photorealistic generation with text support',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '4:5', '1:1', '9:16'],
        pricing: '$0.0025-$0.01'
    },
    {
        id: 'qwen/qwen-image',
        name: 'Qwen Image',
        provider: 'Alibaba',
        badge: 'FREE',
        badgeColor: 'bg-blue-500/20 text-blue-400',
        description: 'Quality image generation with good prompt adherence',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '1:1'],
        pricing: 'FREE'
    },
    {
        id: 'black-forest-labs/flux-1.1-pro',
        name: 'FLUX 1.1 Pro',
        provider: 'Black Forest Labs',
        badge: 'PRO',
        badgeColor: 'bg-purple-500/20 text-purple-400',
        description: 'Best quality, excellent prompt adherence & diversity',
        supportsResolutions: ['720p', '1080p', '4k'],
        supportsAspectRatios: ['16:9', '4:3', '4:5', '1:1', '9:16'],
        pricing: '~$0.04'
    }
];

// Video generation models
export const VIDEO_MODELS: VideoModel[] = [
    {
        id: 'wan-video/wan-2.2-t2v-fast',
        name: 'Wan 2.2 Fast',
        provider: 'PrunaAI',
        badge: 'FAST',
        badgeColor: 'bg-green-500/20 text-green-400',
        description: 'Fast, affordable text-to-video generation',
        supportsResolutions: ['720p', '1080p'],
        supportsAspectRatios: ['16:9', '4:3', '1:1'],
        supportsDurations: ['5s'],
        pricing: 'LOW'
    },
    {
        id: 'kwaivgi/kling-v1.6-pro',
        name: 'Kling v1.6 Pro',
        provider: 'Kuaishou',
        badge: 'PRO',
        badgeColor: 'bg-purple-500/20 text-purple-400',
        description: 'Professional 5s/10s videos at 1080p',
        supportsResolutions: ['1080p'],
        supportsAspectRatios: ['16:9', '9:16', '1:1'],
        supportsDurations: ['5s', '10s'],
        pricing: '~$0.25-$0.50'
    }
];

// Aspect ratio options with labels
export const ASPECT_RATIOS = [
    { value: '16:9', label: '16:9', description: 'Landscape (YouTube, Cinema)' },
    { value: '4:3', label: '4:3', description: 'Classic' },
    { value: '4:5', label: '4:5', description: 'Portrait (Instagram)' },
    { value: '1:1', label: '1:1', description: 'Square' },
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
    { value: '5s', label: '5 seconds', description: 'Quick clips' },
    { value: '10s', label: '10 seconds', description: 'Extended scenes' }
] as const;

// Helper functions
export const getImageModelById = (id: string): MediaModel | undefined =>
    IMAGE_MODELS.find(m => m.id === id);

export const getVideoModelById = (id: string): VideoModel | undefined =>
    VIDEO_MODELS.find(m => m.id === id);

export const getDefaultImageModel = (): MediaModel =>
    IMAGE_MODELS.find(m => m.id === 'black-forest-labs/flux-1.1-pro') || IMAGE_MODELS[0];

export const getDefaultVideoModel = (): VideoModel =>
    VIDEO_MODELS.find(m => m.id === 'wan-video/wan-2.2-t2v-fast') || VIDEO_MODELS[0];

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
