'use client';

import { useState } from 'react';
import { User, Channel, DirectMessage, Group, VoiceCall, MeetingMinutes } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    CheckCircle,
    Clock,
    Calendar,
    Menu,
    X,
    Send
} from 'lucide-react';

interface ChatClientProps {
    currentUser: User;
    channels: Channel[];
    directMessages: DirectMessage[];
    groups: Group[];
    voiceCalls: VoiceCall[];
    meetingMinutes: MeetingMinutes[];
    recentContacts: User[];
}

export default function ChatClient({
                                       currentUser,
                                       channels,
                                       directMessages,
                                       groups,
                                       voiceCalls,
                                       meetingMinutes,
                                       recentContacts
                                   }: ChatClientProps) {
    const [activeTab, setActiveTab] = useState('channels');
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');

    const ConversationList = ({ type }: { type: 'channels' | 'dms' | 'groups' }) => {
        const conversations = type === 'channels' ? channels :
            type === 'dms' ? directMessages : groups;

        return (
            <div className="space-y-1">
                {conversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation.id ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                        onClick={() => {
                            setSelectedConversation(conversation.id);
                            setMobileSidebarOpen(false);
                        }}
                    >
                        <div className="flex-shrink-0">
                            {type === 'channels' ? (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                </div>
                            ) : type === 'dms' ? (
                                <div className="relative">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                    </div>
                                    {'isOnline' in conversation && conversation.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                            ) : (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <div className="font-medium text-xs sm:text-sm truncate">
                                    {'name' in conversation ? conversation.name : conversation.user.firstName}
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <Badge variant="destructive" className="h-4 px-1 sm:h-5 sm:px-1.5 text-[10px] sm:text-xs">
                                        {conversation.unreadCount}
                                    </Badge>
                                )}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {conversation.lastMessage?.content || 'No messages yet'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const VoiceVideoSection = () => (
        <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                    <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    Voice & Video Calls
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
                {voiceCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2 sm:gap-3">
                            {call.type === 'video' ? (
                                <Video className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            ) : (
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            )}
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-medium truncate">
                                    {call.type === 'video' ? 'Video Call' : 'Voice Call'}
                                </div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                    {call.participants.length} participants
                                </div>
                            </div>
                        </div>
                        <Badge variant={call.status === 'active' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                            {call.status}
                        </Badge>
                    </div>
                ))}
                <Button size="sm" className="w-full text-xs" variant="outline">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Start New Call
                </Button>
            </CardContent>
        </Card>
    );

    const MeetingMinutesSection = () => (
        <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    AI Meeting Minutes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
                {meetingMinutes.map((minutes) => (
                    <div key={minutes.id} className="p-2 sm:p-3 rounded-lg border space-y-1 sm:space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-xs sm:text-sm font-medium truncate">Meeting Summary</div>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {new Date(minutes.createdAt).toLocaleDateString()}
                            </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                            {minutes.summary}
                        </p>
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                {minutes.actionItems.filter(item => item.status === 'pending').length} actions
                            </Badge>
                            {minutes.recordingConsent && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs">
                                    Recorded
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    // Mobile sidebar overlay
    const MobileSidebarOverlay = () => (
        <>
            {/* Mobile sidebar */}
            <div className={`
                fixed inset-0 z-50 transform lg:hidden
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                transition-transform duration-300 ease-in-out
            `}>
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileSidebarOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r flex flex-col">
                    {/* Mobile sidebar header */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <MessageCircle className="h-6 w-6 text-red-600" />
                            Chat
                        </h1>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMobileSidebarOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Rest of sidebar content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Search */}
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search messages, files, people..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 text-sm"
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <div className="px-4 pt-4">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="channels" className="text-xs">
                                        Channels
                                    </TabsTrigger>
                                    <TabsTrigger value="dms" className="text-xs">
                                        Messages
                                    </TabsTrigger>
                                    <TabsTrigger value="groups" className="text-xs">
                                        Groups
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Conversations */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <TabsContent value="channels" className="mt-0 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">CHANNELS</div>
                                        <Button size="sm" variant="ghost">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <ConversationList type="channels" />
                                </TabsContent>

                                <TabsContent value="dms" className="mt-0 space-y-4">
                                    <div className="text-sm font-medium text-muted-foreground">DIRECT MESSAGES</div>
                                    <ConversationList type="dms" />
                                </TabsContent>

                                <TabsContent value="groups" className="mt-0 space-y-4">
                                    <div className="text-sm font-medium text-muted-foreground">GROUPS</div>
                                    <ConversationList type="groups" />
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* Voice/Video & Minutes */}
                        <div className="p-4 border-t space-y-4">
                            <VoiceVideoSection />
                            <MeetingMinutesSection />
                        </div>

                        {/* User Profile */}
                        <div className="p-4 border-t">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <UserIcon className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {currentUser.firstName} {currentUser.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{currentUser.role}</div>
                                </div>
                                <Button size="sm" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            <MobileSidebarOverlay />

            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden lg:flex lg:w-80 bg-white border-r flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <MessageCircle className="h-6 w-6 text-red-600" />
                            Chat
                        </h1>
                        <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search messages, files, people..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="px-4 pt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="channels" className="text-xs">
                                Channels
                            </TabsTrigger>
                            <TabsTrigger value="dms" className="text-xs">
                                Messages
                            </TabsTrigger>
                            <TabsTrigger value="groups" className="text-xs">
                                Groups
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <TabsContent value="channels" className="mt-0 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-muted-foreground">CHANNELS</div>
                                <Button size="sm" variant="ghost">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <ConversationList type="channels" />
                        </TabsContent>

                        <TabsContent value="dms" className="mt-0 space-y-4">
                            <div className="text-sm font-medium text-muted-foreground">DIRECT MESSAGES</div>
                            <ConversationList type="dms" />
                        </TabsContent>

                        <TabsContent value="groups" className="mt-0 space-y-4">
                            <div className="text-sm font-medium text-muted-foreground">GROUPS</div>
                            <ConversationList type="groups" />
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Voice/Video & Minutes */}
                <div className="p-4 border-t space-y-4">
                    <VoiceVideoSection />
                    <MeetingMinutesSection />
                </div>

                {/* User Profile */}
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                                {currentUser.firstName} {currentUser.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{currentUser.role}</div>
                        </div>
                        <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setMobileSidebarOpen(true)}
                                        className="lg:hidden h-8 w-8 p-0"
                                    >
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm sm:text-base truncate">general</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                            5 members • Company-wide announcements
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Button size="sm" variant="outline" className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline ml-1">Call</span>
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                                        <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline ml-1">Video</span>
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline ml-1">Members</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {/* Sample messages */}
                            <div className="flex gap-2 sm:gap-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-sm">Michael Chen</div>
                                        <div className="text-xs text-muted-foreground">2:30 PM</div>
                                    </div>
                                    <div className="mt-1 text-sm">
                                        Has everyone reviewed the Q1 roadmap document?
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-sm">Sarah Johnson</div>
                                        <div className="text-xs text-muted-foreground">2:31 PM</div>
                                    </div>
                                    <div className="mt-1 text-sm">
                                        Yes, I've gone through it. The timeline looks aggressive but achievable.
                                        <span className="bg-yellow-100 text-yellow-800 px-1 rounded ml-1">@emma</span>
                                        can you share the design mockups by Friday?
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-sm">Emma Davis</div>
                                        <div className="text-xs text-muted-foreground">2:33 PM</div>
                                    </div>
                                    <div className="mt-1 text-sm">
                                        Absolutely! I'll have them ready for review by EOD Friday.
                                        Working on the final touches now.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t p-3 sm:p-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder={`Message #general`}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="flex-1 text-sm"
                                />
                                <Button size="sm" className="h-10 w-10 sm:h-11 sm:w-auto sm:px-4">
                                    <Send className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-1">Send</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    <span className="hidden sm:inline">File</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className="hidden sm:inline">Poll</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Video className="h-3 w-3" />
                                    <span className="hidden sm:inline">Video</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center space-y-4 max-w-sm">
                            <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto" />
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold">Welcome to Chat</h3>
                                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                                    Select a conversation or start a new one to begin messaging
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={() => setMobileSidebarOpen(true)}
                                    className="lg:hidden"
                                >
                                    <Menu className="h-4 w-4 mr-2" />
                                    Browse Conversations
                                </Button>
                                <Button className="hidden lg:flex">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Conversation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}