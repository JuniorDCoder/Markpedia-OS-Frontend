/**
 * useWebSocket - React hook for WebSocket connection management
 * Provides real-time communication for chat, calls, and notifications
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { wsService } from '@/services/communityService';
import { useAuthStore } from '@/store/auth';

export interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

export interface UseWebSocketOptions {
    autoConnect?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const { autoConnect = true, onConnect, onDisconnect, onError } = options;
    const { user } = useAuthStore();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<Error | null>(null);

    // Connect on mount if autoConnect is enabled
    useEffect(() => {
        if (autoConnect && user?.id) {
            connect();
        }

        return () => {
            if (!autoConnect) {
                disconnect();
            }
        };
    }, [user?.id, autoConnect]);

    const connect = useCallback(async () => {
        if (!user?.id) {
            console.warn('Cannot connect WebSocket: No user ID');
            return;
        }

        try {
            await wsService.connect(user.id);
            setIsConnected(true);
            setConnectionError(null);
            onConnect?.();
        } catch (error) {
            setConnectionError(error as Error);
            onError?.(error as Event);
        }
    }, [user?.id, onConnect, onError]);

    const disconnect = useCallback(() => {
        wsService.disconnect();
        setIsConnected(false);
        onDisconnect?.();
    }, [onDisconnect]);

    return {
        isConnected,
        connectionError,
        connect,
        disconnect,
        send: wsService.send.bind(wsService),
        sendMessage: wsService.sendMessage.bind(wsService),
        sendTyping: wsService.sendTyping.bind(wsService),
        markRead: wsService.markRead.bind(wsService),
        sendReaction: wsService.sendReaction.bind(wsService),
        sendCallSignal: wsService.sendCallSignal.bind(wsService),
        sendCallAction: wsService.sendCallAction.bind(wsService),
    };
}

/**
 * useWebSocketEvent - Subscribe to specific WebSocket events
 */
export function useWebSocketEvent<T = any>(
    eventType: string,
    callback: (data: T) => void,
    deps: any[] = []
) {
    const savedCallback = useRef(callback);

    // Update ref when callback changes
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback, ...deps]);

    useEffect(() => {
        const handler = (data: T) => {
            savedCallback.current(data);
        };

        wsService.on(eventType, handler);

        return () => {
            wsService.off(eventType, handler);
        };
    }, [eventType]);
}

/**
 * useTypingIndicator - Manage typing indicator state
 */
export function useTypingIndicator(conversationType: 'channel' | 'group' | 'dm', conversationId: string) {
    const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
    const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Listen for typing events
    useWebSocketEvent('typing', (data: any) => {
        if (
            data.conversation_type === conversationType &&
            data.conversation_id === conversationId
        ) {
            const { user_id, user_name, is_typing } = data;

            if (is_typing) {
                // Add to typing users
                setTypingUsers(prev => {
                    if (!prev.find(u => u.userId === user_id)) {
                        return [...prev, { userId: user_id, userName: user_name }];
                    }
                    return prev;
                });

                // Clear existing timeout
                const existingTimeout = typingTimeouts.current.get(user_id);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }

                // Set timeout to remove typing indicator
                const timeout = setTimeout(() => {
                    setTypingUsers(prev => prev.filter(u => u.userId !== user_id));
                    typingTimeouts.current.delete(user_id);
                }, 3000);

                typingTimeouts.current.set(user_id, timeout);
            } else {
                // Remove from typing users
                setTypingUsers(prev => prev.filter(u => u.userId !== user_id));
                const timeout = typingTimeouts.current.get(user_id);
                if (timeout) {
                    clearTimeout(timeout);
                    typingTimeouts.current.delete(user_id);
                }
            }
        }
    });

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
            typingTimeouts.current.clear();
        };
    }, []);

    // Send typing indicator
    const sendTyping = useCallback((isTyping: boolean) => {
        wsService.sendTyping(conversationType, conversationId, isTyping);
    }, [conversationType, conversationId]);

    return { typingUsers, sendTyping };
}

/**
 * useChatMessages - Manage chat messages with real-time updates
 */
