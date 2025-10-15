'use client';

import { useState } from 'react';
import { X, FileText, Upload, Download, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    onSubmitReport: (taskId: string, reportData: { content: string; attachment?: File }) => void;
}

export default function ReportModal({ isOpen, onClose, tasks, onSubmitReport }: ReportModalProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
    const [reportContent, setReportContent] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedTask = tasks.find(task => task.id === selectedTaskId);

    const handleSubmit = async () => {
        if (!selectedTaskId || !reportContent.trim()) {
            alert('Please select a task and provide report content');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmitReport(selectedTaskId, {
                content: reportContent,
                attachment: attachment || undefined
            });
            // Reset form
            setReportContent('');
            setAttachment(null);
            // Move to next task if available
            const currentIndex = tasks.findIndex(task => task.id === selectedTaskId);
            if (currentIndex < tasks.length - 1) {
                setSelectedTaskId(tasks[currentIndex + 1].id);
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Failed to submit report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachment(file);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done': return 'bg-emerald-100 text-emerald-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-slate-100 text-slate-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Submit Weekly Task Report
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <Label htmlFor="task-select">Select Task to Report On</Label>
                        <div className="grid gap-3 mt-2">
                            {tasks.map(task => (
                                <Card
                                    key={task.id}
                                    className={`cursor-pointer transition-all border-2 ${
                                        selectedTaskId === task.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                                    }`}
                                    onClick={() => setSelectedTaskId(task.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{task.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge className={getStatusColor(task.status)}>
                                                        {task.status}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {task.priority}
                                                    </Badge>
                                                    {task.linked_okr && (
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                                            <Target className="h-3 w-3 mr-1" />
                                                            OKR Linked
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center">
                                                        Progress: {task.progress}%
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <Progress value={task.progress} className="h-2" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {selectedTask && (
                        <>
                            <div>
                                <Label htmlFor="report-content">Report Details *</Label>
                                <Textarea
                                    id="report-content"
                                    placeholder="Describe your progress, challenges faced, deliverables completed, and next steps..."
                                    value={reportContent}
                                    onChange={(e) => setReportContent(e.target.value)}
                                    rows={6}
                                    className="mt-2"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Include specific details about what was accomplished and any proof of completion.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="attachment">Attach Supporting Document (Optional)</Label>
                                <div className="mt-2 flex items-center gap-4">
                                    <input
                                        type="file"
                                        id="attachment"
                                        onChange={handleAttachmentChange}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="attachment"
                                        className="cursor-pointer border rounded-md px-4 py-2 flex items-center gap-2 hover:bg-slate-50"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {attachment ? attachment.name : 'Choose file...'}
                                    </Label>
                                    {attachment && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setAttachment(null)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload screenshots, documents, or any proof of task completion
                                </p>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !reportContent.trim()}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}