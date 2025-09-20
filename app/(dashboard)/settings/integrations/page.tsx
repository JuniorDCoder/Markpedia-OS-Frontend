'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app';
import { meetingConfigService } from '@/services/api';
import { Save, RefreshCw, TestTube, Link, Shield, Bell, FileText, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

interface MeetingConfig {
    id: string;
    otterAI: {
        enabled: boolean;
        apiKey: string;
        webhookUrl: string;
        autoSync: boolean;
        syncInterval: number;
    };
    notifications: {
        beforeMeeting: boolean;
        beforeMeetingTime: number;
        afterMeeting: boolean;
        actionItemsDue: boolean;
        decisionFollowUp: boolean;
    };
    automation: {
        autoCreateTasks: boolean;
        taskPriority: 'low' | 'medium' | 'high';
        defaultAssignee: string;
        syncWithCalendar: boolean;
    };
    templates: {
        defaultTemplate: string;
        customTemplates: Array<{
            id: string;
            name: string;
            agenda: string[];
            defaultAttendees: string[];
        }>;
    };
}

export default function ConfigurationPage() {
    const { setCurrentModule } = useAppStore();
    const [config, setConfig] = useState<MeetingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        setCurrentModule('settings');
        loadConfig();
    }, [setCurrentModule]);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await meetingConfigService.getConfig();
            setConfig(data);
        } catch (error) {
            toast.error('Failed to load configuration');
            // Set default config if loading fails
            setConfig(getDefaultConfig());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultConfig = (): MeetingConfig => ({
        id: 'default',
        otterAI: {
            enabled: false,
            apiKey: '',
            webhookUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/otter-ai`,
            autoSync: true,
            syncInterval: 30,
        },
        notifications: {
            beforeMeeting: true,
            beforeMeetingTime: 15,
            afterMeeting: true,
            actionItemsDue: true,
            decisionFollowUp: true,
        },
        automation: {
            autoCreateTasks: false,
            taskPriority: 'medium',
            defaultAssignee: '',
            syncWithCalendar: true,
        },
        templates: {
            defaultTemplate: 'standard',
            customTemplates: [
                {
                    id: 'standard',
                    name: 'Standard Meeting',
                    agenda: ['Review previous action items', 'Discussion items', 'New business', 'Action items'],
                    defaultAttendees: [],
                },
            ],
        },
    });

    const handleSave = async () => {
        if (!config) return;

        try {
            setSaving(true);
            await meetingConfigService.saveConfig(config);
            toast.success('Configuration saved successfully');
        } catch (error) {
            toast.error('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const testOtterIntegration = async () => {
        if (!config?.otterAI.apiKey) {
            toast.error('Please enter your Otter AI API key first');
            return;
        }

        try {
            setTesting(true);
            await meetingConfigService.testOtterIntegration(config.otterAI.apiKey);
            toast.success('Otter AI integration test successful');
        } catch (error) {
            toast.error('Otter AI integration test failed');
        } finally {
            setTesting(false);
        }
    };

    const regenerateWebhookUrl = () => {
        if (!config) return;

        const newWebhookUrl = `${window.location.origin}/api/webhooks/otter-ai?token=${Math.random().toString(36).substring(2, 15)}`;
        setConfig({
            ...config,
            otterAI: {
                ...config.otterAI,
                webhookUrl: newWebhookUrl,
            },
        });
        toast.success('Webhook URL regenerated');
    };

    const handleOtterAIChange = (key: keyof MeetingConfig['otterAI'], value: any) => {
        if (!config) return;

        setConfig({
            ...config,
            otterAI: {
                ...config.otterAI,
                [key]: value,
            },
        });
    };

    const handleNotificationsChange = (key: keyof MeetingConfig['notifications'], value: any) => {
        if (!config) return;

        setConfig({
            ...config,
            notifications: {
                ...config.notifications,
                [key]: value,
            },
        });
    };

    const handleAutomationChange = (key: keyof MeetingConfig['automation'], value: any) => {
        if (!config) return;

        setConfig({
            ...config,
            automation: {
                ...config.automation,
                [key]: value,
            },
        });
    };

    if (loading || !config) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meeting Configuration</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure your meeting preferences, integrations, and automation settings
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="integrations" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="integrations">
                        <Link className="h-4 w-4 mr-2" />
                        Integrations
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="automation">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Automation
                    </TabsTrigger>
                    <TabsTrigger value="templates">
                        <FileText className="h-4 w-4 mr-2" />
                        Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="integrations" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                                Otter AI Integration
                            </CardTitle>
                            <CardDescription>
                                Connect your Otter AI account to automatically capture meeting transcripts and action items
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="otter-enabled">Enable Otter AI Integration</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically capture meeting transcripts and extract decisions
                                    </p>
                                </div>
                                <Switch
                                    id="otter-enabled"
                                    checked={config.otterAI.enabled}
                                    onCheckedChange={(checked) => handleOtterAIChange('enabled', checked)}
                                />
                            </div>

                            {config.otterAI.enabled && (
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="api-key">API Key</Label>
                                        <Input
                                            id="api-key"
                                            type="password"
                                            placeholder="Enter your Otter AI API key"
                                            value={config.otterAI.apiKey}
                                            onChange={(e) => handleOtterAIChange('apiKey', e.target.value)}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            You can find your API key in your Otter AI account settings
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="webhook-url">Webhook URL</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="webhook-url"
                                                readOnly
                                                value={config.otterAI.webhookUrl}
                                                className="flex-1"
                                            />
                                            <Button variant="outline" onClick={regenerateWebhookUrl}>
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Configure this URL in your Otter AI account to receive meeting updates
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="auto-sync">Auto-Sync Meetings</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically sync meeting data from Otter AI
                                            </p>
                                        </div>
                                        <Switch
                                            id="auto-sync"
                                            checked={config.otterAI.autoSync}
                                            onCheckedChange={(checked) => handleOtterAIChange('autoSync', checked)}
                                        />
                                    </div>

                                    {config.otterAI.autoSync && (
                                        <div className="space-y-2">
                                            <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                                            <Select
                                                value={config.otterAI.syncInterval.toString()}
                                                onValueChange={(value) => handleOtterAIChange('syncInterval', parseInt(value))}
                                            >
                                                <SelectTrigger id="sync-interval">
                                                    <SelectValue placeholder="Select sync interval" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15 minutes</SelectItem>
                                                    <SelectItem value="30">30 minutes</SelectItem>
                                                    <SelectItem value="60">60 minutes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <Button onClick={testOtterIntegration} disabled={testing} variant="outline">
                                        {testing ? (
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <TestTube className="h-4 w-4 mr-2" />
                                        )}
                                        Test Integration
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-green-600" />
                                Security & Permissions
                            </CardTitle>
                            <CardDescription>
                                Control who can access and modify meeting minutes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="require-auth">Require Authentication</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Only authenticated users can access meeting minutes
                                        </p>
                                    </div>
                                    <Switch id="require-auth" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="encrypt-data">Encrypt Sensitive Data</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Encrypt meeting transcripts and action items
                                        </p>
                                    </div>
                                    <Switch id="encrypt-data" defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meeting Notifications</CardTitle>
                            <CardDescription>
                                Configure when and how you receive meeting notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="before-meeting">Notify Before Meeting</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send a reminder before meetings start
                                    </p>
                                </div>
                                <Switch
                                    id="before-meeting"
                                    checked={config.notifications.beforeMeeting}
                                    onCheckedChange={(checked) => handleNotificationsChange('beforeMeeting', checked)}
                                />
                            </div>

                            {config.notifications.beforeMeeting && (
                                <div className="space-y-2">
                                    <Label htmlFor="before-meeting-time">Remind Before (minutes)</Label>
                                    <Select
                                        value={config.notifications.beforeMeetingTime.toString()}
                                        onValueChange={(value) => handleNotificationsChange('beforeMeetingTime', parseInt(value))}
                                    >
                                        <SelectTrigger id="before-meeting-time">
                                            <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 minutes</SelectItem>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="60">60 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="after-meeting">Notify After Meeting</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send a summary after meetings end
                                    </p>
                                </div>
                                <Switch
                                    id="after-meeting"
                                    checked={config.notifications.afterMeeting}
                                    onCheckedChange={(checked) => handleNotificationsChange('afterMeeting', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="action-items-due">Notify About Due Action Items</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get reminders when action items are due
                                    </p>
                                </div>
                                <Switch
                                    id="action-items-due"
                                    checked={config.notifications.actionItemsDue}
                                    onCheckedChange={(checked) => handleNotificationsChange('actionItemsDue', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="decision-follow-up">Notify About Decision Follow-ups</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get reminders to follow up on decisions
                                    </p>
                                </div>
                                <Switch
                                    id="decision-follow-up"
                                    checked={config.notifications.decisionFollowUp}
                                    onCheckedChange={(checked) => handleNotificationsChange('decisionFollowUp', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="automation" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Automation Settings</CardTitle>
                            <CardDescription>
                                Automate tasks and processes related to meetings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-create-tasks">Auto-Create Tasks from Action Items</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically create tasks in your task management system
                                    </p>
                                </div>
                                <Switch
                                    id="auto-create-tasks"
                                    checked={config.automation.autoCreateTasks}
                                    onCheckedChange={(checked) => handleAutomationChange('autoCreateTasks', checked)}
                                />
                            </div>

                            {config.automation.autoCreateTasks && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="task-priority">Default Task Priority</Label>
                                        <Select
                                            value={config.automation.taskPriority}
                                            onValueChange={(value) => handleAutomationChange('taskPriority', value as 'low' | 'medium' | 'high')}
                                        >
                                            <SelectTrigger id="task-priority">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="default-assignee">Default Assignee</Label>
                                        <Input
                                            id="default-assignee"
                                            placeholder="Enter default assignee"
                                            value={config.automation.defaultAssignee}
                                            onChange={(e) => handleAutomationChange('defaultAssignee', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="sync-calendar">Sync with Calendar</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically sync meetings with your calendar
                                    </p>
                                </div>
                                <Switch
                                    id="sync-calendar"
                                    checked={config.automation.syncWithCalendar}
                                    onCheckedChange={(checked) => handleAutomationChange('syncWithCalendar', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meeting Templates</CardTitle>
                            <CardDescription>
                                Create and manage meeting templates for different types of meetings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="default-template">Default Template</Label>
                                    <Select
                                        value={config.templates.defaultTemplate}
                                        onValueChange={(value) => setConfig({
                                            ...config,
                                            templates: {
                                                ...config.templates,
                                                defaultTemplate: value,
                                            }
                                        })}
                                    >
                                        <SelectTrigger id="default-template">
                                            <SelectValue placeholder="Select default template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {config.templates.customTemplates.map(template => (
                                                <SelectItem key={template.id} value={template.id}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Available Templates</h4>
                                    <div className="space-y-2">
                                        {config.templates.customTemplates.map(template => (
                                            <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{template.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {template.agenda.length} agenda items
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                    <Button variant="outline" size="sm" disabled={template.id === config.templates.defaultTemplate}>
                                                        Set Default
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full">
                                    + Add New Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}