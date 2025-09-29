'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface SnapshotNewClientProps {
    user: User;
}

export default function SnapshotNewClient({ user }: SnapshotNewClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: `Snapshot ${new Date().toLocaleDateString()}`,
        description: '',
        includeEmployees: true,
        includeStructure: true,
        includeDepartments: true
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/organigram/snapshots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    createdBy: user.id
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create snapshot');
            }

            toast.success('Snapshot created successfully');
            router.push('/strategy/organigram');
            router.refresh();
        } catch (error) {
            console.error('Error creating snapshot:', error);
            toast.error('Failed to create snapshot');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/strategy/organigram">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Snapshot</h1>
                        <p className="text-muted-foreground mt-1">
                            Save the current organization structure for future reference
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Snapshot Details
                                </CardTitle>
                                <CardDescription>
                                    Configure what to include in this organization snapshot
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                                        Snapshot Name *
                                    </label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., Q1 2024 Organization Structure"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                                        Description (Optional)
                                    </label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe this snapshot for future reference..."
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Include in Snapshot</h4>

                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <label htmlFor="includeEmployees" className="block text-sm font-medium">
                                                Employee Data
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                                Names, roles, titles, and contact information
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            id="includeEmployees"
                                            checked={formData.includeEmployees}
                                            onChange={(e) => handleInputChange('includeEmployees', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <label htmlFor="includeStructure" className="block text-sm font-medium">
                                                Reporting Structure
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                                Manager relationships and team hierarchies
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            id="includeStructure"
                                            checked={formData.includeStructure}
                                            onChange={(e) => handleInputChange('includeStructure', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <label htmlFor="includeDepartments" className="block text-sm font-medium">
                                                Department Information
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                                Department names, colors, and member counts
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            id="includeDepartments"
                                            checked={formData.includeDepartments}
                                            onChange={(e) => handleInputChange('includeDepartments', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Creating...' : 'Create Snapshot'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/strategy/organigram">
                                        Cancel
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Snapshot Guide */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About Snapshots</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p><strong>Version Control</strong> - Track organizational changes over time</p>
                                <p><strong>Audit Trail</strong> - Maintain records of past structures</p>
                                <p><strong>Restoration</strong> - Revert to previous organization layouts</p>
                                <p><strong>Reporting</strong> - Generate historical organization charts</p>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span>Employees:</span>
                                        <span>{formData.includeEmployees ? 'Included' : 'Excluded'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Structure:</span>
                                        <span>{formData.includeStructure ? 'Included' : 'Excluded'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Departments:</span>
                                        <span>{formData.includeDepartments ? 'Included' : 'Excluded'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}