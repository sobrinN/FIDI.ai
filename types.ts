export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface Feature {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly technical: string;
}

export interface Stat {
  readonly id: string;
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface Attachment {
  readonly name: string;
  readonly type: string; // mime type
  readonly data: string; // base64
  readonly size?: number; // File size in bytes (optional for backwards compatibility)
}

export interface GeneratedMedia {
  readonly type: 'image' | 'video';
  readonly url: string; // data URI or blob URL
  readonly mimeType: string;
  readonly prompt?: string; // Original prompt used to generate the media (optional)
}

export interface Message {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp?: number;
  readonly attachments?: readonly Attachment[];
  readonly media?: GeneratedMedia; // For AI generated content
}

export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly Message[];
  readonly lastModified: number;
  readonly agentId?: string; // Tracks which agent (01, 02, 03, 04) owns this chat
  readonly createdAt?: number; // Unix timestamp (optional for backwards compatibility)
  readonly updatedAt?: number; // Unix timestamp (optional for backwards compatibility)
}