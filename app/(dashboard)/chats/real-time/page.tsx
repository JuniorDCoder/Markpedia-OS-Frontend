'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { chatService, callsService, wsService, UserBasic, ChatChannel, ChatGroup, DirectMessage, ChatMessage, Call } from '@/services/communityService';
import { useWebSocket, useWebSocketEvent, useTypingIndicator, useChatMessages, useOnlineUsers, useIncomingCall } from '@/hooks/use-websocket';
import { playMessageSent, playMessageReceived, playIncomingCall, playCallConnected, playCallEnded, playError } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TableSkeleton } from '@/components/ui/loading';
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
    Volume2,
    FileText,
    Send,
    Smile,
    Paperclip,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    X,
    Settings,
    Bell,
    ChevronLeft
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
    const [showNewChat, setShowNewChat] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);

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

    // Load messages when conversation changes
    useEffect(() => {
        if (selectedConversation) {
            loadMessages();
        }
    }, [selectedConversation]);

    // Listen for new messages
    useWebSocketEvent('new_message', (data) => {
        const message = data.message;
        if (
            (selectedConversation?.type === 'channel' && message.channel_id === selectedConversation.id) ||
            (selectedConversation?.type === 'group' && message.group_id === selectedConversation.id) ||
            (selectedConversation?.type === 'dm' && message.dm_id === selectedConversation.id)
        ) {
            setMessages(prev => [...prev, message]);
            // Play sound for received messages (not from current user)
            if (message.sender_id !== user?.id) {
                playMessageReceived();
            }
        }

        // Update unread count in sidebar
        updateConversationUnread(message);
    });

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

            // Mark as read
            wsService.markRead(params);
        } catch (error) {
            console.error('Failed to load messages:', error);
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
            // Send via WebSocket for real-time
            wsService.sendMessage({
                content: messageInput,
                message_type: 'text',
                channel_id: selectedConversation.type === 'channel' ? selectedConversation.id : undefined,
                group_id: selectedConversation.type === 'group' ? selectedConversation.id : undefined,
                dm_id: selectedConversation.type === 'dm' ? selectedConversation.id : undefined,
            });

            playMessageSent();
            setMessageInput('');
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

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 border-r bg-white flex flex-col">
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
                            {dms.map((dm) => (
                                <div
                                    key={dm.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                        selectedConversation?.id === dm.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => setSelectedConversation({
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
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                        selectedConversation?.id === group.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => setSelectedConversation({
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
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                        selectedConversation?.id === channel.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => setSelectedConversation({
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
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
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
                                <div>
                                    <h2 className="font-semibold">{selectedConversation.name}</h2>
                                    {typingUsers.length > 0 && (
                                        <p className="text-xs text-green-600">
                                            {typingUsers.map(u => u.userName).join(', ')} typing...
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((message) => {
                                    const isOwn = message.sender_id === user?.id;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={message.sender_avatar} />
                                                <AvatarFallback>
                                                    {getInitials(message.sender_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                                                {!isOwn && (
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        {message.sender_name}
                                                    </p>
                                                )}
                                                <div
                                                    className={`rounded-lg p-3 ${
                                                        isOwn
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}
                                                >
                                                    {message.is_deleted ? (
                                                        <p className="text-sm italic opacity-70">[Message deleted]</p>
                                                    ) : (
                                                        <p className="text-sm">{message.content}</p>
                                                    )}
                                                </div>
                                                <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : ''}`}>
                                                    {formatTime(message.created_at)}
                                                    {message.is_edited && ' (edited)'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost">
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Input
                                    placeholder="Type a message..."
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
                        </div>
                    </div>
                )}
            </div>

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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-4"
                        />
                        <ScrollArea className="h-64">
                            <div className="space-y-2">
                                {users
                                    .filter(u =>
                                        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
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
