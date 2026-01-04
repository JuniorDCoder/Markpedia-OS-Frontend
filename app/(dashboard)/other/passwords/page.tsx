'use client';

import { useState, useEffect } from 'react';
import { PasswordEntry } from '@/lib/api/passwords';
import { PasswordList } from '@/components/sections/passwords/PasswordList';
import { PasswordForm } from '@/components/sections/passwords/PasswordForm';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { LockScreen } from '@/components/sections/passwords/LockScreen';
import { ChangeMasterPasswordDialog } from '@/components/sections/passwords/ChangeMasterPasswordDialog';
import { usePasswordStore } from '@/lib/stores/password-store';

export default function PasswordsPage() {
    // State is now managed by the store
    const {
        isLocked,
        checkInactivity,
        updateActivity,
        lock,
        decryptedPasswords,
        addPassword,
        updatePassword,
        deletePassword
    } = usePasswordStore();

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPassword, setEditingPassword] = useState<PasswordEntry | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [passwordToDelete, setPasswordToDelete] = useState<PasswordEntry | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Inactivity check effect
    useEffect(() => {
        const interval = setInterval(() => {
            checkInactivity(5); // 5 minutes timeout
        }, 1000 * 60); // Check every minute

        const handleActivity = () => updateActivity();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);

        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            lock(); // Lock on exit
        };
    }, []);

    const handleCreate = () => {
        setEditingPassword(undefined);
        setIsSheetOpen(true);
    };

    const handleEdit = (password: PasswordEntry) => {
        setEditingPassword(password);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (password: PasswordEntry) => {
        setPasswordToDelete(password);
        setDeleteDialogOpen(true);
        setDeleteConfirmationText('');
    };

    const handleDeleteConfirm = async () => {
        if (!passwordToDelete) return;

        const expectedText = `DELETE ${passwordToDelete.title}`;
        if (deleteConfirmationText !== expectedText) {
            toast.error(`Type "${expectedText}" to confirm`);
            return;
        }

        try {
            setIsDeleting(true);
            await deletePassword(passwordToDelete.id);
            toast.success('Password deleted successfully.');
            setDeleteDialogOpen(false);
            setPasswordToDelete(null);
        } catch (error) {
            toast.error('Failed to delete password.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingPassword) {
                await updatePassword(editingPassword.id, data);
                toast.success('Password updated successfully.');
            } else {
                await addPassword(data);
                toast.success('Password created successfully.');
            }
            setIsSheetOpen(false);
        } catch (error) {
            toast.error('Failed to save password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLocked) {
        return <LockScreen />;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Password
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the password entry
                        "{passwordToDelete?.title}" from your vault.
                        <br /><br />
                        To confirm deletion, type: <code className="bg-muted px-2 py-1 rounded text-xs font-mono">DELETE {passwordToDelete?.title}</code>
                    </DialogDescription>

                    <div className="mt-4">
                        <Input
                            placeholder={`DELETE ${passwordToDelete?.title}`}
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            disabled={isDeleting}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setDeleteConfirmationText('');
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting || deleteConfirmationText !== `DELETE ${passwordToDelete?.title}`}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Passwords</h2>
                    <p className="text-muted-foreground">
                        Manage your secure credentials and notes.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <ChangeMasterPasswordDialog />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Password
                    </Button>
                </div>
            </div>

            <PasswordList
                passwords={decryptedPasswords}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-[540px]">
                    <SheetHeader>
                        <SheetTitle>{editingPassword ? 'Edit Password' : 'Add Password'}</SheetTitle>
                        <SheetDescription>
                            {editingPassword
                                ? 'Make changes to your password entry here.'
                                : 'Add a new password entry to your vault.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        <PasswordForm
                            defaultValues={editingPassword}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            buttonText={editingPassword ? 'Update Password' : 'Save Password'}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