export function useChatMessages(params: {
    channelId?: string;
    groupId?: string;
    dmId?: string;
}) {
    const [messages, setMessages] = useState<any[]>([]);
    const { channelId, groupId, dmId } = params;

    // Listen for new messages
    useWebSocketEvent('new_message', (data: any) => {
        const message = data.message;
        const isRelevant =
            (channelId && message.channel_id === channelId) ||
            (groupId && message.group_id === groupId) ||
            (dmId && message.dm_id === dmId);

        if (isRelevant) {
            setMessages(prev => [...prev, message]);
        }
    });

    // Listen for message reactions
    useWebSocketEvent('message_reaction', (data: any) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === data.message_id
                    ? { ...msg, reactions: data.reactions }
                    : msg
            )
        );
    });

    // Listen for message edits
    useWebSocketEvent('message_edited', (data: any) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === data.message_id
                    ? { ...msg, content: data.content, is_edited: true }
                    : msg
            )
        );
    });

    // Listen for message deletions
    useWebSocketEvent('message_deleted', (data: any) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === data.message_id
                    ? { ...msg, is_deleted: true, content: '[Message deleted]' }
                    : msg
            )
        );
    });

    return { messages, setMessages };
}

/**
 * useOnlineUsers - Track online users
 */
export function useOnlineUsers() {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    // Listen for presence updates
    useWebSocketEvent('presence_update', (data: any) => {
        setOnlineUsers(prev => {
            const updated = new Set(prev);
            if (data.status === 'online') {
                updated.add(data.user_id);
            } else {
                updated.delete(data.user_id);
            }
            return updated;
        });
    });

    // Listen for user list updates
    useWebSocketEvent('online_users', (data: any) => {
        setOnlineUsers(new Set(data.users));
    });

    const isOnline = useCallback((userId: string) => onlineUsers.has(userId), [onlineUsers]);

    return { onlineUsers, isOnline };
}

/**
 * useIncomingCall - Handle incoming call notifications
 */
export function useIncomingCall() {
    const [incomingCall, setIncomingCall] = useState<{
        callId: string;
        initiatorId: string;
        initiatorName: string;
        initiatorAvatar?: string;
        callType: 'voice' | 'video';
        roomId: string;
    } | null>(null);

    useWebSocketEvent('incoming_call', (data: any) => {
        setIncomingCall({
            callId: data.call.id,
            initiatorId: data.call.initiator_id,
            initiatorName: data.call.initiator_name,
            initiatorAvatar: data.call.initiator_avatar,
            callType: data.call.call_type,
            roomId: data.call.room_id,
        });
    });

    useWebSocketEvent('call_declined', () => {
        setIncomingCall(null);
    });

    useWebSocketEvent('call_ended', () => {
        setIncomingCall(null);
    });

    const dismissCall = useCallback(() => {
        setIncomingCall(null);
    }, []);

    return { incomingCall, dismissCall };
}

/**
 * useCallParticipants - Track call participants
 */
export function useCallParticipants(callId: string) {
    const [participants, setParticipants] = useState<any[]>([]);

    useWebSocketEvent('participant_joined', (data: any) => {
        if (data.call_id === callId) {
            setParticipants(prev => {
                if (!prev.find(p => p.user_id === data.user_id)) {
                    return [...prev, {
                        user_id: data.user_id,
                        user_name: data.user_name,
                        user_avatar: data.user_avatar,
                        is_muted: false,
                        is_video_on: true,
                        is_screen_sharing: false,
                    }];
                }
                return prev;
            });
        }
    });

    useWebSocketEvent('participant_left', (data: any) => {
        if (data.call_id === callId) {
            setParticipants(prev => prev.filter(p => p.user_id !== data.user_id));
        }
    });

    useWebSocketEvent('participant_mute_changed', (data: any) => {
        if (data.call_id === callId) {
            setParticipants(prev =>
                prev.map(p =>
                    p.user_id === data.user_id ? { ...p, is_muted: data.is_muted } : p
                )
            );
        }
    });

    useWebSocketEvent('participant_video_changed', (data: any) => {
        if (data.call_id === callId) {
            setParticipants(prev =>
                prev.map(p =>
                    p.user_id === data.user_id ? { ...p, is_video_on: data.is_video_on } : p
                )
            );
        }
    });

    useWebSocketEvent('participant_screen_share_changed', (data: any) => {
        if (data.call_id === callId) {
            setParticipants(prev =>
                prev.map(p =>
                    p.user_id === data.user_id ? { ...p, is_screen_sharing: data.is_screen_sharing } : p
                )
            );
        }
    });

    return { participants, setParticipants };
}

/**
 * useFeedNotifications - Listen for feed updates
 */
export function useFeedNotifications(callback: (notification: any) => void) {
    useWebSocketEvent('feed_notification', callback);
    useWebSocketEvent('new_recognition', callback);
    useWebSocketEvent('new_kudos', callback);
}

export default useWebSocket;
