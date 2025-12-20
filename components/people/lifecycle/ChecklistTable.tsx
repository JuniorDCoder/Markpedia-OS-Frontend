'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ChecklistItem } from '@/lib/api/lifecycle';

interface ChecklistTableProps {
    categories: string[];
    initialItems: ChecklistItem[];
    type: 'onboarding' | 'offboarding';
}

export function ChecklistTable({ categories, initialItems, type }: ChecklistTableProps) {
    const [items, setItems] = useState<ChecklistItem[]>(initialItems);

    const toggleStatus = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, status: !item.status } : item
        ));
    };

    const getItemsByCategory = (category: string) => {
        return items.filter(item => item.category === category);
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Task</TableHead>
                        <TableHead>Responsible</TableHead>
                        <TableHead>Verification / Tool</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => {
                        const categoryItems = getItemsByCategory(category);
                        if (categoryItems.length === 0) return null;

                        return (
                            <>
                                <TableRow key={category} className="bg-muted/50 hover:bg-muted/50">
                                    <TableCell colSpan={4} className="font-semibold text-primary">
                                        {category}
                                    </TableCell>
                                </TableRow>
                                {categoryItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium pl-6">
                                            {item.task}
                                        </TableCell>
                                        <TableCell>{item.responsible}</TableCell>
                                        <TableCell>
                                            {item.verificationLink ? (
                                                <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary">
                                                    <Link href={item.verificationLink} className="flex items-center gap-1">
                                                        {item.verificationLabel || 'View'}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`status-${item.id}`}
                                                    checked={item.status}
                                                    onCheckedChange={() => toggleStatus(item.id)}
                                                />
                                                <label
                                                    htmlFor={`status-${item.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {item.status ? 'Done' : 'Pending'}
                                                </label>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
