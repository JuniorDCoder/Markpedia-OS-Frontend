'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { entityService } from '@/lib/api/entities';
import { Entity, Department } from '@/types';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/loading';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Building, Globe, MapPin, Flag, Plus, Search, Filter, Mail, Calendar, MoreVertical, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EntitiesPage() {
    const { user } = useAuthStore();
    const [entities, setEntities] = useState<Entity[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        loadEntitiesData();
    }, []);

    const loadEntitiesData = async () => {
        try {
            setLoading(true);
            const [entitiesData, depts] = await Promise.all([
                entityService.getEntities(),
                entityService.getDepartments()
            ]);
            setEntities(entitiesData);
            setDepartments(depts);
        } catch (error) {
            toast.error('Failed to load entities data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entity?')) {
            return;
        }

        try {
            await entityService.deleteEntity(id);
            setEntities(entities => entities.filter(e => e.id !== id));
            toast.success('Entity deleted successfully');
        } catch (error) {
            toast.error('Failed to delete entity');
        }
    };

    const filteredEntities = entities.filter(entity => {
        const matchesSearch =
            entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entity.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entity.headName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === 'all' || entity.level === levelFilter;
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? entity.active : !entity.active);
        return matchesSearch && matchesLevel && matchesStatus;
    });

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'Global': return <Globe className="h-3 w-3" />;
            case 'Regional': return <MapPin className="h-3 w-3" />;
            case 'Country': return <Flag className="h-3 w-3" />;
            default: return <Building className="h-3 w-3" />;
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

    const canManage = user?.role === 'CEO' || user?.role === 'Admin';

    if (loading) {
        return <TableSkeleton />;
    }

    const EntityCard = ({ entity }: { entity: Entity }) => (
        <Card key={entity.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                            {getLevelIcon(entity.level)}
                            {entity.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <Building className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{entity.country}</span>
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/strategy/entities/${entity.id}`}>
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            {canManage && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/strategy/entities/${entity.id}/edit`}>
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDelete(entity.id)}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-wrap mt-2">
                    <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                            backgroundColor: getLevelColor(entity.level) + '20',
                            color: getLevelColor(entity.level)
                        }}
                    >
                        {entity.level}
                    </Badge>
                    <Badge variant={entity.active ? "default" : "secondary"} className="text-xs">
                        {entity.active ? 'Active' : 'Inactive'}
                    </Badge>
                    {entity.parentId && (
                        <Badge variant="outline" className="text-xs">
                            Subsidiary
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{entity.headName}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{entity.email}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Est. {new Date(entity.establishedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm">
                    <span className="font-medium">Parent: </span>
                    <span className="ml-1 truncate">
                        {entity.parentId
                            ? entities.find(e => e.id === entity.parentId)?.name || 'Unknown'
                            : 'Global HQ'
                        }
                    </span>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <Building className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Entities Management</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">
                        Manage Global, Regional, and Country entities
                    </p>
                </div>
                {canManage && (
                    <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                        <Link href="/strategy/entities/new">
                            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">Add Entity</span>
                            <span className="md:hidden">Add Entity</span>
                        </Link>
                    </Button>
                )}
                {canManage && (
                    <Button asChild size="icon" className="sm:hidden flex-shrink-0">
                        <Link href="/strategy/entities/new">
                            <Plus className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Entities</CardTitle>
                        <Building className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{entities.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all levels
                        </p>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Global</CardTitle>
                        <Globe className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold" style={{ color: '#001F3F' }}>
                            {entities.filter(e => e.level === 'Global').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Global entities
                        </p>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Regional</CardTitle>
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold" style={{ color: '#22C55E' }}>
                            {entities.filter(e => e.level === 'Regional').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Regional hubs
                        </p>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Country</CardTitle>
                        <Flag className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold" style={{ color: '#FACC15' }}>
                            {entities.filter(e => e.level === 'Country').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Country offices
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 md:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search entities by name, country, or head..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 md:pl-10 text-sm md:text-base"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="sm:hidden">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-auto">
                                    <div className="space-y-4 mt-4">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Level</label>
                                            <Select value={levelFilter} onValueChange={(value) => {
                                                setLevelFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Levels</SelectItem>
                                                    <SelectItem value="Global">Global</SelectItem>
                                                    <SelectItem value="Regional">Regional</SelectItem>
                                                    <SelectItem value="Country">Country</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select value={statusFilter} onValueChange={(value) => {
                                                setStatusFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="hidden sm:flex gap-2">
                                <Select value={levelFilter} onValueChange={setLevelFilter}>
                                    <SelectTrigger className="w-[140px] md:w-[150px] text-sm">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="Global">Global</SelectItem>
                                        <SelectItem value="Regional">Regional</SelectItem>
                                        <SelectItem value="Country">Country</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[120px] md:w-[150px] text-sm">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Entities Grid */}
            {filteredEntities.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 md:py-12">
                            <Building className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">No entities found</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                {searchTerm || levelFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No entities have been created yet'
                                }
                            </p>
                            {canManage && !searchTerm && levelFilter === 'all' && statusFilter === 'all' && (
                                <Button asChild size="sm">
                                    <Link href="/strategy/entities/new">
                                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                        Add Entity
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEntities.map(entity => (
                        <EntityCard key={entity.id} entity={entity} />
                    ))}
                </div>
            )}
        </div>
    );
}