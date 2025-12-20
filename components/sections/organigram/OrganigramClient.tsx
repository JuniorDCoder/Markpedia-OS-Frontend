'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Employee, OrganigramSnapshot, Department, User, Entity } from '@/types';
import {
    Plus,
    Download,
    Camera,
    Users,
    Building,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Save,
    ChevronDown,
    Menu,
    Globe,
    MapPin,
    Flag,
    Eye,
    Layers
} from 'lucide-react';

interface OrganigramClientProps {
    employees: Employee[];
    snapshots: OrganigramSnapshot[];
    departments: Department[];
    entities: Entity[];
    user: User;
}

interface OrganigramNode {
    id: string;
    employee: Employee;
    position: { x: number; y: number };
    size: { width: number; height: number };
    children: OrganigramNode[];
}

export default function OrganigramClient({
    employees,
    snapshots,
    departments,
    entities,
    user
}: OrganigramClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState<'all' | 'Global' | 'Regional' | 'Country'>('all');
    const [scopeFilter, setScopeFilter] = useState<'all' | 'Global' | 'Regional' | 'Country'>('all');
    const [selectedSnapshot, setSelectedSnapshot] = useState<OrganigramSnapshot | null>(snapshots[0] || null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<'organigram' | 'list'>('organigram');
    const [viewMode, setViewMode] = useState<'tree' | 'matrix' | 'map'>('tree');
    const [isDepartmentStatsOpen, setIsDepartmentStatsOpen] = useState(false);
    const organigramRef = useRef<HTMLDivElement>(null);

    // Get entity level for an employee
    const getEmployeeLevel = (employee: Employee): 'Global' | 'Regional' | 'Country' => {
        const entity = entities.find(e => e.id === employee.entityId);
        return entity?.level || 'Global';
    };

    // Get level color
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Global': return '#001F3F'; // Navy
            case 'Regional': return '#22C55E'; // Green
            case 'Country': return '#FACC15'; // Gold
            default: return '#6B7280'; // Gray
        }
    };

    // Get level icon
    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'Global': return <Globe className="h-3 w-3" />;
            case 'Regional': return <MapPin className="h-3 w-3" />;
            case 'Country': return <Flag className="h-3 w-3" />;
            default: return <Building className="h-3 w-3" />;
        }
    };

    // Build organigram tree from snapshot
    const buildOrganigramTree = useCallback((snapshot: OrganigramSnapshot): OrganigramNode[] => {
        const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
        const nodeMap = new Map(snapshot.nodes.map(node => [node.id, node]));

        const rootNodes = snapshot.nodes.filter(node => {
            const employee = employeeMap.get(node.employeeId);
            return employee && !employee.reportsTo;
        });

        const buildTree = (nodeData: any): OrganigramNode => ({
            ...nodeData,
            employee: employeeMap.get(nodeData.employeeId)!,
            children: nodeData.children
                .map((childId: string) => nodeMap.get(childId))
                .filter(Boolean)
                .map(buildTree)
        });

        return rootNodes.map(buildTree);
    }, [employees]);

    const organigramTree = selectedSnapshot ? buildOrganigramTree(selectedSnapshot) : [];

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;

        const matchesLevel = levelFilter === 'all' || getEmployeeLevel(employee) === levelFilter;

        return matchesSearch && matchesDepartment && matchesLevel;
    });

    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'CXO';

    const handleDragStart = (e: React.DragEvent, nodeId: string) => {
        setIsDragging(true);
        setSelectedNode(nodeId);
        e.dataTransfer.setData('text/plain', nodeId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const nodeId = e.dataTransfer.getData('text/plain');
        // Handle drop logic here - update node position
        console.log('Dropped node:', nodeId);
    };

    const handleExport = (format: 'png' | 'pdf' | 'json') => {
        // Implement export logic
        console.log('Exporting as:', format);
    };

    const handleTakeSnapshot = () => {
        // Implement snapshot creation
        console.log('Taking snapshot');
    };

    const renderOrganigramNode = (node: OrganigramNode, level: number = 0) => {
        const { employee, position, children } = node;
        const employeeLevel = getEmployeeLevel(employee);
        const levelColor = getLevelColor(employeeLevel);
        const levelIcon = getLevelIcon(employeeLevel);

        return (
            <div key={node.id} className="flex flex-col items-center">
                {/* Node */}
                <div
                    draggable={canManage}
                    onDragStart={(e) => handleDragStart(e, node.id)}
                    className={`
            relative bg-white border-2 rounded-lg p-3 sm:p-4 shadow-sm cursor-move min-w-[160px] sm:min-w-[200px]
            transition-all duration-200 hover:shadow-md hover:border-blue-300
            ${selectedNode === node.id ? 'border-blue-500 shadow-md' : 'border-gray-200'}
            ${employeeLevel === 'Global' ? 'border-blue-300 bg-blue-50' : ''}
            ${employeeLevel === 'Regional' ? 'border-green-300 bg-green-50' : ''}
            ${employeeLevel === 'Country' ? 'border-yellow-300 bg-yellow-50' : ''}
          `}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        position: 'absolute'
                    }}
                >
                    {/* Level color indicator */}
                    <div
                        className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
                        style={{ backgroundColor: levelColor }}
                    />

                    <div className="text-center">
                        <div className="flex items-center justify-between mb-2 gap-1">
                            <div className="flex items-center gap-1 flex-1">
                                {levelIcon}
                                <Badge
                                    variant="secondary"
                                    className="text-xs capitalize flex-1 truncate"
                                    style={{
                                        backgroundColor: levelColor + '20',
                                        color: levelColor
                                    }}
                                >
                                    {employeeLevel}
                                </Badge>
                            </div>
                            {canManage && (
                                <div className="flex gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6">
                                        <Edit className="h-2 w-2 sm:h-3 sm:w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{employee.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{employee.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{employee.email}</p>

                        {employee.role === 'CEO' && (
                            <Badge variant="default" className="mt-2 bg-purple-500 text-xs">CEO</Badge>
                        )}
                        {employee.role === 'CXO' && (
                            <Badge variant="default" className="mt-2 bg-blue-500 text-xs">CXO</Badge>
                        )}
                        {employee.role === 'Manager' && (
                            <Badge variant="default" className="mt-2 bg-green-500 text-xs">Manager</Badge>
                        )}
                    </div>

                    {/* Connection line to children */}
                    {children.length > 0 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0.5 h-6 sm:h-8 bg-gray-300" />
                    )}
                </div>

                {/* Children */}
                {children.length > 0 && (
                    <div className="relative mt-6 sm:mt-8 flex gap-4 sm:gap-8">
                        {children.map((child, index) => (
                            <div key={child.id} className="flex flex-col items-center">
                                {/* Horizontal connection line */}
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-300 -translate-y-3 sm:-translate-y-4" />
                                {renderOrganigramNode(child, level + 1)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Mobile Navigation
    const MobileNavigation = () => (
        <div className="sm:hidden">
            <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                    variant={mobileView === 'organigram' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMobileView('organigram')}
                    className="text-xs"
                >
                    <Building className="h-3 w-3 mr-1" />
                    Organigram
                </Button>
                <Button
                    variant={mobileView === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMobileView('list')}
                    className="text-xs"
                >
                    <Users className="h-3 w-3 mr-1" />
                    List View
                </Button>
            </div>
        </div>
    );

    // Employee List View for Mobile
    const EmployeeListView = () => (
        <div className="space-y-3">
            {filteredEmployees.map(employee => {
                const employeeLevel = getEmployeeLevel(employee);
                const levelColor = getLevelColor(employeeLevel);
                const levelIcon = getLevelIcon(employeeLevel);

                return (
                    <Card key={employee.id} className="border">
                        <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-1">
                                            {levelIcon}
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                                style={{
                                                    backgroundColor: levelColor + '20',
                                                    color: levelColor
                                                }}
                                            >
                                                {employeeLevel}
                                            </Badge>
                                        </div>
                                        {employee.role === 'CEO' && (
                                            <Badge variant="default" className="bg-purple-500 text-xs">CEO</Badge>
                                        )}
                                        {employee.role === 'CXO' && (
                                            <Badge variant="default" className="bg-blue-500 text-xs">CXO</Badge>
                                        )}
                                        {employee.role === 'Manager' && (
                                            <Badge variant="default" className="bg-green-500 text-xs">Manager</Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{employee.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-1">{employee.title}</p>
                                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                            style={{
                                                borderColor: departments.find(d => d.name === employee.department)?.color,
                                                color: departments.find(d => d.name === employee.department)?.color
                                            }}
                                        >
                                            {employee.department}
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );

    // Filters Section
    const FiltersSection = () => (
        <Card className="border shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 sm:pl-10 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Scope</label>
                    <Select value={scopeFilter} onValueChange={(value: any) => setScopeFilter(value)}>
                        <SelectTrigger className="text-sm">
                            <SelectValue placeholder="All Scopes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Scopes</SelectItem>
                            <SelectItem value="Global">Global</SelectItem>
                            <SelectItem value="Regional">Regional</SelectItem>
                            <SelectItem value="Country">Country</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Level</label>
                    <Select value={levelFilter} onValueChange={(value: any) => setLevelFilter(value)}>
                        <SelectTrigger className="text-sm">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="Global">Global</SelectItem>
                            <SelectItem value="Regional">Regional</SelectItem>
                            <SelectItem value="Country">Country</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="text-sm">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept.id} value={dept.name}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">View Mode</label>
                    <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                        <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Tree View" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tree">Tree View</SelectItem>
                            <SelectItem value="matrix">Matrix View</SelectItem>
                            <SelectItem value="map">Map View</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );

    // Stats Cards
    const StatsCards = () => {
        const globalCount = employees.filter(e => getEmployeeLevel(e) === 'Global').length;
        const regionalCount = employees.filter(e => getEmployeeLevel(e) === 'Regional').length;
        const countryCount = employees.filter(e => getEmployeeLevel(e) === 'Country').length;

        return (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card
                    className="border shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setIsDepartmentStatsOpen(true)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{employees.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Click to view breakdown</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Entities</CardTitle>
                        <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{entities.length}</div>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Global</CardTitle>
                        <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{globalCount}</div>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Regional/Country</CardTitle>
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{regionalCount + countryCount}</div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Level Legend
    const LevelLegend = () => (
        <Card className="border shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Level Legend</CardTitle>
                <CardDescription className="text-sm">Organization hierarchy colors</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-sm bg-blue-600 border-2 border-blue-300" />
                            <span className="text-sm">Global Level</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {employees.filter(e => getEmployeeLevel(e) === 'Global').length}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-sm bg-green-500 border-2 border-green-300" />
                            <span className="text-sm">Regional Level</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {employees.filter(e => getEmployeeLevel(e) === 'Regional').length}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-sm bg-yellow-500 border-2 border-yellow-300" />
                            <span className="text-sm">Country Level</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {employees.filter(e => getEmployeeLevel(e) === 'Country').length}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                        <Building className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3" />
                        Markpedia OS Organigram
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Global → Regional → Country Hierarchy • v2.0
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleTakeSnapshot} size="sm" className="flex-1 sm:flex-none text-xs">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Snapshot
                    </Button>
                    {/* Only CEO can add employees */}
                    {user?.role === 'CEO' && (
                        <Button variant="outline" asChild size="sm" className="flex-1 sm:flex-none text-xs">
                            <Link href="/strategy/organigram/employees/new">
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Add Employee
                            </Link>
                        </Button>
                    )}
                    {canManage && (
                        <Button asChild size="sm" className="flex-1 sm:flex-none text-xs">
                            <Link href="/strategy/organigram/edit">
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Edit
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Mobile Navigation */}
            <MobileNavigation />

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
                {/* Sidebar - Hidden on mobile when in organigram view */}
                <div className={`space-y-4 sm:space-y-6 ${mobileView === 'organigram' ? 'hidden sm:block' : 'block'}`}>
                    {/* Filters */}
                    <FiltersSection />

                    {/* Level Legend */}
                    <LevelLegend />

                    {/* Snapshots */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">Snapshots</CardTitle>
                            <CardDescription className="text-sm">Saved organization structures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {snapshots.map(snapshot => (
                                    <div
                                        key={snapshot.id}
                                        className={`p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors ${selectedSnapshot?.id === snapshot.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setSelectedSnapshot(snapshot)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-sm truncate">{snapshot.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(snapshot.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                                                <Download className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {snapshot.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{snapshot.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Departments */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">Departments</CardTitle>
                            <CardDescription className="text-sm">Team distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 sm:space-y-3">
                                {departments.map(dept => (
                                    <div key={dept.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: dept.color }}
                                            />
                                            <span className="text-sm truncate">{dept.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">{dept.memberCount}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className={`lg:col-span-3 ${mobileView === 'list' ? 'hidden sm:block' : 'block'}`}>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base sm:text-lg line-clamp-1">
                                        {selectedSnapshot?.name || 'Current Organization Structure'}
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        {canManage
                                            ? 'Global → Regional → Country Hierarchy • Drag to rearrange'
                                            : 'Multi-level organization structure view'
                                        }
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Select defaultValue="export">
                                        <SelectTrigger className="w-[120px] sm:w-[130px] text-xs sm:text-sm">
                                            <SelectValue placeholder="Export" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="export" disabled>Export as...</SelectItem>
                                            <SelectItem value="png" onSelect={() => handleExport('png')}>
                                                PNG Image
                                            </SelectItem>
                                            <SelectItem value="pdf" onSelect={() => handleExport('pdf')}>
                                                PDF Document
                                            </SelectItem>
                                            <SelectItem value="json" onSelect={() => handleExport('json')}>
                                                JSON Data
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {mobileView === 'list' ? (
                                <EmployeeListView />
                            ) : (
                                <div
                                    ref={organigramRef}
                                    className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] border-2 border-dashed border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {organigramTree.length > 0 ? (
                                        organigramTree.map(node => renderOrganigramNode(node))
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <div className="text-center">
                                                <Building className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                                                <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                                                    No organization structure
                                                </h3>
                                                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                                    {canManage
                                                        ? 'Start by adding employees and creating your multi-level organization structure'
                                                        : 'Organization structure will be available soon'
                                                    }
                                                </p>
                                                {canManage && (
                                                    <Button asChild size="sm" className="text-xs sm:text-sm">
                                                        <Link href="/strategy/organigram/edit">
                                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                            Create Structure
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}