/**
 * Community Service - Frontend API integration for Feed, Chat, Calls, and Recognition
 * Provides real-time communication with WebSocket support
 */
import api from './api';

const API_BASE = '/community';

// ===========================
// TYPES
// ===========================

export interface UserBasic {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    department: string;
    position?: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface PostReaction {
    like: string[];
    love: string[];
    clap: string[];
    insightful: string[];
}

export interface PostComment {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    content: string;
    parent_id?: string;
    likes: string[];
    replies?: PostComment[];
    created_at: string;
}

export interface FeedPost {
    id: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    author_department?: string;
    author_role?: string;
    content: string;
    post_type: string;
    visibility: string;
    channel_id?: string;
    media_urls?: string[];
    hashtags?: string[];
    mentions?: string[];
    reactions: PostReaction;
    comments_count: number;
    shares_count: number;
    is_pinned: boolean;
    is_edited: boolean;
    approval_status: string;
    approved_by?: string;
    created_at: string;
    updated_at?: string;
}

export interface FeedChannel {
    id: string;
    name: string;
    description?: string;
    channel_type: string;
    is_private: boolean;
    members?: string[];
    admins?: string[];
    avatar?: string;
    post_count: number;
    created_by: string;
    created_at: string;
}

export interface FeedStats {
    total_posts: number;
    posts_this_week: number;
    total_reactions: number;
    total_comments: number;
    most_active_channel?: string;
    top_contributors: { user_id: string; name: string; post_count: number }[];
}

export interface TrendingTopic {
    hashtag: string;
    count: number;
    recent_posts: string[];
}

// Chat Types
export interface ChatChannel {
    id: string;
    name: string;
    description?: string;
    channel_type: string;
    is_private: boolean;
    members: string[];
    admins: string[];
    avatar?: string;
    created_by: string;
    created_at: string;
    last_message_content?: string;
    last_message_at?: string;
    last_message_by?: string;
    unread_count: number;
}

export interface ChatGroup {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    members: string[];
    admins: string[];
    created_by: string;
    created_at: string;
    last_message_content?: string;
    last_message_at?: string;
    last_message_by?: string;
    unread_count: number;
}

export interface DirectMessage {
    id: string;
    user1_id: string;
    user2_id: string;
    other_user?: UserBasic;
    last_message_content?: string;
    last_message_at?: string;
    last_message_by?: string;
    unread_count: number;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar?: string;
    content?: string;
    message_type: string;
    channel_id?: string;
    group_id?: string;
    dm_id?: string;
    reply_to_id?: string;
    files?: { name: string; url: string; type: string; size: number }[];
    reactions?: { emoji: string; users: string[] }[];
    mentions?: string[];
    poll_data?: { question: string; options: { text: string; votes: string[] }[] };
    sticker_id?: string;
    is_edited: boolean;
    is_deleted: boolean;
    read_by?: string[];
    created_at: string;
}

// Call Types
export interface Call {
    id: string;
    initiator_id: string;
    call_type: 'voice' | 'video';
    status: 'ringing' | 'ongoing' | 'ended' | 'missed' | 'declined';
    room_id: string;
    channel_id?: string;
    group_id?: string;
    dm_id?: string;
    participants: CallParticipant[];
    started_at?: string;
    ended_at?: string;
    created_at: string;
    duration?: number;
}

export interface CallParticipant {
    id: string;
    call_id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    joined_at: string;
    left_at?: string;
    is_muted: boolean;
    is_video_on: boolean;
    is_screen_sharing: boolean;
}

// Recognition Types
export interface Recognition {
    id: string;
    recipient_id: string;
    recipient_name?: string;
    recipient_avatar?: string;
    recipient_department?: string;
    recipient_position?: string;
    recognition_type: string;
    title: string;
    description?: string;
    achievement?: string;
    impact?: string;
    value_demonstrated?: string;
    points: number;
    badge?: string;
    nominated_by: string;
    nominator_name?: string;
    is_approved: boolean;
    approved_by?: string;
    approver_name?: string;
    approved_at?: string;
    department?: string;
    is_public: boolean;
    reactions?: Record<string, string[]>;
    created_at: string;
}

export interface PeerKudos {
    id: string;
    recipient_id: string;
    recipient_name?: string;
    recipient_avatar?: string;
    recipient_department?: string;
    sender_id: string;
    sender_name?: string;
    sender_avatar?: string;
    message: string;
    category?: string;
    value?: string;
    emoji?: string;
    gif_url?: string;
    points: number;
    is_public: boolean;
    reactions?: Record<string, string[]>;
    created_at: string;
}

export interface RecognitionStats {
    total_recognitions: number;
    total_kudos: number;
    recognition_by_type: Record<string, number>;
    top_recognized: { user_id: string; name: string; avatar?: string; department?: string; recognition_count: number; total_points: number }[];
    top_givers: { user_id: string; name: string; avatar?: string; department?: string; given_count: number }[];
    recognition_by_department: Record<string, number>;
    period: string;
}

// ===========================
// FEED SERVICE
// ===========================

export const feedService = {
    // Posts
    async getPosts(params?: {
        channel_id?: string;
        post_type?: string;
        visibility?: string;
        author_id?: string;
        skip?: number;
        limit?: number;
    }): Promise<FeedPost[]> {
        const response = await api.get(`${API_BASE}/feed/posts`, { params });
        return response.data;
    },

    async getPost(postId: string): Promise<FeedPost> {
        const response = await api.get(`${API_BASE}/feed/posts/${postId}`);
        return response.data;
    },

    async createPost(data: {
        content: string;
        post_type: string;
        visibility: string;
        channel_id?: string;
        media_urls?: string[];
        hashtags?: string[];
        mentions?: string[];
    }): Promise<FeedPost> {
        const response = await api.post(`${API_BASE}/feed/posts`, data);
        return response.data;
    },

    async updatePost(postId: string, data: {
        content?: string;
        visibility?: string;
        hashtags?: string[];
    }): Promise<FeedPost> {
        const response = await api.put(`${API_BASE}/feed/posts/${postId}`, data);
        return response.data;
    },

    async deletePost(postId: string): Promise<void> {
        await api.delete(`${API_BASE}/feed/posts/${postId}`);
    },

    async approvePost(postId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/feed/posts/${postId}/approve`);
        return response.data;
    },

    async rejectPost(postId: string, reason?: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/feed/posts/${postId}/reject`, null, {
            params: { reason }
        });
        return response.data;
    },

