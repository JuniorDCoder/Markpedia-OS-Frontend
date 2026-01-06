'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api/client';
import { employeeApi } from '@/lib/api/employees';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OnboardingTestPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [onboardingData, setOnboardingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [employeesLoading, setEmployeesLoading] = useState(true);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await employeeApi.getAll();
                setEmployees(data);
                if (data.length > 0) {
                    setSelectedEmployeeId(data[0].id);
                }
            } catch (error) {
                console.error('Failed to load employees:', error);
            } finally {
                setEmployeesLoading(false);
            }
        };
        loadEmployees();
    }, []);

    const fetchOnboardingData = async () => {
        if (!selectedEmployeeId) return;

        setLoading(true);
        setError(null);
        setOnboardingData(null);

        try {
            console.log(`Fetching onboarding data for employee: ${selectedEmployeeId}`);
            const data = await apiRequest<any>(`/people/onboarding/${selectedEmployeeId}`);
            console.log('Onboarding Response:', data);
            setOnboardingData(data);
        } catch (error: any) {
            console.error('Onboarding Error:', error);
            setError(error.message || 'Failed to fetch onboarding data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Backend Onboarding Data Test</h1>
                <p className="text-muted-foreground mt-2">
                    Test what the backend returns for employee onboarding
                </p>
            </div>

            {/* Employee Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Employee</CardTitle>
                    <CardDescription>Choose an employee to fetch their onboarding data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {employeesLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading employees...</span>
                        </div>
                    ) : (
                        <>
                            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.name} - {emp.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={fetchOnboardingData}
                                disabled={loading || !selectedEmployeeId}
                                className="w-full"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Fetching...' : 'Fetch Onboarding Data'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* API Endpoint Info */}
            {selectedEmployeeId && (
                <Card>
                    <CardHeader>
                        <CardTitle>API Request Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 font-mono text-sm">
                            <div>
                                <span className="text-muted-foreground">Method:</span> <span className="font-bold">GET</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Endpoint:</span>{' '}
                                <span className="bg-muted px-2 py-1 rounded">/api/v1/people/onboarding/{selectedEmployeeId}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Full URL:</span>{' '}
                                <span className="bg-muted px-2 py-1 rounded text-xs break-all">
                                    {process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL}/people/onboarding/{selectedEmployeeId}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-destructive">{error}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Check the browser console (F12) for more details
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Response Display */}
            {onboardingData && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Backend Response</CardTitle>
                                <CardDescription>Raw JSON data from the backend</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchOnboardingData}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <p className="font-semibold">{onboardingData.status || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Tasks</p>
                                    <p className="font-semibold">{onboardingData.tasks?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Progress</p>
                                    <p className="font-semibold">{onboardingData.progress_percentage || 0}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Employee ID</p>
                                    <p className="font-semibold font-mono text-xs">{onboardingData.employee_id || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Tasks Preview */}
                            {onboardingData.tasks && onboardingData.tasks.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Tasks ({onboardingData.tasks.length})</h4>
                                    <div className="space-y-2">
                                        {onboardingData.tasks.slice(0, 3).map((task: any, index: number) => (
                                            <div key={index} className="p-3 bg-muted rounded border">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{task.title || `Task ${index + 1}`}</span>
                                                    <span className={`text-xs px-2 py-1 rounded ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                )}
                                            </div>
                                        ))}
                                        {onboardingData.tasks.length > 3 && (
                                            <p className="text-sm text-muted-foreground text-center">
                                                ... and {onboardingData.tasks.length - 3} more tasks
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Raw JSON */}
                            <div>
                                <h4 className="font-semibold mb-2">Full Response (JSON)</h4>
                                <pre className="p-4 bg-black text-green-400 rounded-md overflow-auto max-h-96 text-xs font-mono">
                                    {JSON.stringify(onboardingData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
