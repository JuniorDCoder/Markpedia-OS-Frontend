"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { entityService } from "@/lib/api/entities";
import { Entity } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Globe, MapPin, Flag, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { TableSkeleton } from "@/components/ui/loading";

interface EditEntityFormProps {
    id: string;
}

export default function EditEntityForm({ id }: EditEntityFormProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [entity, setEntity] = useState<Entity | null>(null);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        level: "Global" as "Global" | "Regional" | "Country",
        parentId: "",
        country: "",
        headName: "",
        email: "",
        establishedDate: "",
        active: true,
    });

    useEffect(() => {
        loadEntityData();
    }, [id]);

    const loadEntityData = async () => {
        try {
            setLoading(true);
            const [entityData, allEntities] = await Promise.all([
                entityService.getEntity(id),
                entityService.getEntities(),
            ]);

            if (entityData) {
                setEntity(entityData);
                setFormData({
                    name: entityData.name,
                    level: entityData.level,
                    parentId: entityData.parentId || "",
                    country: entityData.country,
                    headName: entityData.headName,
                    email: entityData.email,
                    establishedDate: entityData.establishedDate,
                    active: entityData.active,
                });
            }
            setEntities(allEntities);
        } catch (error) {
            toast.error("Failed to load entity data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.country || !formData.headName || !formData.email) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Validate parent selection based on level
        if (formData.level !== 'Global' && !formData.parentId) {
            toast.error("Please select a parent entity for Regional and Country levels");
            return;
        }

        try {
            setSaving(true);
            await entityService.updateEntity(id, formData);
            toast.success("Entity updated successfully");
            router.push("/strategy/entities");
        } catch (error) {
            toast.error("Failed to update entity");
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

    const getAvailableParents = (level: string, currentEntityId: string) => {
        switch (level) {
            case 'Global':
                return []; // Global entities have no parents
            case 'Regional':
                return entities.filter(e => e.level === 'Global' && e.id !== currentEntityId);
            case 'Country':
                return entities.filter(e =>
                    (e.level === 'Regional' || e.level === 'Global') &&
                    e.id !== currentEntityId
                );
            default:
                return [];
        }
    };

    const canManage = user?.role === "CEO" || user?.role === "Admin";

    if (loading) {
        return <TableSkeleton />;
    }

    if (!entity) {
        return (
            <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Entity not found</h3>
                <Button asChild>
                    <Link href="/strategy/entities">Back to Entities</Link>
                </Button>
            </div>
        );
    }

    if (!canManage) {
        return (
            <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-4">
                    You don't have permission to edit entities.
                </p>
                <Button asChild>
                    <Link href="/strategy/entities">Back to Entities</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={`/strategy/entities/${id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Entity
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Building className="h-8 w-8 mr-3" />
                        Edit Entity
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Update entity information
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Entity</CardTitle>
                        <CardDescription>
                            Update the information for {entity.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Entity Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Entity Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    placeholder="e.g., Markpedia Inc., Africa Region"
                                    required
                                />
                            </div>

                            {/* Entity Level */}
                            <div className="space-y-2">
                                <Label htmlFor="level">Entity Level *</Label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(value: any) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            level: value,
                                            parentId: value === 'Global' ? '' : prev.parentId
                                        }))
                                    }
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

                            {/* Country */}
                            <div className="space-y-2">
                                <Label htmlFor="country">Country/Location *</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, country: e.target.value }))
                                    }
                                    placeholder="e.g., USA, Nigeria, Cameroon"
                                    required
                                />
                            </div>

                            {/* Head Name */}
                            <div className="space-y-2">
                                <Label htmlFor="headName">Head/Director *</Label>
                                <Input
                                    id="headName"
                                    value={formData.headName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, headName: e.target.value }))
                                    }
                                    placeholder="e.g., Regional Director - Africa"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Contact Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    placeholder="director@markpedia.com"
                                    required
                                />
                            </div>

                            {/* Established Date */}
                            <div className="space-y-2">
                                <Label htmlFor="establishedDate">Established Date *</Label>
                                <Input
                                    id="establishedDate"
                                    type="date"
                                    value={formData.establishedDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, establishedDate: e.target.value }))
                                    }
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
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, parentId: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select parent ${formData.level === 'Regional' ? 'Global' : 'Regional'} entity`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableParents(formData.level, id).map(parentEntity => (
                                            <SelectItem key={parentEntity.id} value={parentEntity.id}>
                                                <div className="flex items-center gap-2">
                                                    {getLevelIcon(parentEntity.level)}
                                                    <span>{parentEntity.name} ({parentEntity.level})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formData.level === 'Country' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Country entities can report to either Regional or Global entities
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Entity Status</Label>
                            <Select
                                value={formData.active ? "active" : "inactive"}
                                onValueChange={(value: any) =>
                                    setFormData((prev) => ({ ...prev, active: value === "active" }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Current Hierarchy Display */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <h4 className="font-medium mb-2">Current Hierarchy</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {entity.parentId ? (
                                    <>
                                        <span>Parent: </span>
                                        <span className="font-medium">
                                            {entities.find(e => e.id === entity.parentId)?.name || 'Unknown'}
                                        </span>
                                        <span className="mx-1">→</span>
                                        <span>Current: </span>
                                        <span className="font-medium">{entity.name}</span>
                                    </>
                                ) : (
                                    <span className="font-medium">{entity.name} (Global Headquarters)</span>
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-end pt-6 border-t">
                            <Button type="button" variant="outline" asChild>
                                <Link href={`/strategy/entities/${id}`}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Update Entity
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}