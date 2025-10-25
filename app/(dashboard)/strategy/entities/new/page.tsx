'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { entityService } from '@/lib/api/entities';
import { Entity } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building, Globe, MapPin, Flag, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormData {
    name: string;
    level: 'Global' | 'Regional' | 'Country';
    parentId: string;
    country: string;
    headName: string;
    email: string;
    establishedDate: string;
    active: boolean;
}

export default function NewEntityPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        level: 'Global',
        parentId: '',
        country: '',
        headName: '',
        email: '',
        establishedDate: new Date().toISOString().split('T')[0],
        active: true,
    });

    useEffect(() => {
        loadEntities();
    }, []);

    const loadEntities = async () => {
        try {
            const entitiesData = await entityService.getEntities();
            setEntities(entitiesData);
        } catch (error) {
            toast.error('Failed to load entities');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.country || !formData.headName || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate parent selection based on level
        if (formData.level !== 'Global' && !formData.parentId) {
            toast.error('Please select a parent entity for Regional and Country levels');
            return;
        }

        try {
            setSaving(true);
            await entityService.createEntity(formData);
            toast.success('Entity created successfully');
            router.push('/strategy/entities');
        } catch (error) {
            toast.error('Failed to create entity');
        } finally {
            setSaving(false);
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'Global': return <Globe className="h-4 w-4" />;
            case 'Regional': return <MapPin className="h-4 w-4" />;
            case 'Country': return <Flag className="h-4 w-4" />;
            default: return <Building className="h-4 w-4" />;
        }
    };

    const getAvailableParents = (level: string) => {
        switch (level) {
            case 'Global':
                return []; // Global entities have no parents
            case 'Regional':
                return entities.filter(e => e.level === 'Global');
            case 'Country':
                return entities.filter(e => e.level === 'Regional' || e.level === 'Global');
            default:
                return [];
        }
    };

    const canManage = user?.role === 'CEO' || user?.role === 'Admin';

    if (!canManage) {
        return (
            <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-4">
                    You don't have permission to create entities.
                </p>
                <Button asChild>
                    <Link href="/strategy/entities">
                        Back to Entities
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/strategy/entities">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Entities
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Building className="h-8 w-8 mr-3" />
                        Add New Entity
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Create a new Global, Regional, or Country entity
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Entity Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new entity
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Entity Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Markpedia Inc., Africa Region"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="level">Entity Level *</Label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value, parentId: '' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Global">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                Global
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Regional">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Regional
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Country">
                                            <div className="flex items-center gap-2">
                                                <Flag className="h-4 w-4" />
                                                Country
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country/Location *</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                    placeholder="e.g., USA, Nigeria, Cameroon"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="headName">Head/Director *</Label>
                                <Input
                                    id="headName"
                                    value={formData.headName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, headName: e.target.value }))}
                                    placeholder="e.g., Regional Director - Africa"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Contact Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="director@markpedia.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="establishedDate">Established Date *</Label>
                                <Input
                                    id="establishedDate"
                                    type="date"
                                    value={formData.establishedDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, establishedDate: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Parent Entity */}
                        {formData.level !== 'Global' && (
                            <div className="space-y-2">
                                <Label htmlFor="parentId">
                                    Parent Entity *
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {formData.level === 'Regional' ? 'Select Global entity' : 'Select Regional or Global entity'}
                                    </span>
                                </Label>
                                <Select
                                    value={formData.parentId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select parent ${formData.level === 'Regional' ? 'Global' : 'Regional'} entity`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableParents(formData.level).map(entity => (
                                            <SelectItem key={entity.id} value={entity.id}>
                                                <div className="flex items-center gap-2">
                                                    {getLevelIcon(entity.level)}
                                                    <span>{entity.name} ({entity.level})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Entity Status</Label>
                            <Select
                                value={formData.active ? 'active' : 'inactive'}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, active: value === 'active' }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 md:pt-6 border-t mt-4 md:mt-6">
                            <Button type="button" variant="outline" asChild className="order-2 sm:order-1">
                                <Link href="/strategy/entities">
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={saving} className="order-1 sm:order-2">
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Building className="h-4 w-4 mr-2" />
                                        Create Entity
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}