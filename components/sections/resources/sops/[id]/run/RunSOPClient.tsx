'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SOP, User, ChecklistItem } from '@/types';
import { ArrowLeft, Play, Check, Clock, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RunSOPClient({ sop, user }: { sop: SOP; user: User }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [completedChecklistItems, setCompletedChecklistItems] = useState<Set<string>>(new Set());
    const [startTime] = useState(new Date());
    const [isRunning, setIsRunning] = useState(true);

    const currentStepData = sop.steps[currentStep];
    const progress = (completedSteps.size / sop.steps.length) * 100;

    const toggleChecklistItem = (itemId: string) => {
        const newCompleted = new Set(completedChecklistItems);
        if (newCompleted.has(itemId)) {
            newCompleted.delete(itemId);
        } else {
            newCompleted.add(itemId);
        }
        setCompletedChecklistItems(newCompleted);
    };

    const completeStep = (stepId: string) => {
        const newCompleted = new Set(completedSteps);
        newCompleted.add(stepId);
        setCompletedSteps(newCompleted);

        if (currentStep < sop.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishSOP();
        }
    };

    const finishSOP = async () => {
        setIsRunning(false);
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // minutes

        try {
            // api call to save SOP completion

            toast.success('SOP completed successfully!');
            router.push(`/resources/sops`);
        } catch (error) {
            toast.error('Failed to save SOP completion');
        }
    };

    const allChecklistItemsComplete = currentStepData.checklistItems.every(item =>
        completedChecklistItems.has(item.id)
    );

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild className="h-9 w-9 sm:h-10 sm:w-10 p-0 sm:px-3 sm:py-2">
                        <Link href={`/resources/sops/${sop.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Back</span>
                        </Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight line-clamp-2">
                            Run SOP: {sop.title}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Follow the steps to complete this procedure
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm mt-2 sm:mt-0">
                    <Play className="h-3 w-3" />
                    In Progress
                </Badge>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                    {/* Progress */}
                    <Card className="border shadow-sm">
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="text-xs sm:text-sm text-muted-foreground text-center">
                                    Step {currentStep + 1} of {sop.steps.length}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Step */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-1">
                                    {currentStep + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base sm:text-lg line-clamp-3">
                                        {currentStepData.description}
                                    </CardTitle>
                                    <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="flex items-center gap-1 text-xs">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                            {currentStepData.estimatedTime} minutes
                                        </span>
                                        {currentStepData.required && (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                                                Required
                                            </Badge>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            <div>
                                <h4 className="font-medium text-sm sm:text-base mb-2">Instructions</h4>
                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                                        {currentStepData.instructions}
                                    </p>
                                </div>
                            </div>

                            {currentStepData.checklistItems.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm sm:text-base mb-3">Checklist</h4>
                                    <div className="space-y-2">
                                        {currentStepData.checklistItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    completedChecklistItems.has(item.id)
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                                onClick={() => toggleChecklistItem(item.id)}
                                            >
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                                                    completedChecklistItems.has(item.id)
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {completedChecklistItems.has(item.id) && <Check className="h-2 w-2 sm:h-3 sm:w-3" />}
                                                </div>
                                                <span className={`text-xs sm:text-sm ${
                                                    completedChecklistItems.has(item.id) ? 'text-green-800' : 'text-gray-700'
                                                }`}>
                                                    {item.description}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={() => completeStep(currentStepData.id)}
                                disabled={currentStepData.checklistItems.length > 0 && !allChecklistItemsComplete}
                                className="w-full text-sm sm:text-base h-10 sm:h-11"
                                size="lg"
                            >
                                {currentStep === sop.steps.length - 1 ? 'Complete SOP' : 'Complete Step & Continue'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 sm:space-y-6">
                    {/* SOP Info */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">SOP Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="text-right truncate ml-2">{sop.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Department:</span>
                                <span className="text-right truncate ml-2">{sop.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Version:</span>
                                <span>v{sop.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Steps:</span>
                                <span>{sop.steps.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Previous Runs:</span>
                                <span>{sop.runCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Avg. Time:</span>
                                <span>{sop.averageTime} min</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Steps Overview */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">Steps Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1 sm:space-y-2 max-h-60 overflow-y-auto">
                                {sop.steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-center gap-2 sm:gap-3 p-2 rounded text-xs sm:text-sm ${
                                            index === currentStep
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : completedSteps.has(step.id)
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'text-gray-600'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                                            index === currentStep
                                                ? 'bg-blue-100 text-blue-700'
                                                : completedSteps.has(step.id)
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {completedSteps.has(step.id) ? <Check className="h-2 w-2 sm:h-3 sm:w-3" /> : index + 1}
                                        </div>
                                        <span className="truncate">{step.description}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}