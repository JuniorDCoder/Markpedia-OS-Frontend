'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Feather as Mission,
    ArrowLeft,
    Edit,
    Save,
    Eye,
    Heart,
    Target,
    Sparkles,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { identityService } from '@/services/companyResourcesService';
import type { CompanyIdentity, CompanyValue, BrandPillar } from '@/types/company-resources';
import { toast } from 'react-hot-toast';

export default function IdentityPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Data states
    const [identity, setIdentity] = useState<CompanyIdentity | null>(null);
    const [formData, setFormData] = useState({
        vision: '',
        mission: '',
        values: [] as CompanyValue[],
        brand_pillars: [] as BrandPillar[],
    });

    useEffect(() => {
        setCurrentModule('resources');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await identityService.getIdentity();
            setIdentity(data);
            if (data) {
                setFormData({
                    vision: data.vision || '',
                    mission: data.mission || '',
                    values: data.values || [],
                    brand_pillars: data.brandPillars || [],
                });
            }
        } catch (error) {
            console.error('Error loading identity:', error);
            // Initialize with empty data if not found
            setFormData({
                vision: '',
                mission: '',
                values: [],
                brand_pillars: [],
            });
        } finally {
            setLoading(false);
        }
    };

    // Role-based access
    const canManage = user?.role && ['CEO', 'Admin', 'HR'].includes(user.role);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await identityService.updateIdentity({
                vision: formData.vision,
                mission: formData.mission,
                values: formData.values,
                brandPillars: formData.brand_pillars,
            } as any);
            setIdentity(updated);
            setIsEditing(false);
            toast.success('Company identity updated successfully');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save company identity');
        } finally {
            setIsSaving(false);
        }
    };

    const addValue = () => {
        setFormData({
            ...formData,
            values: [...formData.values, { id: Date.now().toString(), name: '', description: '', behaviors: [] }]
        });
    };

    const updateValue = (index: number, field: keyof CompanyValue, value: any) => {
        const newValues = [...formData.values];
        newValues[index] = { ...newValues[index], [field]: value };
        setFormData({ ...formData, values: newValues });
    };

    const removeValue = (index: number) => {
        setFormData({
            ...formData,
            values: formData.values.filter((_, i) => i !== index)
        });
    };

    const addPillar = () => {
        setFormData({
            ...formData,
            brand_pillars: [...formData.brand_pillars, { id: Date.now().toString(), name: '', description: '', proofPoints: [] }]
        });
    };

    const updatePillar = (index: number, field: keyof BrandPillar, value: any) => {
        const newPillars = [...formData.brand_pillars];
        newPillars[index] = { ...newPillars[index], [field]: value };
        setFormData({ ...formData, brand_pillars: newPillars });
    };

    const removePillar = (index: number) => {
        setFormData({
            ...formData,
            brand_pillars: formData.brand_pillars.filter((_, i) => i !== index)
        });
    };

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/resources">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                        <Mission className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-orange-600" />
                        Company Identity
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Vision, mission, values, and brand guidelines
                    </p>
                </div>
                {canManage && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Identity
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Vision & Mission */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-blue-600" />
                            Vision
                        </CardTitle>
                        <CardDescription>Where we aspire to be</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <Textarea
                                value={formData.vision}
                                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                                placeholder="Enter company vision..."
                                rows={4}
                            />
                        ) : (
                            <p className="text-sm leading-relaxed">
                                {identity?.vision || 'No vision statement defined yet.'}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            Mission
                        </CardTitle>
                        <CardDescription>What we do and why</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <Textarea
                                value={formData.mission}
                                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                placeholder="Enter company mission..."
                                rows={4}
                            />
                        ) : (
                            <p className="text-sm leading-relaxed">
                                {identity?.mission || 'No mission statement defined yet.'}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Core Values */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-600" />
                                Core Values
                            </CardTitle>
                            <CardDescription>The principles that guide our behavior</CardDescription>
                        </div>
                        {isEditing && (
                            <Button variant="outline" size="sm" onClick={addValue}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Value
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
                            {formData.values.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No values defined. Click "Add Value" to create one.
                                </p>
                            ) : (
                                formData.values.map((value, index) => (
                                    <div key={value.id} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 space-y-3">
                                                <Input
                                                    value={value.name}
                                                    onChange={(e) => updateValue(index, 'name', e.target.value)}
                                                    placeholder="Value name"
                                                    className="font-semibold"
                                                />
                                                <Textarea
                                                    value={value.description}
                                                    onChange={(e) => updateValue(index, 'description', e.target.value)}
                                                    placeholder="Description of this value"
                                                    rows={2}
                                                />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-600"
                                                onClick={() => removeValue(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {(identity?.values || []).length === 0 ? (
                                <p className="text-muted-foreground col-span-full text-center py-8">
                                    No core values defined yet.
                                </p>
                            ) : (
                                identity?.values.map((value) => (
                                    <div key={value.id} className="p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                                        <h4 className="font-semibold text-lg mb-2">{value.name}</h4>
                                        <p className="text-sm text-muted-foreground">{value.description}</p>
                                        {value.behaviors && value.behaviors.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs font-medium mb-1">Key Behaviors:</p>
                                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                                    {value.behaviors.map((behavior, i) => (
                                                        <li key={i}>{behavior}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Brand Pillars */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                Brand Pillars
                            </CardTitle>
                            <CardDescription>The foundations of our brand identity</CardDescription>
                        </div>
                        {isEditing && (
                            <Button variant="outline" size="sm" onClick={addPillar}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Pillar
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
                            {formData.brand_pillars.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No brand pillars defined. Click "Add Pillar" to create one.
                                </p>
                            ) : (
                                formData.brand_pillars.map((pillar, index) => (
                                    <div key={pillar.id} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 space-y-3">
                                                <Input
                                                    value={pillar.name}
                                                    onChange={(e) => updatePillar(index, 'name', e.target.value)}
                                                    placeholder="Pillar name"
                                                    className="font-semibold"
                                                />
                                                <Textarea
                                                    value={pillar.description}
                                                    onChange={(e) => updatePillar(index, 'description', e.target.value)}
                                                    placeholder="Description of this brand pillar"
                                                    rows={2}
                                                />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-600"
                                                onClick={() => removePillar(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {(identity?.brandPillars || []).length === 0 ? (
                                <p className="text-muted-foreground col-span-full text-center py-8">
                                    No brand pillars defined yet.
                                </p>
                            ) : (
                                identity?.brandPillars.map((pillar) => (
                                    <div key={pillar.id} className="p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                                        <h4 className="font-semibold text-lg mb-2">{pillar.name}</h4>
                                        <p className="text-sm text-muted-foreground">{pillar.description}</p>
                                        {pillar.proofPoints && pillar.proofPoints.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {pillar.proofPoints.map((point, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {point}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
