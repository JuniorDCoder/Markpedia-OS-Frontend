// app/phase-restriction/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentPhase, getPhaseDescription, getNextPhaseRoutes, PHASES, isRouteAllowed } from '@/lib/phases';
import { Calendar, Lock, ArrowLeft, Rocket, Home } from 'lucide-react';
import Link from 'next/link';

export default function PhaseRestrictionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const requestedPath = searchParams.get('requestedPath');
    const currentPhase = getCurrentPhase();
    const phaseDescription = getPhaseDescription(currentPhase);
    const nextPhaseRoutes = getNextPhaseRoutes(currentPhase);

    useEffect(() => {
        // Safety check: if we're stuck in a loop, redirect to dashboard
        if (requestedPath === '/phase-restriction') {
            router.replace('/dashboard');
            return;
        }

        // If the requested path becomes available (e.g., phase changed), redirect to it
        if (requestedPath && isRouteAllowed(requestedPath, currentPhase)) {
            router.replace(requestedPath);
        }
    }, [requestedPath, currentPhase, router]);

    // If we detected a redirect loop, show nothing while redirecting
    if (requestedPath === '/phase-restriction') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full shadow-xl">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Lock className="h-8 w-8 text-blue-600" />
                            </div>
                            <Badge className="absolute -top-2 -right-2 bg-blue-600">
                                Phase {currentPhase}
                            </Badge>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Feature Coming Soon
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-2">
                        The page you're looking for will be available in a future phase
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Current Phase Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                            <Rocket className="h-4 w-4" />
                            Current Phase: {PHASES[currentPhase]}
                        </h3>
                        <p className="text-sm text-blue-700 mt-2">
                            {phaseDescription}
                        </p>
                    </div>

                    {/* Requested Path */}
                    {requestedPath && requestedPath !== '/phase-restriction' && (
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Requested page: <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">{requestedPath}</code>
                            </p>
                        </div>
                    )}

                    {/* Next Phase Preview */}
                    {nextPhaseRoutes.length > 0 && (
                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Coming in Phase {currentPhase + 1}
                            </h4>
                            <div className="grid gap-2">
                                {nextPhaseRoutes.slice(0, 5).map((route) => (
                                    <div key={route} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        {route}
                                    </div>
                                ))}
                                {nextPhaseRoutes.length > 5 && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        +{nextPhaseRoutes.length - 5} more features
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="flex-1"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button asChild className="flex-1">
                            <Link href="/dashboard">
                                <Home className="h-4 w-4 mr-2" />
                                Go to Dashboard
                            </Link>
                        </Button>
                    </div>

                    {/* Progress */}
                    <div className="text-center">
                        <div className="flex justify-center items-center gap-4 mb-2">
                            {[1, 2, 3].map((phase) => (
                                <div key={phase} className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                            phase === currentPhase
                                                ? 'bg-blue-600 text-white'
                                                : phase < currentPhase
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-300 text-gray-600'
                                        }`}
                                    >
                                        {phase}
                                    </div>
                                    {phase < 3 && (
                                        <div
                                            className={`w-8 h-1 ${
                                                phase < currentPhase ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Progress: Phase {currentPhase} of 3
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}