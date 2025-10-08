'use client';

import { useState, useCallback, useRef, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Employee, OrganigramSnapshot, Department, User, OrganigramNode as ApiOrganigramNode } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Users,
    Building,
    Download,
    Camera,
    Menu
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EditOrganigramClientProps {
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

interface DraggedEmployee {
    employee: Employee;
    offset: { x: number; y: number };
}

export default function EditOrganigramClient({
                                                 employees,
                                                 snapshots,
                                                 departments,
                                                 user
                                             }: EditOrganigramClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [organigramNodes, setOrganigramNodes] = useState<OrganigramNode[]>([]);
    const [draggedEmployee, setDraggedEmployee] = useState<DraggedEmployee | null>(null);
    const [selectedNode, setSelectedNode] = useState<OrganigramNode | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const organigramRef = useRef<HTMLDivElement>(null);

    // Initialize organigram from latest snapshot or create new
    const initializeOrganigram = useCallback(() => {
        if (snapshots.length > 0) {
            const latestSnapshot = snapshots[0];
            const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
            const nodeMap = new Map(latestSnapshot.nodes.map(node => [node.id, node]));

            const buildTree = (nodeData: ApiOrganigramNode): OrganigramNode => ({
                ...nodeData,
                employee: employeeMap.get(nodeData.employeeId)!,
                children: nodeData.children
                    .map((childId: string) => nodeMap.get(childId))
                    .filter(Boolean)
                    .map(buildTree)
            });

            const rootNodes = latestSnapshot.nodes
                .filter(node => {
                    const employee = employeeMap.get(node.employeeId);
                    return employee && !employee.reportsTo;
                })
                .map(buildTree);

            setOrganigramNodes(rootNodes);
        }
    }, [employees, snapshots]);

    // Drag and drop handlers
    const handleDragStart = (e: DragEvent, employee: Employee) => {
        setDraggedEmployee({
            employee,
            offset: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
        });
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (!draggedEmployee || !organigramRef.current) return;

        const rect = organigramRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - draggedEmployee.offset.x;
        const y = e.clientY - rect.top - draggedEmployee.offset.y;

        const newNode: OrganigramNode = {
            id: `node-${Date.now()}`,
            employee: draggedEmployee.employee,
            position: { x, y },
            size: { width: 200, height: 100 },
            children: []
        };

        setOrganigramNodes(prev => [...prev, newNode]);
        setDraggedEmployee(null);
    };

    const handleNodeDrag = (nodeId: string, newPosition: { x: number; y: number }) => {
        setOrganigramNodes(prev =>
            prev.map(node =>
                node.id === nodeId
                    ? { ...node, position: newPosition }
                    : node
            )
        );
    };

    const handleAddConnection = (fromNodeId: string, toNodeId: string) => {
        setOrganigramNodes(prev =>
            prev.map(node =>
                node.id === fromNodeId
                    ? { ...node, children: [...node.children, organigramNodes.find(n => n.id === toNodeId)!] }
                    : node
            )
        );
    };

    const handleRemoveNode = (nodeId: string) => {
        setOrganigramNodes(prev =>
            prev.filter(node => node.id !== nodeId)
                .map(node => ({
                    ...node,
                    children: node.children.filter(child => child.id !== nodeId)
                }))
        );
        setSelectedNode(null);
        setIsSidebarOpen(false);
    };

    const handleSaveSnapshot = async (name: string, description?: string) => {
        setIsLoading(true);
        try {
            const snapshotData = {
                name,
                description,
                nodes: organigramNodes.flatMap(node => flattenNode(node))
            };

            // TODO: Implement API call
            await fetch('/api/organigram/snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(snapshotData)
            });

            toast.success('Snapshot saved successfully');
            router.push('/strategy/organigram');
        } catch (error) {
            toast.error('Failed to save snapshot');
        } finally {
            setIsLoading(false);
        }
    };

    const flattenNode = (node: OrganigramNode): ApiOrganigramNode[] => {
        const baseNode = {
            id: node.id,
            employeeId: node.employee.id,
            position: node.position,
            size: node.size,
            children: node.children.map(child => child.id)
        };

        return [
            baseNode,
            ...node.children.flatMap(child => flattenNode(child))
        ];
    };

    const availableEmployees = employees.filter(emp =>
        !organigramNodes.some(node => node.employee.id === emp.id)
    );

    const renderOrganigramNode = (node: OrganigramNode) => {
        return (
            <div
                key={node.id}
                className={`
          absolute bg-white border-2 rounded-lg p-3 shadow-sm cursor-move 
          transition-all duration-200 hover:shadow-md
          ${selectedNode?.id === node.id ? 'border-blue-500 shadow-md ring-2 ring-blue-200' : 'border-gray-200'}
          ${node.employee.department === 'Executive' ? 'border-purple-300 bg-purple-50' : ''}
          ${node.employee.department === 'Technology' ? 'border-blue-300 bg-blue-50' : ''}
          ${node.employee.department === 'Marketing' ? 'border-green-300 bg-green-50' : ''}
          min-w-[160px] max-w-[200px] md:min-w-[180px] lg:min-w-[200px]
        `}
                style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: node.size.width,
                    height: node.size.height
                }}
                onClick={() => {
                    setSelectedNode(node);
                    setIsSidebarOpen(true);
                }}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', node.id);
                }}
                onDragEnd={(e) => {
                    if (!organigramRef.current) return;
                    const rect = organigramRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left - (node.size.width / 2);
                    const y = e.clientY - rect.top - (node.size.height / 2);
                    handleNodeDrag(node.id, { x, y });
                }}
            >
                {/* Department color indicator */}
                <div
                    className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
                    style={{
                        backgroundColor: departments.find(d => d.name === node.employee.department)?.color || '#6B7280'
                    }}
                />

                <div className="text-center h-full flex flex-col justify-between">
                    <div>
                        <Badge
                            variant="secondary"
                            className="text-xs capitalize mb-1 px-1"
                            style={{
                                backgroundColor: departments.find(d => d.name === node.employee.department)?.color + '20',
                                color: departments.find(d => d.name === node.employee.department)?.color
                            }}
                        >
                            {node.employee.department}
                        </Badge>

                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{node.employee.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{node.employee.title}</p>
                    </div>

                    <div className="flex justify-center gap-1 mt-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveNode(node.id);
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Connection points */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-crosshair" />
                {node.children.length > 0 && node.children.map(child => (
                    <svg
                        key={child.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: node.position.x + node.size.width / 2,
                            top: node.position.y + node.size.height,
                            width: Math.abs(child.position.x - node.position.x),
                            height: Math.abs(child.position.y - node.position.y - node.size.height)
                        }}
                    >
                        <line
                            x1="0"
                            y1="0"
                            x2="100%"
                            y2="100%"
                            stroke="#3B82F6"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    </svg>
                ))}
            </div>
        );
    };

    // Sidebar content component to avoid duplication
    const SidebarContent = () => (
        <>
            {/* Available Employees */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Available Employees</CardTitle>
                    <CardDescription>Drag employees to the canvas</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {availableEmployees.map(employee => (
                            <div
                                key={employee.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, employee)}
                                className="p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-2 h-8 rounded"
                                        style={{
                                            backgroundColor: departments.find(d => d.name === employee.department)?.color
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{employee.name}</h4>
                                        <p className="text-xs text-muted-foreground truncate">{employee.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {availableEmployees.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                All employees are on the organigram
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Selected Node Actions */}
            {selectedNode && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Selected Node</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-3">
                        <div className="text-sm">
                            <div className="font-medium">{selectedNode.employee.name}</div>
                            <div className="text-muted-foreground">{selectedNode.employee.title}</div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleRemoveNode(selectedNode.id)}
                            >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Remove from Chart
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Instructions</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Drag employees from the sidebar to the canvas</p>
                        <p>• Drag nodes to reposition them</p>
                        <p>• Click to select a node</p>
                        <p>• Drag from connection point to create relationships</p>
                        <p>• Save snapshots to preserve structures</p>
                    </div>
                </CardContent>
            </Card>
        </>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                        <Link href="/strategy/organigram">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                            Edit Organigram
                        </h1>
                        <p className="text-muted-foreground text-xs md:text-sm mt-1 truncate">
                            Drag and drop to build your organization structure
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 md:gap-2">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden flex-shrink-0">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                            <div className="space-y-4 mt-4">
                                <SidebarContent />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveSnapshot(`Snapshot ${new Date().toLocaleDateString()}`)}
                        disabled={isLoading}
                        className="hidden sm:flex flex-shrink-0"
                    >
                        <Camera className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSaveSnapshot(`Snapshot ${new Date().toLocaleDateString()}`)}
                        disabled={isLoading}
                        className="sm:hidden flex-shrink-0"
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                    <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                        <Link href="/strategy/organigram/employees/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Link>
                    </Button>
                    <Button asChild size="icon" className="sm:hidden flex-shrink-0">
                        <Link href="/strategy/organigram/employees/new">
                            <Plus className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-4">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block space-y-4 md:space-y-6">
                    <SidebarContent />
                </div>

                {/* Main Canvas */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-lg md:text-xl">Organization Canvas</CardTitle>
                                    <CardDescription className="truncate">
                                        Build your organizational structure by dragging and dropping
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="flex-shrink-0 ml-2">
                                    {organigramNodes.length} nodes
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4">
                            <div
                                ref={organigramRef}
                                className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                {organigramNodes.map(node => renderOrganigramNode(node))}

                                {organigramNodes.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        <div className="text-center">
                                            <Building className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-3" />
                                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                                Start Building Your Organigram
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Drag employees from the sidebar to begin
                                            </p>
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