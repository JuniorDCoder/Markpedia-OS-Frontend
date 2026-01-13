'use client';

import { useState, useCallback, useRef, DragEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { snapshotApi } from '@/lib/api/snapshots';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
    user,
    initialSnapshotId
}: EditOrganigramClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [organigramNodes, setOrganigramNodes] = useState<OrganigramNode[]>([]);
    const [draggedEmployee, setDraggedEmployee] = useState<DraggedEmployee | null>(null);
    const [selectedNode, setSelectedNode] = useState<OrganigramNode | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const organigramRef = useRef<HTMLDivElement>(null);

    // Connection state                                                                                             
    const [connectionStart, setConnectionStart] = useState<{ nodeId: string; x: number; y: number; isReverse?: boolean } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<{ from: string; to: string } | null>(null);
    const [editingConnection, setEditingConnection] = useState<{ from: string; to: string } | null>(null);

    // Snapshot management state
    // Initialize currentSnapshotId with initialSnapshotId if provided
    const [currentSnapshotId, setCurrentSnapshotId] = useState<string | null>(initialSnapshotId || null);
    const [isSaveAsNewDialogOpen, setIsSaveAsNewDialogOpen] = useState(false);
    const [newSnapshotName, setNewSnapshotName] = useState('');

    // The previous replace_file_content logic implies I should target specific blocks. 
    // Let's do the State definition first (lines 63-65).

    // ACTUALLY, I will use multiple replace chunks in one go if possible, or sequential. 
    // Since I can't use multi_replace here (invalid tool?), I will do one replacing the state, then one for the render.
    // Wait, the tool definition allows multi_replace_file_content.
    // But I will stick to replace_file_content for safety as directed by previous context usage.

    // Changing strategy: I will modify the connectionStart state hook first.


    // LocalStorage key for draft organigram
    const STORAGE_KEY = 'organigram-draft';

    // Initial load hook - prioritize localStorage over snapshot
    const initializeOrganigram = useCallback(() => {
        // 1. If editing a specific snapshot (initialSnapshotId provided)
        if (initialSnapshotId) {
            const targetSnapshot = snapshots.find(s => s.id === initialSnapshotId);
            if (targetSnapshot) {
                const employeeMap = new Map(employees.map(emp => [emp.id, emp])); // Use Map for O(1) lookup

                // Map snapshot nodes (from API) to local OrganigramNode format
                const allNodes = targetSnapshot.nodes.map(nodeData => {
                    const employee = employeeMap.get(nodeData.employeeId);
                    if (!employee) return null;

                    // Explicitly construct the object to match OrganigramNode interface exactly
                    const node: OrganigramNode = {
                        id: nodeData.id,
                        employee: employee,
                        position: nodeData.position,
                        size: nodeData.size,
                        children: [] // Will be populated in the second pass
                    };
                    return node;
                }).filter((n): n is OrganigramNode => n !== null);

                // Reconstruct the parent-child relationships using object references
                const nodeMapLocal = new Map(allNodes.map(n => [n.id, n]));

                targetSnapshot.nodes.forEach(data => {
                    const node = nodeMapLocal.get(data.id);
                    // ApiOrganigramNode has children as string[] (ids)
                    if (node && data.children && Array.isArray(data.children)) {
                        node.children = data.children
                            .map((childId: string) => nodeMapLocal.get(childId))
                            .filter((n): n is OrganigramNode => n !== undefined);
                    }
                });

                setOrganigramNodes(allNodes);
                console.log(`Loaded snapshot: ${targetSnapshot.name}`);
                return;
            }
        }

        // 2. If creating new (no initialSnapshotId)
        if (!initialSnapshotId) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);

                    // Only restore draft if it is also for a NEW snapshot (null ID)
                    // If the draft has a snapshotId, it belongs to an edit session, so ignore it for "Create New"
                    if (!parsed.snapshotId) {
                        const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

                        // Handle both old array format and new object format
                        const nodesSource = Array.isArray(parsed) ? parsed : (parsed.nodes || []);

                        // Reconstruct nodes with employee objects
                        const reconstructNodes = (nodeData: any): OrganigramNode | null => {
                            const employee = employeeMap.get(nodeData.employeeId);
                            if (!employee) return null;

                            return {
                                id: nodeData.id,
                                employee: employee,
                                position: nodeData.position,
                                size: nodeData.size,
                                children: (nodeData.children || [])
                                    .map((child: any) => reconstructNodes(child))
                                    .filter((n: any): n is OrganigramNode => n !== null)
                            };
                        };

                        const restoredNodes = nodesSource
                            .map((nodeData: any) => reconstructNodes(nodeData))
                            .filter((n: any): n is OrganigramNode => n !== null);

                        if (restoredNodes.length > 0) {
                            setOrganigramNodes(restoredNodes);
                            console.log('Loaded new structure draft from localStorage');
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        }
    }, [employees, snapshots, initialSnapshotId]);

    useEffect(() => {
        initializeOrganigram();
    }, [initializeOrganigram]);

    // Auto-save to localStorage whenever organigramNodes changes
    useEffect(() => {
        // Don't save empty state on initial render, unless we are expliclty clearing/editing a snapshot
        if (organigramNodes.length === 0 && !currentSnapshotId) return;

        try {
            // Serialize nodes for storage (convert to plain objects)
            const serializeNode = (node: OrganigramNode): any => ({
                id: node.id,
                employeeId: node.employee.id,
                position: node.position,
                size: node.size,
                children: node.children.map(child => serializeNode(child))
            });

            const nodesData = organigramNodes.map(node => serializeNode(node));

            // Save with metadata including snapshotId to prevent cross-contamination
            const storageData = {
                snapshotId: currentSnapshotId,
                nodes: nodesData,
                timestamp: Date.now()
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
            console.log('Auto-saved to localStorage');
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }, [organigramNodes, currentSnapshotId]);

    // Drag and drop handlers (Node moving)
    const handleDragStart = (e: DragEvent, employee: Employee) => {
        console.log('Drag Start:', employee.name);
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        // REQUIRED: Set data to allow drag
        e.dataTransfer.setData('text/plain', employee.id);
        e.dataTransfer.effectAllowed = 'move';

        setDraggedEmployee({
            employee,
            offset: {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }
        });
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // console.log('Drag Over');
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        console.log('Drop Event Triggered');
        if (!draggedEmployee) {
            console.log('Drop rejected: No dragged employee state');
            return;
        }
        if (!organigramRef.current) {
            console.log('Drop rejected: No ref');
            return;
        }

        const rect = organigramRef.current.getBoundingClientRect();
        const scrollLeft = organigramRef.current.scrollLeft;
        const scrollTop = organigramRef.current.scrollTop;

        const x = e.clientX - rect.left + scrollLeft - draggedEmployee.offset.x;
        const y = e.clientY - rect.top + scrollTop - draggedEmployee.offset.y;

        console.log('Dropping at:', x, y);

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
        if (fromNodeId === toNodeId) return;

        setOrganigramNodes(prev => {
            const fromNode = prev.find(n => n.id === fromNodeId);
            const toNode = prev.find(n => n.id === toNodeId);

            if (!fromNode || !toNode) return prev;

            // Avoid validation duplicates
            if (fromNode.children.some(child => child.id === toNodeId)) return prev;

            return prev.map(node =>
                node.id === fromNodeId
                    ? { ...node, children: [...node.children, toNode] }
                    : node
            );
        });
    };

    const handleRemoveNode = (nodeId: string) => {
        setOrganigramNodes(prev => {
            // First, remove the node itself from the top level
            const filtered = prev.filter(node => node.id !== nodeId);

            // Then, recursively remove this node from all children arrays
            const cleanChildren = (nodes: OrganigramNode[]): OrganigramNode[] => {
                return nodes.map(node => ({
                    ...node,
                    children: cleanChildren(node.children.filter(child => child.id !== nodeId))
                }));
            };

            return cleanChildren(filtered);
        });
        setSelectedNode(null);
        setSelectedConnection(null);
        setIsSidebarOpen(false);
    };

    const handleRemoveConnection = (fromId: string, toId: string) => {
        setOrganigramNodes(prev => prev.map(node =>
            node.id === fromId
                ? { ...node, children: node.children.filter(c => c.id !== toId) }
                : node
        ));
        setSelectedConnection(null);
    };

    const handleUpdateSnapshot = async () => {
        if (!currentSnapshotId) {
            toast.error('No snapshot selected to update');
            return;
        }

        setIsLoading(true);
        try {
            const snapshotData = {
                nodes: organigramNodes.flatMap(node => flattenNode(node))
            };

            await snapshotApi.update(currentSnapshotId, snapshotData);

            // Clear localStorage draft after successful update
            localStorage.removeItem(STORAGE_KEY);

            toast.success('Snapshot updated successfully');
            router.push('/strategy/organigram');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update snapshot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAsNew = async () => {
        if (!newSnapshotName.trim()) {
            toast.error('Please enter a snapshot name');
            return;
        }

        setIsLoading(true);
        try {
            const snapshotData = {
                name: newSnapshotName,
                description: `Created on ${new Date().toLocaleDateString()}`,
                nodes: organigramNodes.flatMap(node => flattenNode(node))
            };

            await snapshotApi.create(snapshotData);

            // Clear localStorage draft after successful save
            localStorage.removeItem(STORAGE_KEY);

            toast.success('New snapshot created successfully');
            setIsSaveAsNewDialogOpen(false);
            setNewSnapshotName('');
            router.push('/strategy/organigram');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create snapshot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSnapshot = async () => {
        if (!currentSnapshotId) {
            toast.error('No snapshot selected to delete');
            return;
        }

        if (!confirm('Are you sure you want to delete this snapshot? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        try {
            await snapshotApi.delete(currentSnapshotId);

            // Clear localStorage draft
            localStorage.removeItem(STORAGE_KEY);

            toast.success('Snapshot deleted successfully');
            router.push('/strategy/organigram');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete snapshot');
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

    const availableEmployees = employees.filter(emp => {
        // Check if employee exists in any node (including nested children)
        const getAllEmployeeIds = (nodes: OrganigramNode[]): Set<string> => {
            const ids = new Set<string>();
            const traverse = (node: OrganigramNode) => {
                ids.add(node.employee.id);
                node.children.forEach(child => traverse(child));
            };
            nodes.forEach(node => traverse(node));
            return ids;
        };

        const usedEmployeeIds = getAllEmployeeIds(organigramNodes);
        return !usedEmployeeIds.has(emp.id);
    });

    // Mouse handlers for connections - Need to account for scroll
    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (connectionStart && organigramRef.current) {
            const rect = organigramRef.current.getBoundingClientRect();
            const scrollLeft = organigramRef.current.scrollLeft;
            const scrollTop = organigramRef.current.scrollTop;

            setMousePos({
                x: e.clientX - rect.left + scrollLeft,
                y: e.clientY - rect.top + scrollTop
            });
        }
    };
    // ...

    // Update renderOrganigramNode's onDragEnd to use scroll
    // Inside renderOrganigramNode:
    /*
                onDragEnd={(e) => {
                    if (!organigramRef.current) return;
                    const rect = organigramRef.current.getBoundingClientRect();
                    const scrollLeft = organigramRef.current.scrollLeft;
                    const scrollTop = organigramRef.current.scrollTop;
                    const x = e.clientX - rect.left + scrollLeft - (node.size.width / 2);
                    const y = e.clientY - rect.top + scrollTop - (node.size.height / 2);
                    handleNodeDrag(node.id, { x, y });
                }}
    */

    const handleCanvasMouseUp = () => {
        if (connectionStart) {
            setConnectionStart(null);
            setMousePos(null);
            // If dragging handle but dropped on canvas, cancel edit
            setEditingConnection(null);
        }
    };

    const renderConnections = () => {
        // Create a Set of valid node IDs for O(1) lookup
        const validNodeIds = new Set(organigramNodes.map(n => n.id));

        return (
            <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible" style={{ zIndex: 0 }}>
                {organigramNodes.map(node => {
                    if (!node.children || node.children.length === 0) return null;

                    // Filter out any children that don't exist in the main nodes array
                    const validChildren = node.children.filter(child => validNodeIds.has(child.id));

                    return validChildren.map(child => {
                        const startX = node.position.x + (node.size.width / 2);
                        const startY = node.position.y + node.size.height;
                        const endX = child.position.x + (child.size.width / 2);
                        const endY = child.position.y;

                        const midY = startY + (endY - startY) / 2;
                        const path = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;

                        const isSelected = selectedConnection?.from === node.id && selectedConnection?.to === child.id;

                        return (
                            <g key={`${node.id}-${child.id}`} className="overflow-visible">
                                {/* Hitbox */}
                                <path
                                    d={path}
                                    stroke="transparent"
                                    strokeWidth="20"
                                    fill="none"
                                    className="cursor-pointer pointer-events-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedConnection({ from: node.id, to: child.id });
                                        setSelectedNode(null);
                                        setIsSidebarOpen(true);
                                    }}
                                />
                                {/* Visible Line */}
                                <path
                                    d={path}
                                    stroke={isSelected ? "#3B82F6" : "#9CA3AF"}
                                    strokeWidth={isSelected ? "3" : "2"}
                                    fill="none"
                                    className="pointer-events-none transition-colors"
                                />
                                {/* Handle */}
                                {isSelected && (
                                    <g>
                                        <circle
                                            cx={endX}
                                            cy={endY}
                                            r="12"
                                            fill="transparent"
                                            className="cursor-crosshair pointer-events-auto"
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const absStartX = node.position.x + node.size.width / 2;
                                                const absStartY = node.position.y + node.size.height;
                                                const absEndX = child.position.x + child.size.width / 2;
                                                const absEndY = child.position.y;
                                                setConnectionStart({ nodeId: node.id, x: absStartX, y: absStartY });
                                                setMousePos({ x: absEndX, y: absEndY });
                                                setEditingConnection({ from: node.id, to: child.id });
                                            }}
                                        />
                                        <circle
                                            cx={endX}
                                            cy={endY}
                                            r="6"
                                            fill="#3B82F6"
                                            stroke="white"
                                            strokeWidth="2"
                                            className="pointer-events-none"
                                        />
                                    </g>
                                )}
                            </g>
                        );
                    });
                })}
            </svg>
        );
    };

    const renderOrganigramNode = (node: OrganigramNode) => {
        return (
            <div
                key={node.id}
                className={`
          absolute bg-white border-2 rounded-lg p-3 shadow-sm cursor-move z-20 select-none
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
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    setSelectedConnection(null);
                    setIsSidebarOpen(true);
                }}
                onMouseUp={(e) => {
                    if (connectionStart && connectionStart.nodeId !== node.id) {
                        e.stopPropagation();
                        // Add new connection based on direction
                        if (connectionStart.isReverse) {
                            // Dragged from Top Dot (Child) -> Dropped on This Node (Parent)
                            handleAddConnection(node.id, connectionStart.nodeId);
                        } else {
                            // Dragged from Bottom Dot (Parent) -> Dropped on This Node (Child)
                            handleAddConnection(connectionStart.nodeId, node.id);
                        }

                        // If we are editing, remove the old connection
                        if (editingConnection) {
                            handleRemoveConnection(editingConnection.from, editingConnection.to);
                            setEditingConnection(null);
                        }

                        setConnectionStart(null);
                        setMousePos(null);
                    }
                }}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', node.id);
                }}
                onDragEnd={(e) => {
                    if (!organigramRef.current) return;
                    const rect = organigramRef.current.getBoundingClientRect();
                    const scrollLeft = organigramRef.current.scrollLeft;
                    const scrollTop = organigramRef.current.scrollTop;
                    const x = e.clientX - rect.left + scrollLeft - (node.size.width / 2);
                    const y = e.clientY - rect.top + scrollTop - (node.size.height / 2);
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

                {/* Top Connection Point (Target/End) */}
                <div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-crosshair hover:scale-125 transition-transform border-2 border-white shadow-sm z-30"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = node.position.x + node.size.width / 2;
                        const startY = node.position.y; // Top of node
                        setConnectionStart({ nodeId: node.id, x: startX, y: startY, isReverse: true });
                        setMousePos({ x: startX, y: startY });
                    }}
                />

                {/* Bottom Connection Point (Source/Start) */}
                <div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-crosshair hover:scale-125 transition-transform border-2 border-white shadow-sm z-30"
                    onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent drag start of the node
                        e.preventDefault();
                        const startX = node.position.x + node.size.width / 2;
                        const startY = node.position.y + node.size.height; // Bottom of node
                        setConnectionStart({ nodeId: node.id, x: startX, y: startY, isReverse: false });
                        setMousePos({ x: startX, y: startY });
                    }}
                />
            </div>
        );
    };

    // Sidebar content render function (not a component) to avoid re-mounting issues
    const renderSidebarContent = () => (
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

            {/* Selected Connection Actions */}
            {selectedConnection && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Selected Connection</CardTitle>
                        <CardDescription>Relationship Actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-3">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRemoveConnection(selectedConnection.from, selectedConnection.to)}
                        >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete Connection
                        </Button>
                    </CardContent>
                </Card>
            )}

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
                            {/* Check if node has a parent and allow disconnecting */}
                            {organigramNodes.some(n => n.children.some(c => c.id === selectedNode.id)) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        // Find parent and remove this child
                                        setOrganigramNodes(prev => prev.map(node => ({
                                            ...node,
                                            children: node.children.filter(c => c.id !== selectedNode.id)
                                        })));
                                    }}
                                >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Disconnect Parent
                                </Button>
                            )}

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
                        <p>• Click lines to select and delete them</p>
                        <p>• Drag employees from the sidebar to the canvas</p>
                        <p>• Drag nodes to reposition them</p>
                        <p>• Click to select a node</p>
                        <p>• Drag from connection point to create relationships</p>
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
                                {renderSidebarContent()}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Delete Snapshot - Only show when editing existing */}
                    {currentSnapshotId && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteSnapshot}
                            disabled={isLoading}
                            className="hidden sm:flex flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}

                    {/* Save (for new) or Update (for existing) */}
                    {currentSnapshotId ? (
                        <Button
                            size="sm"
                            onClick={handleUpdateSnapshot}
                            disabled={isLoading}
                            className="hidden sm:flex flex-shrink-0"
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => setIsSaveAsNewDialogOpen(true)}
                            disabled={isLoading}
                            className="hidden sm:flex flex-shrink-0"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    )}

                    {/* Mobile: Same logic */}
                    {currentSnapshotId ? (
                        <Button
                            size="icon"
                            onClick={handleUpdateSnapshot}
                            disabled={isLoading}
                            className="sm:hidden flex-shrink-0"
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            onClick={() => setIsSaveAsNewDialogOpen(true)}
                            disabled={isLoading}
                            className="sm:hidden flex-shrink-0"
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                    )}

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
                    {renderSidebarContent()}
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
                                onDragEnter={() => console.log('Drag Enter')}
                                onDrop={handleDrop}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onClick={() => {
                                    setSelectedNode(null);
                                    setSelectedConnection(null);
                                }}
                            >
                                {/* Global SVG Defs */}
                                <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>

                                </svg>

                                {/* Spacer for infinite canvas */}
                                <div
                                    style={{
                                        width: Math.max(2000, ...organigramNodes.map(n => n.position.x + n.size.width + 500)),
                                        height: Math.max(1500, ...organigramNodes.map(n => n.position.y + n.size.height + 500)),
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        pointerEvents: 'none'
                                    }}
                                />

                                {/* Persistent Connections Layer (Behind Nodes) */}
                                {renderConnections()}

                                {organigramNodes.map(node => renderOrganigramNode(node))}

                                {/* Temporary connection line */}
                                {connectionStart && mousePos && (
                                    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
                                        <path
                                            d={`M ${connectionStart.x} ${connectionStart.y} 
                                               V ${connectionStart.y + (mousePos.y - connectionStart.y) / 2} 
                                               H ${mousePos.x} 
                                               V ${mousePos.y}`}
                                            stroke="#3B82F6"
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                            fill="none"
                                        />
                                    </svg>
                                )}

                                {organigramNodes.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
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

            {/* Save Dialog (for new structures) */}
            <Dialog open={isSaveAsNewDialogOpen} onOpenChange={setIsSaveAsNewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save New Structure</DialogTitle>
                        <DialogDescription>
                            Give your new organigram structure a name to save it.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="snapshot-name">Snapshot Name</Label>
                            <Input
                                id="snapshot-name"
                                placeholder="e.g., Q1 2024 Structure"
                                value={newSnapshotName}
                                onChange={(e) => setNewSnapshotName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newSnapshotName.trim()) {
                                        handleSaveAsNew();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsSaveAsNewDialogOpen(false);
                                setNewSnapshotName('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAsNew} disabled={isLoading || !newSnapshotName.trim()}>
                            {isLoading ? 'Saving...' : 'Save Structure'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}