    async pinPost(postId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/feed/posts/${postId}/pin`);
        return response.data;
    },

    async toggleReaction(postId: string, reactionType: string): Promise<PostReaction> {
        const response = await api.post(`${API_BASE}/feed/posts/${postId}/reactions`, null, {
            params: { reaction_type: reactionType }
        });
        return response.data;
    },

    // Comments
    async getComments(postId: string): Promise<PostComment[]> {
        const response = await api.get(`${API_BASE}/feed/posts/${postId}/comments`);
        return response.data;
    },

    async addComment(postId: string, content: string, parentId?: string): Promise<PostComment> {
        const response = await api.post(`${API_BASE}/feed/posts/${postId}/comments`, {
            content,
            parent_id: parentId
        });
        return response.data;
    },

    async likeComment(commentId: string): Promise<{ likes: string[] }> {
        const response = await api.post(`${API_BASE}/feed/comments/${commentId}/like`);
        return response.data;
    },

    // Stats & Trending
    async getStats(): Promise<FeedStats> {
        const response = await api.get(`${API_BASE}/feed/stats`);
        return response.data;
    },

    async getTrending(): Promise<TrendingTopic[]> {
        const response = await api.get(`${API_BASE}/feed/trending`);
        return response.data;
    },

    // Channels
    async getChannels(): Promise<FeedChannel[]> {
        const response = await api.get(`${API_BASE}/feed/channels`);
        return response.data;
    },

    async createChannel(data: {
        name: string;
        description?: string;
        channel_type: string;
        is_private?: boolean;
    }): Promise<FeedChannel> {
        const response = await api.post(`${API_BASE}/feed/channels`, data);
        return response.data;
    },

    // Media Upload
    async uploadMedia(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`${API_BASE}/feed/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

// ===========================
// CHAT SERVICE
// ===========================

export const chatService = {
    // Channels
    async getChannels(): Promise<ChatChannel[]> {
        const response = await api.get(`${API_BASE}/chat/channels`);
        return response.data;
    },

    async createChannel(data: {
        name: string;
        description?: string;
        channel_type: string;
        is_private?: boolean;
        members?: string[];
        avatar?: string;
    }): Promise<ChatChannel> {
        const response = await api.post(`${API_BASE}/chat/channels`, data);
        return response.data;
    },

    async getChannel(channelId: string): Promise<ChatChannel> {
        const response = await api.get(`${API_BASE}/chat/channels/${channelId}`);
        return response.data;
    },

    async updateChannel(channelId: string, data: {
        name?: string;
        description?: string;
        avatar?: string;
    }): Promise<ChatChannel> {
        const response = await api.put(`${API_BASE}/chat/channels/${channelId}`, data);
        return response.data;
    },

    async joinChannel(channelId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/chat/channels/${channelId}/join`);
        return response.data;
    },

    async leaveChannel(channelId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/chat/channels/${channelId}/leave`);
        return response.data;
    },

    async addChannelMember(channelId: string, userId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/chat/channels/${channelId}/members`, null, {
            params: { user_id: userId }
        });
        return response.data;
    },

    // Groups
    async getGroups(): Promise<ChatGroup[]> {
        const response = await api.get(`${API_BASE}/chat/groups`);
        return response.data;
    },

    async createGroup(data: {
        name: string;
        description?: string;
        avatar?: string;
        members: string[];
    }): Promise<ChatGroup> {
        const response = await api.post(`${API_BASE}/chat/groups`, data);
        return response.data;
    },

    async updateGroup(groupId: string, data: {
        name?: string;
        description?: string;
        avatar?: string;
    }): Promise<ChatGroup> {
        const response = await api.put(`${API_BASE}/chat/groups/${groupId}`, data);
        return response.data;
    },

    async addGroupMember(groupId: string, userId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/chat/groups/${groupId}/members`, null, {
            params: { user_id: userId }
        });
        return response.data;
    },

