'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { chatService, callsService, UserBasic, ChatChannel, ChatGroup, DirectMessage, ChatMessage, Call } from '@/services/communityService';
import { useWebSocket, useWebSocketEvent, useTypingIndicator, useOnlineUsers, useIncomingCall } from '@/hooks/use-websocket';
import { playMessageSent, playMessageReceived, playIncomingCall, playCallConnected, playCallEnded, playError, playMention } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import {
    MessageCircle,
    Users,
    User as UserIcon,
    Phone,
    Video,
    Search,
    Plus,
    MoreVertical,
    Hash,
    Send,
    Smile,
    Paperclip,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    X,
    Settings,
    Check,
    CheckCheck,
    Reply,
    Image as ImageIcon,
    Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ChatsPage() {
    const { user } = useAuthStore();
    const { addNotification } = useAppStore();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'channels' | 'dms' | 'groups'>('dms');
    const [selectedConversation, setSelectedConversation] = useState<{
        type: 'channel' | 'group' | 'dm';
        id: string;
        name: string;
        avatar?: string;
    } | null>(null);

    // Data states
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [dms, setDms] = useState<DirectMessage[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<UserBasic[]>([]);

    // UI states
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [newChatSearchTerm, setNewChatSearchTerm] = useState('');
    const [messageSearchTerm, setMessageSearchTerm] = useState('');
    const [searchMediaOnly, setSearchMediaOnly] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
    const [swipeStartX, setSwipeStartX] = useState<Record<string, number>>({});
    const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastKnownMessageIdRef = useRef<string | null>(null);
    const pollingRef = useRef(false);
    const selectedConversationRef = useRef(selectedConversation);
    selectedConversationRef.current = selectedConversation;

    // Call states
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);

    // WebSocket connection
    const { isConnected, connect } = useWebSocket({ autoConnect: true });
    const { onlineUsers, isOnline } = useOnlineUsers();
    const { incomingCall, dismissCall } = useIncomingCall();

    // Play sound for incoming call
    useEffect(() => {
        if (incomingCall) {
            playIncomingCall();
        }
    }, [incomingCall]);

    // Typing indicator
    const { typingUsers, sendTyping } = useTypingIndicator(
        selectedConversation?.type || 'dm',
        selectedConversation?.id || ''
    );

    // Load initial data
    useEffect(() => {
        loadChatData();
    }, []);

    // Connect WebSocket when user is available
    useEffect(() => {
        if (user?.id && !isConnected) {
            connect();
        }
    }, [user?.id, isConnected, connect]);

    // Load messages when conversation changes + start polling
    useEffect(() => {
        if (selectedConversation) {
            loadMessages();

            if (selectedConversation.type === 'dm') {
                setDms(prev => prev.map(dm =>
                    dm.id === selectedConversation.id ? { ...dm, unread_count: 0 } : dm
                ));
            } else if (selectedConversation.type === 'group') {
                setGroups(prev => prev.map(group =>
                    group.id === selectedConversation.id ? { ...group, unread_count: 0 } : group
                ));
            } else {
                setChannels(prev => prev.map(channel =>
                    channel.id === selectedConversation.id ? { ...channel, unread_count: 0 } : channel
                ));
            }

            // Start polling for new messages every 15 seconds
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = setInterval(() => {
                pollMessages();
            }, 15000);
        }

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [selectedConversation]);

    // Poll for sidebar unread counts + header notifications every 30s
    // Use refs so the effect only mounts once (no dependency-loop)
    const dmsRef = useRef(dms);
    dmsRef.current = dms;
    const groupsRef = useRef(groups);
    groupsRef.current = groups;
    const channelsRef = useRef(channels);
    channelsRef.current = channels;

    useEffect(() => {
        const notifTimer = setInterval(async () => {
            try {
                const [latestDms, latestGroups, latestChannels] = await Promise.all([
                    chatService.getDirectMessages(),
                    chatService.getGroups(),
                    chatService.getChannels(),
                ]);

                const curId = selectedConversationRef.current?.id;

                latestDms.forEach(dm => {
                    const prev = dmsRef.current.find(d => d.id === dm.id);
                    if (dm.unread_count > 0 && (!prev || dm.unread_count > (prev.unread_count || 0)) && dm.id !== curId) {
                        const name = dm.other_user ? `${dm.other_user.first_name} ${dm.other_user.last_name}` : 'Someone';
                        addNotification({
                            title: `New message from ${name}`,
                            message: dm.last_message_content || 'Sent a message',
                            type: 'info',
                            href: `/chats/real-time?type=dm&id=${dm.id}`,
                        });
                    }
                });

                latestGroups.forEach(group => {
                    const prev = groupsRef.current.find(g => g.id === group.id);
                    if (group.unread_count > 0 && (!prev || group.unread_count > (prev.unread_count || 0)) && group.id !== curId) {
                        addNotification({
                            title: `New message in ${group.name}`,
                            message: group.last_message_content || 'New activity',
                            type: 'info',
                            href: `/chats/real-time?type=group&id=${group.id}`,
                        });
                    }
                });

                latestChannels.forEach(channel => {
                    const prev = channelsRef.current.find(c => c.id === channel.id);
                    if (channel.unread_count > 0 && (!prev || channel.unread_count > (prev.unread_count || 0)) && channel.id !== curId) {
                        addNotification({
                            title: `New message in #${channel.name}`,
                            message: 'New activity',
                            type: 'info',
                            href: `/chats/real-time?type=channel&id=${channel.id}`,
                        });
                    }
                });

                setDms(latestDms);
                setGroups(latestGroups);
                setChannels(latestChannels);
            } catch {
                // silent
            }
        }, 30000);

        return () => clearInterval(notifTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for new messages
    useWebSocketEvent('new_message', (data) => {
        const message = data.message;
        const isInCurrentConversation = (
            (selectedConversation?.type === 'channel' && message.channel_id === selectedConversation.id) ||
            (selectedConversation?.type === 'group' && message.group_id === selectedConversation.id) ||
            (selectedConversation?.type === 'dm' && message.dm_id === selectedConversation.id)
        );

        if (
            isInCurrentConversation
        ) {
            setMessages(prev => {
                if (prev.some(item => item.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
            // Play sound for received messages (not from current user)
            if (message.sender_id !== user?.id) {
                playMessageReceived();
            }
        } else if (message.sender_id !== user?.id) {
            playMention();
            addNotification({
                title: `New message from ${message.sender_name}`,
                message: message.content || 'Sent an attachment',
                type: 'info',
                href: `/chats/real-time?type=${message.dm_id ? 'dm' : message.group_id ? 'group' : 'channel'}&id=${message.dm_id || message.group_id || message.channel_id || ''}`,
            });
        }

        // Update unread count in sidebar
        updateConversationUnread(message);
    });

    useEffect(() => {
        if (!selectedConversation || !messages.length) return;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, selectedConversation?.id]);

    useEffect(() => {
        const conversationId = searchParams.get('id');
        const conversationType = searchParams.get('type') as 'dm' | 'group' | 'channel' | null;
        if (!conversationId || !conversationType) return;

        if (conversationType === 'dm') {
            const dm = dms.find(item => item.id === conversationId);
            if (dm) {
                setSelectedConversation({
                    type: 'dm',
                    id: dm.id,
                    name: dm.other_user ? `${dm.other_user.first_name} ${dm.other_user.last_name}` : 'Unknown',
                    avatar: dm.other_user?.avatar,
                });
                setActiveTab('dms');
            }
        } else if (conversationType === 'group') {
            const group = groups.find(item => item.id === conversationId);
            if (group) {
                setSelectedConversation({
                    type: 'group',
                    id: group.id,
                    name: group.name,
                    avatar: group.avatar,
                });
                setActiveTab('groups');
            }
        } else if (conversationType === 'channel') {
            const channel = channels.find(item => item.id === conversationId);
            if (channel) {
                setSelectedConversation({
                    type: 'channel',
                    id: channel.id,
                    name: channel.name,
                    avatar: channel.avatar,
                });
                setActiveTab('channels');
            }
        }
    }, [searchParams, dms, groups, channels]);

    const loadChatData = async () => {
        try {
            setLoading(true);
            const [channelsData, groupsData, dmsData, usersData] = await Promise.all([
                chatService.getChannels(),
                chatService.getGroups(),
                chatService.getDirectMessages(),
                chatService.getUsers()
            ]);

            setChannels(channelsData);
            setGroups(groupsData);
            setDms(dmsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to load chat data:', error);
            toast.error('Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!selectedConversation) return;

        try {
            const params = {
                channel_id: selectedConversation.type === 'channel' ? selectedConversation.id : undefined,
                group_id: selectedConversation.type === 'group' ? selectedConversation.id : undefined,
                dm_id: selectedConversation.type === 'dm' ? selectedConversation.id : undefined,
            };

            const messagesData = await chatService.getMessages(params);
            setMessages(messagesData);
            if (messagesData.length > 0) {
                lastKnownMessageIdRef.current = messagesData[messagesData.length - 1].id;
            }

            // Mark as read via REST (reliable, doesn't depend on WebSocket)
            try {
                await chatService.markMessagesRead(params);
            } catch {
                // fallback: ignore if endpoint not available yet
            }
            setMessages(prev => prev.map(msg => {
                if (msg.sender_id === user?.id) return msg;
                const readBy = msg.read_by || [];
                if (!user?.id || readBy.includes(user.id)) return msg;
                return { ...msg, read_by: [...readBy, user.id] };
            }));
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const pollMessages = async () => {
        const conv = selectedConversationRef.current;
        if (!conv || pollingRef.current) return;
        pollingRef.current = true;
        try {
            const params = {
                channel_id: conv.type === 'channel' ? conv.id : undefined,
                group_id: conv.type === 'group' ? conv.id : undefined,
                dm_id: conv.type === 'dm' ? conv.id : undefined,
            };

            const freshMessages = await chatService.getMessages(params);

            setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const newOnes = freshMessages.filter(m => !existingIds.has(m.id));
                if (newOnes.length === 0) {
                    // Update read_by from server for existing messages
                    const freshMap = new Map(freshMessages.map(m => [m.id, m]));
                    let changed = false;
                    const updated = prev.map(m => {
                        const serverMsg = freshMap.get(m.id);
                        if (serverMsg && JSON.stringify(serverMsg.read_by) !== JSON.stringify(m.read_by)) {
                            changed = true;
                            return { ...m, read_by: serverMsg.read_by };
                        }
                        return m;
                    });
                    return changed ? updated : prev;
                }
                // Play sound once for new received messages
                if (newOnes.some(msg => msg.sender_id !== user?.id)) {
                    playMessageReceived();
                }
                return [...prev, ...newOnes];
            });

            // Mark read once (lightweight – backend skips already-read messages)
            try { await chatService.markMessagesRead(params); } catch { /* ignore */ }
        } catch {
            // silent poll failure
        } finally {
            pollingRef.current = false;
        }
    };

    const updateConversationUnread = (message: ChatMessage) => {
        // Update unread count for the conversation
        if (message.channel_id) {
            setChannels(prev => prev.map(c =>
                c.id === message.channel_id && selectedConversation?.id !== c.id
                    ? { ...c, unread_count: (c.unread_count || 0) + 1 }
                    : c
            ));
        } else if (message.group_id) {
            setGroups(prev => prev.map(g =>
                g.id === message.group_id && selectedConversation?.id !== g.id
                    ? { ...g, unread_count: (g.unread_count || 0) + 1 }
                    : g
            ));
        } else if (message.dm_id) {
            setDms(prev => prev.map(d =>
                d.id === message.dm_id && selectedConversation?.id !== d.id
                    ? { ...d, unread_count: (d.unread_count || 0) + 1 }
                    : d
            ));
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            const trimmed = messageInput.trim();
            const conversation = {
                channel_id: selectedConversation.type === 'channel' ? selectedConversation.id : undefined,
                group_id: selectedConversation.type === 'group' ? selectedConversation.id : undefined,
                dm_id: selectedConversation.type === 'dm' ? selectedConversation.id : undefined,
            };

            const savedMessage = await chatService.sendMessage({
                content: trimmed,
                message_type: 'text',
                reply_to_id: replyingTo?.id,
            }, conversation);

            setMessages(prev => {
                if (prev.some(item => item.id === savedMessage.id)) {
                    return prev;
                }
                return [...prev, savedMessage];
            });

            playMessageSent();
            setMessageInput('');
            setReplyingTo(null);
            sendTyping(false);
        } catch (error) {
            playError();
            toast.error('Failed to send message');
        }
    };

    const handleTyping = (value: string) => {
        setMessageInput(value);
        sendTyping(value.length > 0);
    };

    const handleStartDM = async (userId: string) => {
        try {
            const dm = await chatService.startDM(userId);
            setDms(prev => {
                const exists = prev.find(d => d.id === dm.id);
                if (exists) return prev;
                return [dm, ...prev];
            });

            setSelectedConversation({
                type: 'dm',
                id: dm.id,
                name: dm.other_user ? `${dm.other_user.first_name} ${dm.other_user.last_name}` : 'Unknown',
                avatar: dm.other_user?.avatar
            });
            setShowNewChat(false);
            setNewChatSearchTerm('');
        } catch (error) {
            toast.error('Failed to start conversation');
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || newGroupMembers.length === 0) {
            toast.error('Please enter a group name and select members');
            return;
        }

        try {
            const group = await chatService.createGroup({
                name: newGroupName,
                members: newGroupMembers
            });

            setGroups(prev => [group, ...prev]);
            setSelectedConversation({
                type: 'group',
                id: group.id,
                name: group.name,
                avatar: group.avatar
            });

            setShowNewGroup(false);
            setNewGroupName('');
            setNewGroupMembers([]);
            toast.success('Group created!');
        } catch (error) {
            toast.error('Failed to create group');
        }
    };

    const handleStartCall = async (type: 'voice' | 'video') => {
        if (!selectedConversation) return;

        try {
            const call = await callsService.initiateCall({
                call_type: type,
                channel_id: selectedConversation.type === 'channel' ? selectedConversation.id : undefined,
                group_id: selectedConversation.type === 'group' ? selectedConversation.id : undefined,
                dm_id: selectedConversation.type === 'dm' ? selectedConversation.id : undefined,
            });

            setActiveCall(call);
            setIsVideoOn(type === 'video');
            toast.success(`${type === 'video' ? 'Video' : 'Voice'} call started`);
        } catch (error) {
            toast.error('Failed to start call');
        }
    };

    const handleJoinCall = async () => {
        if (!incomingCall) return;

        try {
            await callsService.joinCall(incomingCall.callId);
            setActiveCall({
                id: incomingCall.callId,
                call_type: incomingCall.callType,
                room_id: incomingCall.roomId,
            } as Call);
            setIsVideoOn(incomingCall.callType === 'video');
            playCallConnected();
            dismissCall();
        } catch (error) {
            playError();
            toast.error('Failed to join call');
        }
    };

    const handleDeclineCall = async () => {
        if (!incomingCall) return;

        try {
            await callsService.declineCall(incomingCall.callId);
            dismissCall();
        } catch (error) {
            console.error('Failed to decline call:', error);
        }
    };

    const handleEndCall = async () => {
        if (!activeCall) return;

        try {
            await callsService.leaveCall(activeCall.id);
            playCallEnded();
            setActiveCall(null);
        } catch (error) {
            toast.error('Failed to end call');
        }
    };

    const handleToggleMute = async () => {
        if (!activeCall) return;

        try {
            await callsService.toggleMute(activeCall.id, !isMuted);
            setIsMuted(!isMuted);
        } catch (error) {
            toast.error('Failed to toggle mute');
        }
    };

    const handleToggleVideo = async () => {
        if (!activeCall) return;

        try {
            await callsService.toggleVideo(activeCall.id, !isVideoOn);
            setIsVideoOn(!isVideoOn);
        } catch (error) {
            toast.error('Failed to toggle video');
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isSameDay = (a: string, b: string) => {
        const da = new Date(a);
        const db = new Date(b);
        return (
            da.getFullYear() === db.getFullYear() &&
            da.getMonth() === db.getMonth() &&
            da.getDate() === db.getDate()
        );
    };

    const getDayLabel = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        if (isSameDay(date.toISOString(), now.toISOString())) return 'Today';
        if (isSameDay(date.toISOString(), yesterday.toISOString())) return 'Yesterday';

        return date.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const selectedDM = selectedConversation?.type === 'dm'
        ? dms.find(dm => dm.id === selectedConversation.id)
        : null;

    const profileUser = selectedDM?.other_user;

    const messagesById = useMemo(() => {
        return new Map(messages.map(message => [message.id, message]));
    }, [messages]);

    const filteredMessages = useMemo(() => {
        const query = messageSearchTerm.trim().toLowerCase();
        if (!query) return messages;

        return messages.filter(message => {
            const fileSearch = (message.files || []).some(file =>
                file.name.toLowerCase().includes(query) ||
                file.type.toLowerCase().includes(query) ||
                file.url.toLowerCase().includes(query)
            );

            const hasMedia = (message.files || []).some(file =>
                file.type.startsWith('image/') || file.type.startsWith('video/')
            ) || /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi)$/i.test(message.content || '');

            if (searchMediaOnly) {
                return hasMedia && fileSearch;
            }

            return (
                (message.content || '').toLowerCase().includes(query) ||
                message.sender_name.toLowerCase().includes(query) ||
                fileSearch
            );
        });
    }, [messages, messageSearchTerm, searchMediaOnly]);

    const handleConversationSelect = (conversation: {
        type: 'channel' | 'group' | 'dm';
        id: string;
        name: string;
        avatar?: string;
    }) => {
        setSelectedConversation(conversation);
        setMobileSidebarOpen(false);
    };

    const handleTouchStart = (messageId: string, clientX: number) => {
        setSwipeStartX(prev => ({ ...prev, [messageId]: clientX }));
    };

    const handleTouchMove = (messageId: string, clientX: number, isOwn: boolean) => {
        if (isOwn) return;
        const startX = swipeStartX[messageId];
        if (startX === undefined) return;
        const delta = Math.max(0, Math.min(90, clientX - startX));
        setSwipeOffset(prev => ({ ...prev, [messageId]: delta }));
    };

    const handleTouchEnd = (message: ChatMessage, isOwn: boolean) => {
        if (!isOwn && (swipeOffset[message.id] || 0) > 60) {
            setReplyingTo(message);
        }
        setSwipeStartX(prev => ({ ...prev, [message.id]: 0 }));
        setSwipeOffset(prev => ({ ...prev, [message.id]: 0 }));
    };

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-[86%] max-w-80 border-r bg-white flex flex-col
                transition-transform duration-300 md:static md:w-80 md:max-w-none md:translate-x-0
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold">Chats</h1>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setShowNewChat(true)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search conversations..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger value="dms" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                            <UserIcon className="h-4 w-4 mr-2" />
                            Direct
                        </TabsTrigger>
                        <TabsTrigger value="groups" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                            <Users className="h-4 w-4 mr-2" />
                            Groups
                        </TabsTrigger>
                        <TabsTrigger value="channels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                            <Hash className="h-4 w-4 mr-2" />
                            Channels
                        </TabsTrigger>
                    </TabsList>

                    {/* Conversations List */}
                    <ScrollArea className="flex-1">
                        <TabsContent value="dms" className="m-0 p-2">
                            {dms
                                .filter(dm => {
                                    const displayName = dm.other_user ? `${dm.other_user.first_name} ${dm.other_user.last_name}` : 'Unknown';
                                    const lastMessage = dm.last_message_content || '';
                                    const query = searchTerm.toLowerCase();
                                    return displayName.toLowerCase().includes(query) || lastMessage.toLowerCase().includes(query);
                                })
                                .map((dm) => (
                                <div
                                    key={dm.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                        selectedConversation?.id === dm.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleConversationSelect({
                                        type: 'dm',
                                        id: dm.id,
                                        name: dm.other_user ? `${dm.other_user.first_name} ${dm.other_user.last_name}` : 'Unknown',
                                        avatar: dm.other_user?.avatar
                                    })}
                                >
                                    <div className="relative">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={dm.other_user?.avatar} />
                                            <AvatarFallback>
                                                {dm.other_user ? getInitials(`${dm.other_user.first_name} ${dm.other_user.last_name}`) : '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {dm.other_user && isOnline(dm.other_user.id) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">
                                                {dm.other_user ? `${dm.other_user.first_name} ${dm.other_user.last_name}` : 'Unknown'}
                                            </span>
                                            {dm.unread_count > 0 && (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                                    {dm.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {dm.last_message_content || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="groups" className="m-0 p-2">
                            <Button
                                variant="outline"
                                className="w-full mb-2"
                                onClick={() => setShowNewGroup(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Group
                            </Button>
                            {groups
                                .filter(group => {
                                    const query = searchTerm.toLowerCase();
                                    return (
                                        group.name.toLowerCase().includes(query) ||
                                        (group.last_message_content || '').toLowerCase().includes(query)
                                    );
                                })
                                .map((group) => (
                                <div
                                    key={group.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                        selectedConversation?.id === group.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleConversationSelect({
                                        type: 'group',
                                        id: group.id,
                                        name: group.name,
                                        avatar: group.avatar
                                    })}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={group.avatar} />
                                        <AvatarFallback className="bg-purple-100 text-purple-600">
                                            <Users className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">{group.name}</span>
                                            {group.unread_count > 0 && (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                                    {group.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {group.members.length} members • {group.last_message_content || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="channels" className="m-0 p-2">
                            {channels
                                .filter(channel => {
                                    const query = searchTerm.toLowerCase();
                                    return channel.name.toLowerCase().includes(query);
                                })
                                .map((channel) => (
                                <div
                                    key={channel.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                        selectedConversation?.id === channel.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleConversationSelect({
                                        type: 'channel',
                                        id: channel.id,
                                        name: channel.name,
                                        avatar: channel.avatar
                                    })}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Hash className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">{channel.name}</span>
                                            {channel.unread_count > 0 && (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                                    {channel.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {channel.members.length} members
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </aside>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 md:p-4 border-b bg-white space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="md:hidden"
                                        onClick={() => setMobileSidebarOpen(true)}
                                    >
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 min-w-0 text-left"
                                        onClick={() => selectedConversation.type === 'dm' && setShowProfileDrawer(true)}
                                    >
                                        <Avatar className="h-9 w-9 md:h-10 md:w-10">
                                            <AvatarImage src={selectedConversation.avatar} />
                                            <AvatarFallback>
                                                {selectedConversation.type === 'channel' ? (
                                                    <Hash className="h-4 w-4" />
                                                ) : selectedConversation.type === 'group' ? (
                                                    <Users className="h-4 w-4" />
                                                ) : (
                                                    getInitials(selectedConversation.name)
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <h2 className="font-semibold truncate">{selectedConversation.name}</h2>
                                            {typingUsers.length > 0 ? (
                                                <p className="text-xs text-green-600 truncate">
                                                    {typingUsers.map(u => u.userName).join(', ')} typing...
                                                </p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedConversation.type === 'dm' ? 'Tap contact to view profile' : 'Conversation'}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => handleStartCall('voice')}>
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleStartCall('video')}>
                                        <Video className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={messageSearchTerm}
                                        onChange={(e) => setMessageSearchTerm(e.target.value)}
                                        placeholder="Search messages and media..."
                                        className="pl-9"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant={searchMediaOnly ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSearchMediaOnly(prev => !prev)}
                                >
                                    <ImageIcon className="h-4 w-4 mr-1" />
                                    Media
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-3 md:p-4">
                            <div className="space-y-4">
                                {filteredMessages.map((message, index) => {
                                    const isOwn = message.sender_id === user?.id;
                                    const referenced = message.reply_to_id ? messagesById.get(message.reply_to_id) : undefined;
                                    const otherReadCount = (message.read_by || []).filter(id => id !== message.sender_id).length;
                                    const gestureOffset = swipeOffset[message.id] || 0;
                                    const previousMessage = index > 0 ? filteredMessages[index - 1] : null;
                                    const showDaySeparator = !previousMessage || !isSameDay(previousMessage.created_at, message.created_at);

                                    return (
                                        <div key={message.id}>
                                            {showDaySeparator && (
                                                <div className="flex items-center justify-center my-3">
                                                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                                                        {getDayLabel(message.created_at)}
                                                    </span>
                                                </div>
                                            )}

                                            <div
                                                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                                                onTouchStart={(event) => handleTouchStart(message.id, event.touches[0].clientX)}
                                                onTouchMove={(event) => handleTouchMove(message.id, event.touches[0].clientX, isOwn)}
                                                onTouchEnd={() => handleTouchEnd(message, isOwn)}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={message.sender_avatar} />
                                                    <AvatarFallback>
                                                        {getInitials(message.sender_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`max-w-[85%] md:max-w-[70%] transition-transform ${isOwn ? 'items-end' : ''}`}
                                                    style={{ transform: `translateX(${isOwn ? 0 : gestureOffset}px)` }}
                                                >
                                                    {!isOwn && (
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            {message.sender_name}
                                                        </p>
                                                    )}

                                                    {!isOwn && gestureOffset > 18 && (
                                                        <div className="mb-1 flex items-center text-xs text-blue-600">
                                                            <Reply className="h-3 w-3 mr-1" />
                                                            Swipe to reply
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`rounded-2xl p-3 shadow-sm ${
                                                            isOwn
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white border text-gray-900'
                                                        }`}
                                                    >
                                                        {referenced && (
                                                            <div className={`mb-2 rounded-md px-2 py-1 text-xs ${isOwn ? 'bg-blue-500/60' : 'bg-muted'}`}>
                                                                <p className="font-medium truncate">{referenced.sender_name}</p>
                                                                <p className="truncate opacity-90">{referenced.content || '[Attachment]'}</p>
                                                            </div>
                                                        )}
                                                        {message.is_deleted ? (
                                                            <p className="text-sm italic opacity-70">[Message deleted]</p>
                                                        ) : (
                                                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs text-muted-foreground mt-1 flex items-center gap-1 ${isOwn ? 'justify-end' : ''}`}>
                                                        {formatTime(message.created_at)}
                                                        {message.is_edited && ' (edited)'}
                                                        {isOwn && (
                                                            otherReadCount > 0 ? (
                                                                <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                                            ) : (
                                                                <Check className="h-3.5 w-3.5 text-gray-400" />
                                                            )
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredMessages.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-12">
                                        No messages match this search.
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t bg-white">
                            {replyingTo && (
                                <div className="mb-2 rounded-md border bg-muted/40 p-2 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-blue-600">Replying to {replyingTo.sender_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{replyingTo.content || '[Attachment]'}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setReplyingTo(null)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost">
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Input
                                    placeholder={replyingTo ? `Reply to ${replyingTo.sender_name}...` : 'Type a message...'}
                                    value={messageInput}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                    className="flex-1"
                                />
                                <Button size="sm" variant="ghost">
                                    <Smile className="h-4 w-4" />
                                </Button>
                                <Button size="sm" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Select a conversation to start chatting</p>
                            <Button className="mt-4 md:hidden" onClick={() => setMobileSidebarOpen(true)}>
                                <Menu className="h-4 w-4 mr-2" />
                                Browse chats
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Drawer open={showProfileDrawer} onOpenChange={setShowProfileDrawer}>
                <DrawerContent className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle>Contact profile</DrawerTitle>
                        <DrawerDescription>
                            Basic details for this chat contact.
                        </DrawerDescription>
                    </DrawerHeader>
                    {profileUser ? (
                        <div className="px-4 pb-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={profileUser.avatar} />
                                    <AvatarFallback>
                                        {getInitials(`${profileUser.first_name} ${profileUser.last_name}`)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{profileUser.first_name} {profileUser.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{profileUser.role || 'Team member'}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3 space-y-2 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium text-right break-all">{profileUser.email || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">Role</span>
                                    <span className="font-medium text-right">{profileUser.role || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">Department</span>
                                    <span className="font-medium text-right">{profileUser.department || '—'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 pb-6 text-sm text-muted-foreground">Profile details are unavailable for this conversation.</div>
                    )}
                </DrawerContent>
            </Drawer>

            {/* Active Call UI */}
            {activeCall && (
                <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {activeCall.call_type === 'video' ? (
                                <Video className="h-5 w-5" />
                            ) : (
                                <Phone className="h-5 w-5" />
                            )}
                            <span>In call</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant={isMuted ? 'destructive' : 'secondary'}
                                onClick={handleToggleMute}
                            >
                                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                            {activeCall.call_type === 'video' && (
                                <Button
                                    size="sm"
                                    variant={!isVideoOn ? 'destructive' : 'secondary'}
                                    onClick={handleToggleVideo}
                                >
                                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                                </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={handleEndCall}>
                                <PhoneOff className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Incoming Call Dialog */}
            <Dialog open={!!incomingCall} onOpenChange={() => dismissCall()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Incoming {incomingCall?.callType} call</DialogTitle>
                        <DialogDescription>
                            {incomingCall?.initiatorName} is calling you
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={incomingCall?.initiatorAvatar} />
                            <AvatarFallback className="text-2xl">
                                {incomingCall?.initiatorName ? getInitials(incomingCall.initiatorName) : '?'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <DialogFooter className="flex justify-center gap-4">
                        <Button variant="destructive" onClick={handleDeclineCall}>
                            <PhoneOff className="h-4 w-4 mr-2" />
                            Decline
                        </Button>
                        <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleJoinCall}>
                            {incomingCall?.callType === 'video' ? (
                                <Video className="h-4 w-4 mr-2" />
                            ) : (
                                <Phone className="h-4 w-4 mr-2" />
                            )}
                            Answer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Chat Dialog */}
            <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start a conversation</DialogTitle>
                        <DialogDescription>
                            Search for a colleague to start chatting
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Search users..."
                            value={newChatSearchTerm}
                            onChange={(e) => setNewChatSearchTerm(e.target.value)}
                            className="mb-4"
                        />
                        <ScrollArea className="h-64">
                            <div className="space-y-2">
                                {users
                                    .filter(u =>
                                        `${u.first_name} ${u.last_name}`.toLowerCase().includes(newChatSearchTerm.toLowerCase())
                                    )
                                    .map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleStartDM(u.id)}
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={u.avatar} />
                                                <AvatarFallback>
                                                    {getInitials(`${u.first_name} ${u.last_name}`)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{u.first_name} {u.last_name}</p>
                                                <p className="text-xs text-muted-foreground">{u.department}</p>
                                            </div>
                                            {isOnline(u.id) && (
                                                <Badge variant="secondary" className="ml-auto">Online</Badge>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {/* New Group Dialog */}
            <Dialog open={showNewGroup} onOpenChange={setShowNewGroup}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a group</DialogTitle>
                        <DialogDescription>
                            Add members to start a group conversation
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input
                            placeholder="Group name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <ScrollArea className="h-48 border rounded-md p-2">
                            <div className="space-y-2">
                                {users.map((u) => (
                                    <div
                                        key={u.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                                            newGroupMembers.includes(u.id) ? 'bg-blue-50' : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() => {
                                            setNewGroupMembers(prev =>
                                                prev.includes(u.id)
                                                    ? prev.filter(id => id !== u.id)
                                                    : [...prev, u.id]
                                            );
                                        }}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={u.avatar} />
                                            <AvatarFallback>
                                                {getInitials(`${u.first_name} ${u.last_name}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="font-medium text-sm">{u.first_name} {u.last_name}</p>
                                        {newGroupMembers.includes(u.id) && (
                                            <Badge className="ml-auto">Selected</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewGroup(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || newGroupMembers.length === 0}>
                            Create Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
