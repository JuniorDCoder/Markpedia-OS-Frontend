'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Employee, OrganigramSnapshot, Department, User } from '@/types';
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
    Save
} from 'lucide-react';

interface OrganigramClientProps {
    employees: Employee[];
    snapshots: OrganigramSnapshot[];
    departments: Department[];
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
                                             user
                                         }: OrganigramClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [selectedSnapshot, setSelectedSnapshot] = useState<OrganigramSnapshot | null>(snapshots[0] || null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const organigramRef = useRef<HTMLDivElement>(null);

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
        return matchesSearch && matchesDepartment;
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

        return (
            <div key={node.id} className="flex flex-col items-center">
                {/* Node */}
                <div
                    draggable={canManage}
                    onDragStart={(e) => handleDragStart(e, node.id)}
                    className={`
            relative bg-white border-2 rounded-lg p-4 shadow-sm cursor-move min-w-[200px] 
            transition-all duration-200 hover:shadow-md hover:border-blue-300
            ${selectedNode === node.id ? 'border-blue-500 shadow-md' : 'border-gray-200'}
            ${employee.department === 'Executive' ? 'border-purple-300 bg-purple-50' : ''}
            ${employee.department === 'Technology' ? 'border-blue-300 bg-blue-50' : ''}
            ${employee.department === 'Marketing' ? 'border-green-300 bg-green-50' : ''}
          `}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        position: 'absolute'
                    }}
                >
                    {/* Department color indicator */}
                    <div
                        className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
                        style={{
                            backgroundColor: departments.find(d => d.name === employee.department)?.color || '#6B7280'
                        }}
                    />

                    <div className="text-center">
                        <div className="flex items-center justify-between mb-2">
                            <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                                style={{
                                    backgroundColor: departments.find(d => d.name === employee.department)?.color + '20',
                                    color: departments.find(d => d.name === employee.department)?.color
                                }}
                            >
                                {employee.department}
                            </Badge>
                            {canManage && (
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <h3 className="font-semibold text-sm mb-1">{employee.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{employee.title}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>

                        {employee.role === 'CEO' && (
                            <Badge variant="default" className="mt-2 bg-purple-500">CEO</Badge>
                        )}
                        {employee.role === 'CXO' && (
                            <Badge variant="default" className="mt-2 bg-blue-500">CXO</Badge>
                        )}
                    </div>

                    {/* Connection line to children */}
                    {children.length > 0 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0.5 h-8 bg-gray-300" />
                    )}
                </div>

                {/* Children */}
                {children.length > 0 && (
                    <div className="relative mt-8 flex gap-8">
                        {children.map((child, index) => (
                            <div key={child.id} className="flex flex-col items-center">
                                {/* Horizontal connection line */}
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-300 -translate-y-4" />
                                {renderOrganigramNode(child, level + 1)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Building className="h-8 w-8 mr-3" />
                        Organigram
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Visualize and manage your organization structure
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleTakeSnapshot}>
                        <Camera className="h-4 w-4 mr-2" />
                        Take Snapshot
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/strategy/organigram/employees/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Link>
                    </Button>
                    {canManage && (
                        <Button asChild>
                            <Link href="/strategy/organigram/edit">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Structure
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employees.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{departments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Snapshots</CardTitle>
                        <Camera className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{snapshots.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Managers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employees.filter(e => e.role === 'Manager' || e.role === 'CXO').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Department</label>
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger>
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
                        </CardContent>
                    </Card>

                    {/* Snapshots */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Snapshots</CardTitle>
                            <CardDescription>Saved organization structures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {snapshots.map(snapshot => (
                                    <div
                                        key={snapshot.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedSnapshot?.id === snapshot.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedSnapshot(snapshot)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-sm">{snapshot.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(snapshot.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Download className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {snapshot.description && (
                                            <p className="text-xs text-muted-foreground mt-1">{snapshot.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Departments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Departments</CardTitle>
                            <CardDescription>Team distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {departments.map(dept => (
                                    <div key={dept.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: dept.color }}
                                            />
                                            <span className="text-sm">{dept.name}</span>
                                        </div>
                                        <Badge variant="secondary">{dept.memberCount}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Organigram */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>
                                        {selectedSnapshot?.name || 'Current Organization Structure'}
                                    </CardTitle>
                                    <CardDescription>
                                        Drag to rearrange • Click to select • Double-click to edit
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Select defaultValue="export">
                                        <SelectTrigger className="w-[130px]">
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
                            <div
                                ref={organigramRef}
                                className="relative min-h-[600px] border-2 border-dashed border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                {organigramTree.length > 0 ? (
                                    organigramTree.map(node => renderOrganigramNode(node))
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                                No organization structure
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {canManage
                                                    ? 'Start by adding employees and creating your organization structure'
                                                    : 'Organization structure will be available soon'
                                                }
                                            </p>
                                            {canManage && (
                                                <Button asChild>
                                                    <Link href="/strategy/organigram/edit">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Create Structure
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}