    async leaveGroup(groupId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/chat/groups/${groupId}/leave`);
        return response.data;
    },

    // Direct Messages
    async getDirectMessages(): Promise<DirectMessage[]> {
        const response = await api.get(`${API_BASE}/chat/dm`);
        return response.data;
    },

    async startDM(userId: string): Promise<DirectMessage> {
        const response = await api.post(`${API_BASE}/chat/dm/${userId}`);
        return response.data;
    },

    // Messages
    async getMessages(params: {
        channel_id?: string;
        group_id?: string;
        dm_id?: string;
        before?: string;
        limit?: number;
    }): Promise<ChatMessage[]> {
        const response = await api.get(`${API_BASE}/chat/messages`, { params });
        return response.data;
    },

    async sendMessage(data: {
        content?: string;
        message_type?: string;
        reply_to_id?: string;
        files?: { name: string; url: string; type: string; size: number }[];
        mentions?: string[];
        poll_data?: { question: string; options: string[] };
        sticker_id?: string;
    }, conversationId: {
        channel_id?: string;
        group_id?: string;
        dm_id?: string;
    }): Promise<ChatMessage> {
        const response = await api.post(`${API_BASE}/chat/messages`, data, {
            params: conversationId
        });
        return response.data;
    },

    async editMessage(messageId: string, content: string): Promise<ChatMessage> {
        const response = await api.put(`${API_BASE}/chat/messages/${messageId}`, { content });
        return response.data;
    },

    async deleteMessage(messageId: string): Promise<{ message: string }> {
        const response = await api.delete(`${API_BASE}/chat/messages/${messageId}`);
        return response.data;
    },

    // Users
    async getOnlineUsers(): Promise<UserBasic[]> {
        const response = await api.get(`${API_BASE}/chat/online-users`);
        return response.data;
    },

    async getUsers(params?: { search?: string; department?: string }): Promise<UserBasic[]> {
        const response = await api.get(`${API_BASE}/chat/users`, { params });
        return response.data;
    }
};

// ===========================
// CALLS SERVICE
// ===========================

export const callsService = {
    async getCalls(params?: {
        call_type?: 'voice' | 'video';
        status?: string;
        limit?: number;
    }): Promise<Call[]> {
        const response = await api.get(`${API_BASE}/calls`, { params });
        return response.data;
    },

    async getCall(callId: string): Promise<Call> {
        const response = await api.get(`${API_BASE}/calls/${callId}`);
        return response.data;
    },

    async initiateCall(data: {
        call_type: 'voice' | 'video';
        channel_id?: string;
        group_id?: string;
        dm_id?: string;
        participants?: string[];
    }): Promise<Call> {
        const response = await api.post(`${API_BASE}/calls`, data);
        return response.data;
    },

    async joinCall(callId: string): Promise<{ message: string; room_id: string }> {
        const response = await api.post(`${API_BASE}/calls/${callId}/join`);
        return response.data;
    },

    async leaveCall(callId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/calls/${callId}/leave`);
        return response.data;
    },

    async declineCall(callId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/calls/${callId}/decline`);
        return response.data;
    },

    async endCall(callId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/calls/${callId}/end`);
        return response.data;
    },

    async toggleMute(callId: string, isMuted: boolean): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/calls/${callId}/mute`, null, {
            params: { is_muted: isMuted }
        });
        return response.data;
    },

    async toggleVideo(callId: string, isVideoOn: boolean): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/calls/${callId}/video`, null, {
            params: { is_video_on: isVideoOn }
        });
        return response.data;
    },

    async toggleScreenShare(callId: string, isSharing: boolean): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/calls/${callId}/screen-share`, null, {
            params: { is_sharing: isSharing }
        });
        return response.data;
    },

    async getParticipants(callId: string): Promise<CallParticipant[]> {
        const response = await api.get(`${API_BASE}/calls/${callId}/participants`);
        return response.data;
    }
};

// ===========================
// RECOGNITION SERVICE
// ===========================

export const recognitionService = {
    // Formal Recognition
    async getRecognitions(params?: {
        recognition_type?: string;
        department?: string;
        is_approved?: boolean;
        skip?: number;
        limit?: number;
    }): Promise<Recognition[]> {
        const response = await api.get(`${API_BASE}/recognition`, { params });
        return response.data;
    },

    async createRecognition(data: {
        recipient_id: string;
        recognition_type: string;
        title: string;
        description?: string;
        achievement?: string;
        impact?: string;
        value_demonstrated?: string;
        points?: number;
        badge?: string;
        is_public?: boolean;
    }): Promise<Recognition> {
        const response = await api.post(`${API_BASE}/recognition`, data);
        return response.data;
    },

    async getPendingRecognitions(): Promise<Recognition[]> {
        const response = await api.get(`${API_BASE}/recognition/pending`);
        return response.data;
    },

    async approveRecognition(recognitionId: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/recognition/${recognitionId}/approve`);
        return response.data;
    },

    async rejectRecognition(recognitionId: string, reason?: string): Promise<{ message: string }> {
        const response = await api.post(`${API_BASE}/recognition/${recognitionId}/reject`, null, {
            params: { reason }
        });
        return response.data;
    },

    async reactToRecognition(recognitionId: string, emoji: string): Promise<{ reactions: Record<string, string[]> }> {
        const response = await api.post(`${API_BASE}/recognition/${recognitionId}/react`, null, {
            params: { emoji }
        });
        return response.data;
    },

    // Peer Kudos
    async getKudos(params?: {
        recipient_id?: string;
        sender_id?: string;
        department?: string;
        skip?: number;
        limit?: number;
    }): Promise<PeerKudos[]> {
        const response = await api.get(`${API_BASE}/recognition/kudos`, { params });
        return response.data;
    },

    async sendKudos(data: {
        recipient_id: string;
        message: string;
        category?: string;
        value?: string;
        emoji?: string;
        gif_url?: string;
        points?: number;
        is_public?: boolean;
    }): Promise<PeerKudos> {
        const response = await api.post(`${API_BASE}/recognition/kudos`, data);
        return response.data;
    },

    async reactToKudos(kudosId: string, emoji: string): Promise<{ reactions: Record<string, string[]> }> {
        const response = await api.post(`${API_BASE}/recognition/kudos/${kudosId}/react`, null, {
            params: { emoji }
        });
        return response.data;
    },

    // Stats
    async getStats(params?: {
        period?: 'week' | 'month' | 'quarter' | 'year';
        department?: string;
    }): Promise<RecognitionStats> {
        const response = await api.get(`${API_BASE}/recognition/stats`, { params });
        return response.data;
    },

    async getMyRecognition(): Promise<{
        total_points: number;
        recognition_count: number;
        kudos_received_count: number;
        kudos_given_count: number;
        recent_recognitions: Recognition[];
        recent_kudos: PeerKudos[];
    }> {
        const response = await api.get(`${API_BASE}/recognition/my-recognition`);
        return response.data;
    }
};

