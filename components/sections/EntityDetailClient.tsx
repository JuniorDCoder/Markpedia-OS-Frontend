'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Globe, MapPin, Flag, ArrowLeft, Mail, Calendar, Users, Map } from 'lucide-react';
import Link from 'next/link';

interface EntityDetailClientProps {
    entity: {
        id: string;
        name: string;
        level: 'Global' | 'Regional' | 'Country';
        parentId?: string;
        country: string;
        headName: string;
        email: string;
        establishedDate: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    };
    childEntities: Array<{
        id: string;
        name: string;
        level: 'Global' | 'Regional' | 'Country';
        country: string;
        headName: string;
        email: string;
        establishedDate: string;
        active: boolean;
    }>;
}

export function EntityDetailClient({ entity, childEntities }: EntityDetailClientProps) {
    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'Global': return <Globe className="h-4 w-4" />;
            case 'Regional': return <MapPin className="h-4 w-4" />;
            case 'Country': return <Flag className="h-4 w-4" />;
            default: return <Building className="h-4 w-4" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Global': return '#001F3F';
            case 'Regional': return '#22C55E';
            case 'Country': return '#FACC15';
            default: return '#6B7280';
        }
    };

    const getParentEntityName = () => {
        if (!entity.parentId) return 'Global Headquarters (No Parent)';

        // In a real app, you would fetch the parent entity details
        // For now, we'll return a generic message
        return `Linked to Parent Entity`;
    };

    const getHierarchyDescription = () => {
        switch (entity.level) {
            case 'Global':
                return 'Top-level global headquarters overseeing all regional operations';
            case 'Regional':
                return 'Regional hub managing multiple country operations within a geographic region';
            case 'Country':
                return 'Country-level entity handling local market operations and customer support';
            default:
                return 'Organizational entity within the Markpedia structure';
        }
    };

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
                        {getLevelIcon(entity.level)}
                        <span className="ml-3">{entity.name}</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {getHierarchyDescription()}
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/strategy/entities/${entity.id}/edit`}>
                        Edit Entity
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Basic Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Entity Information</CardTitle>
                        <CardDescription>
                            Complete details and organizational information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Badge
                                variant="secondary"
                                style={{
                                    backgroundColor: getLevelColor(entity.level) + '20',
                                    color: getLevelColor(entity.level)
                                }}
                            >
                                {entity.level} Level
                            </Badge>
                            <Badge variant={entity.active ? "default" : "secondary"}>
                                {entity.active ? 'Active' : 'Inactive'}
                            </Badge>
                            {entity.parentId && (
                                <Badge variant="outline">
                                    Subsidiary
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2">Location & Contact</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>{entity.country}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>{entity.email}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Head/Director: </span>
                                        <span>{entity.headName}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2">Entity Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>Established {new Date(entity.establishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>{childEntities.length} child entities</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Last Updated: </span>
                                        <span>{new Date(entity.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hierarchy Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organizational Hierarchy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-medium text-muted-foreground mb-2 flex items-center">
                                <Map className="h-4 w-4 mr-2" />
                                Parent Entity
                            </h3>
                            <p className="font-medium">{getParentEntityName()}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {entity.level === 'Global'
                                    ? 'Global headquarters with no parent entity'
                                    : `Reports to ${entity.level === 'Regional' ? 'Global' : 'Regional'} level`
                                }
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-muted-foreground mb-2">Hierarchy Level</h3>
                            <div className="flex items-center gap-2">
                                {getLevelIcon(entity.level)}
                                <span className="font-medium capitalize">{entity.level}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {getHierarchyDescription()}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Child Entities */}
            {childEntities.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Child Entities</CardTitle>
                        <CardDescription>
                            Entities that report directly to this entity in the organizational hierarchy
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {childEntities.map(child => (
                                <Card key={child.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            {getLevelIcon(child.level)}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{child.name}</p>
                                                <p className="text-sm text-muted-foreground truncate">{child.country}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Head: {child.headName}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="flex-shrink-0"
                                                style={{
                                                    backgroundColor: getLevelColor(child.level) + '20',
                                                    color: getLevelColor(child.level)
                                                }}
                                            >
                                                {child.level}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <Badge variant={child.active ? "default" : "secondary"} className="text-xs">
                                                {child.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/strategy/entities/${child.id}`}>
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Child Entities Message */}
            {childEntities.length === 0 && entity.level !== 'Country' && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                No Child Entities
                            </h3>
                            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                                {entity.level === 'Global'
                                    ? 'This global entity doesn\'t have any regional entities yet.'
                                    : 'This regional entity doesn\'t have any country entities yet.'
                                }
                            </p>
                            <Button asChild size="sm">
                                <Link href="/strategy/entities/new">
                                    Add Child Entity
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}