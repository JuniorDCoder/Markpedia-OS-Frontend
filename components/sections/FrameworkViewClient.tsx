'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { departmentalFrameworkService } from '@/services/departmentalFrameworkService';
import type { Framework, Department, FrameworkSection } from '@/types';
import { ArrowLeft, Edit, Download, FileText, Target, Calendar, Plus, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { sanitizeRichText, stripHtml, normalizeRichTextValue } from '@/lib/rich-text';
import { useAuthStore } from '@/store/auth';
import { isAdminLikeRole } from '@/lib/roles';
import { exportFrameworkToPDF } from '@/lib/export-pdf';

interface Props {
    frameworkId: string;
    initialFramework?: Framework;
}

export default function FrameworkViewClient({ frameworkId, initialFramework }: Props) {
    const router = useRouter();
    const { user } = useAuthStore();
    const canManage = isAdminLikeRole(user?.role);
    const [framework, setFramework] = useState<Framework | null>(initialFramework || null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialFramework);
    const [exporting, setExporting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [toDelete, setToDelete] = useState<Framework | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [approvalComments, setApprovalComments] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');

    useEffect(() => {
        if (!initialFramework) loadFramework();
        loadDepartments();
        getCurrentUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frameworkId]);

    const loadFramework = async () => {
        try {
            setLoading(true);
            const fw = await departmentalFrameworkService.getFramework(frameworkId);
            setFramework(fw);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load framework');
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const depts = await departmentalFrameworkService.getDepartments();
            setDepartments(depts);
        } catch (err) {
            console.error('Failed to load departments', err);
        }
    };

    const getCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const user = await response.json();
                setCurrentUserName(`${user.firstName || 'User'} ${user.lastName || ''}`.trim());
            } else {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setCurrentUserName(`${user.firstName || 'User'} ${user.lastName || ''}`.trim());
                } else {
                    setCurrentUserName('System Admin');
                }
            }
        } catch (err) {
            console.error('Failed to get current user:', err);
            setCurrentUserName('System Admin');
        }
    };

    const handleExport = async () => {
        if (!framework) return;
        try {
            setExporting(true);
            const deptName = departments.find(d => d.id === framework.department)?.name || framework.department;
            exportFrameworkToPDF({
                name: framework.name,
                department: framework.department,
                description: framework.description,
                version: framework.version,
                status: framework.status,
                createdBy: framework.createdBy,
                createdAt: framework.createdAt,
                lastReviewed: framework.lastReviewed,
                nextReview: framework.nextReview,
                sections: framework.sections,
            }, deptName);
            toast.success('PDF downloaded successfully');
        } catch (err: any) {
            toast.error('Failed to export framework');
            console.error('export error', err);
        } finally {
            setExporting(false);
        }
    };

    const handleNewVersion = async () => {
        if (!framework) return;
        try {
            const fw = await departmentalFrameworkService.createNewVersion(framework.id);
            toast.success('New version created');
            router.push(`/work/departmental-frameworks/${fw.id}/edit`);
        } catch (err) {
            toast.error('Failed to create new version');
            console.error(err);
        }
    };

    const handleApproveClick = () => {
        setApprovalComments('');
        setApproveDialogOpen(true);
    };

    const handleApproveConfirm = async () => {
        if (!framework) return;
        
        if (!currentUserName) {
            toast.error('Unable to determine current user. Please refresh and try again.');
            return;
        }

        try {
            setApproving(true);
            const updated = await departmentalFrameworkService.approveFramework(framework.id, {
                approved_by: currentUserName,
                comments: approvalComments || null,
                review_cadence: framework.reviewCadence || 'Quarterly'
            });
            setFramework(updated);
            setApproveDialogOpen(false);
            setApprovalComments('');
            toast.success('Framework approved successfully');
        } catch (err: any) {
            const status = err?.status;
            const details = err?.data?.detail;

            if (status === 422 && Array.isArray(details)) {
                const errorMessages = details.map((d: any) => d.msg || JSON.stringify(d)).join('\n');
                toast.error(`Validation error:\n${errorMessages}`);
            } else if (status === 422) {
                toast.error('Validation error: Please ensure all required fields are filled (approved_by, review_cadence)');
            } else {
                toast.error('Failed to approve framework');
            }
            console.error('approve error', err);
        } finally {
            setApproving(false);
        }
    };

    const openDelete = (fw: Framework) => {
        setToDelete(fw);
        setConfirmText('');
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        const expected = `DELETE ${toDelete.id}`;
        if (confirmText !== expected) {
            toast.error(`Please type "${expected}" to confirm deletion`);
            return;
        }
        try {
            setIsDeleting(true);
            await departmentalFrameworkService.deleteFramework(toDelete.id);
            toast.success('Framework deleted');
            setDeleteOpen(false);
            router.push('/work/departmental-frameworks');
        } catch (err) {
            toast.error('Failed to delete framework');
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white p-4">
                <Card className="w-full max-w-md border-indigo-200 shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full animate-pulse" />
                                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                    <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg text-foreground">Loading Framework</h3>
                                <p className="text-sm text-muted-foreground">
                                    Fetching framework details and strategic sections...
                                </p>
                            </div>
                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse" style={{ width: '60%' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!framework) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
                <p className="text-muted-foreground mb-6">The framework you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/departmental-frameworks')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Frameworks
                </Button>
            </div>
        );
    }

    const isApproved = framework.status === 'Approved';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/work/departmental-frameworks')}>
                    <ArrowLeft />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{framework.name}</h1>
                    <div
                        className="text-sm text-muted-foreground mt-1 leading-relaxed rich-text-content [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-2 [&_b]:font-semibold [&_strong]:font-semibold [&_br]:block"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(normalizeRichTextValue(framework.description)) }}
                    />
                    <div className="flex items-center gap-2 mt-3">
                        <Badge>{framework.status}</Badge>
                        <span className="text-sm text-muted-foreground">Version {framework.version}</span>
                        {framework.lastReviewed && <span className="text-sm text-muted-foreground"> • Reviewed {new Date(framework.lastReviewed).toLocaleDateString()}</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {canManage && (
                        <Button onClick={() => router.push(`/work/departmental-frameworks/${framework.id}/edit`)} className="w-40">
                            <Edit className="mr-2" /> Edit
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleExport} disabled={exporting} className="w-40">
                        <Download className="mr-2" /> {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    {canManage && (
                        <Button variant="ghost" onClick={handleNewVersion} className="w-40">
                            <FileText className="mr-2" /> New Version
                        </Button>
                    )}
                    {canManage && (
                        <Button
                            variant="secondary"
                            onClick={handleApproveClick}
                            disabled={approving || isApproved}
                            className="w-40"
                        >
                        {approving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isApproved ? 'Approved' : 'Approve'}
                            </>
                        )}
                        </Button>
                    )}
                    {canManage && (
                        <Button variant="destructive" onClick={() => openDelete(framework)} className="w-40">
                            <Trash2 className="mr-2" /> Delete
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-blue-200 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                            <CardTitle className="flex items-center"><Target className="mr-2" /> Strategic Sections</CardTitle>
                            <CardDescription>Core sections of this departmental framework</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {framework.sections.map((s: FrameworkSection) => (
                                    <Card key={s.id} className="border border-blue-100">
                                        <CardHeader>
                                            <CardTitle>{s.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div
                                                className="text-sm text-muted-foreground leading-relaxed rich-text-content [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-2 [&_b]:font-semibold [&_strong]:font-semibold [&_br]:block [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:bg-muted/50 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2"
                                                dangerouslySetInnerHTML={{ __html: sanitizeRichText(normalizeRichTextValue(s.content || '<p>No content</p>')) }}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                            <CardTitle><Calendar className="mr-2" /> Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div><strong>Department:</strong> {departments.find(d => d.id === framework.department)?.name || framework.department}</div>
                                <div><strong>Created By:</strong> {framework.createdBy || '—'}</div>
                                <div><strong>Created At:</strong> {framework.createdAt ? new Date(framework.createdAt).toLocaleDateString() : '—'}</div>
                                {framework.nextReview && <div><strong>Next Review:</strong> {new Date(framework.nextReview).toLocaleDateString()}</div>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" /> Approve Framework
                        </DialogTitle>
                        <DialogDescription>
                            Confirm the approval of this departmental framework. The framework will be marked as Approved and ready for implementation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-3 bg-green-50 rounded border border-green-100">
                            <p className="font-medium text-green-900">Framework to approve:</p>
                            <p className="text-sm text-green-700 mt-1">{framework.name}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border border-blue-100">
                            <p className="font-medium text-blue-900">Approving as:</p>
                            <p className="text-sm text-blue-700 mt-1">{currentUserName || 'Loading...'}</p>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="comments" className="text-sm font-medium">Approval Comments (Optional)</label>
                            <Textarea
                                id="comments"
                                value={approvalComments}
                                onChange={(e) => setApprovalComments(e.target.value)}
                                placeholder="Add any comments or notes for this approval..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={approving}>
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleApproveConfirm}
                            disabled={approving || !currentUserName}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {approving ? 'Approving...' : 'Approve Framework'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle /> Delete Framework
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the framework and all its sections.
                        </DialogDescription>
                    </DialogHeader>
                    {toDelete && (
                        <div className="space-y-4 mt-2">
                            <div className="p-3 bg-red-50 rounded border border-red-100">
                                <p className="font-medium text-red-900">Framework to delete</p>
                                <p className="text-sm text-red-700">{toDelete.name}</p>
                                <p className="text-xs text-red-600">ID: {toDelete.id}</p>
                            </div>
                            <div>
                                <p className="text-sm">Type <code className="bg-gray-100 px-2 py-1 rounded font-mono">DELETE {toDelete.id}</code> to confirm</p>
                                <Input
                                    className="mt-2"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder={`DELETE ${toDelete.id}`}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting || !toDelete || confirmText !== `DELETE ${toDelete?.id}`}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Framework'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </div>
    );
}