// ===========================
// WEBSOCKET SERVICE
// ===========================

type WebSocketCallback = (data: any) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private listeners: Map<string, Set<WebSocketCallback>> = new Map();
    private userId: string | null = null;
    private isConnecting = false;

    connect(userId: string): Promise<void> {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
            return Promise.resolve();
        }

        this.isConnecting = true;
        this.userId = userId;

        return new Promise((resolve, reject) => {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
            this.ws = new WebSocket(`${wsUrl}/api/v1/community/chat/ws/${userId}`);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnecting = false;
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
                reject(error);
            };
        });
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.userId) {
            console.log('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (this.userId) {
                this.connect(this.userId);
            }
        }, delay);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.userId = null;
        this.listeners.clear();
    }

    private handleMessage(data: any) {
        const type = data.type;
        const callbacks = this.listeners.get(type);
        
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }

        // Also notify 'all' listeners
        const allCallbacks = this.listeners.get('all');
        if (allCallbacks) {
            allCallbacks.forEach(callback => callback(data));
        }
    }

    on(event: string, callback: WebSocketCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: WebSocketCallback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    // Send message through WebSocket
    send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    // Send chat message
    sendMessage(message: {
        content?: string;
        message_type?: string;
        channel_id?: string;
        group_id?: string;
        dm_id?: string;
        reply_to_id?: string;
        files?: any[];
        mentions?: string[];
        poll_data?: any;
        sticker_id?: string;
    }) {
        this.send({
            type: 'message',
            ...message
        });
    }

    // Send typing indicator
    sendTyping(conversationType: 'channel' | 'group' | 'dm', conversationId: string, isTyping: boolean) {
        this.send({
            type: 'typing',
            conversation_type: conversationType,
            conversation_id: conversationId,
            is_typing: isTyping
        });
    }

    // Mark messages as read
    markRead(params: { channel_id?: string; group_id?: string; dm_id?: string }) {
        this.send({
            type: 'read',
            ...params
        });
    }

    // Send message reaction
    sendReaction(messageId: string, emoji: string) {
        this.send({
            type: 'reaction',
            message_id: messageId,
            emoji
        });
    }

    // WebRTC signaling
    sendCallSignal(callId: string, signalType: string, targetUserId: string, data: any) {
        this.send({
            type: 'call_signal',
            call_id: callId,
            signal_type: signalType,
            target_user_id: targetUserId,
            data
        });
    }

    // Call action (join, leave, etc.)
    sendCallAction(callId: string, action: string) {
        this.send({
            type: 'call_action',
            call_id: callId,
            action
        });
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const wsService = new WebSocketService();

// Export all services
export default {
    feed: feedService,
    chat: chatService,
    calls: callsService,
    recognition: recognitionService,
    ws: wsService
};
