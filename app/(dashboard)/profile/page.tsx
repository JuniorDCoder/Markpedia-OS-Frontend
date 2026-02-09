'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/hooks/use-toast';
import { ProfileData, profileService } from '@/services/profileService';
import ProfilePageClient from '@/components/sections/profile/ProfilePageClient';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, checkAuth } = useAuthStore();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await profileService.getProfile();
                setProfileData(data);
            } catch (error: any) {
                console.error('Failed to fetch profile:', error);
                toast({
                    title: "Error",
                    description: error.response?.data?.detail || "Failed to load profile data",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [toast]);

    const handleProfileUpdate = async (data: Partial<ProfileData>) => {
        try {
            const updated = await profileService.updateProfile(data);
            setProfileData(updated);
            // Update auth store with new name if changed
            if (data.first_name || data.last_name) {
                await checkAuth();
            }
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
            return true;
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to update profile",
                variant: "destructive",
            });
            return false;
        }
    };

    const handleAvatarUpload = async (file: File) => {
        try {
            const result = await profileService.uploadAvatar(file);
            setProfileData(prev => prev ? { ...prev, avatar: result.avatar_url } : prev);
            await checkAuth();
            toast({
                title: "Success",
                description: "Profile photo updated successfully",
            });
            return result.avatar_url;
        } catch (error: any) {
            console.error('Failed to upload avatar:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to upload photo",
                variant: "destructive",
            });
            return null;
        }
    };

    const handleAvatarDelete = async () => {
        try {
            await profileService.deleteAvatar();
            setProfileData(prev => prev ? { ...prev, avatar: undefined } : prev);
            await checkAuth();
            toast({
                title: "Success",
                description: "Profile photo removed",
            });
            return true;
        } catch (error: any) {
            console.error('Failed to delete avatar:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to remove photo",
                variant: "destructive",
            });
            return false;
        }
    };

    const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
        try {
            await profileService.changePassword({ current_password: currentPassword, new_password: newPassword });
            toast({
                title: "Success",
                description: "Password changed successfully",
            });
            return true;
        } catch (error: any) {
            console.error('Failed to change password:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to change password",
                variant: "destructive",
            });
            return false;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Failed to load profile data</p>
            </div>
        );
    }

    return (
        <ProfilePageClient
            profileData={profileData}
            onProfileUpdate={handleProfileUpdate}
            onAvatarUpload={handleAvatarUpload}
            onAvatarDelete={handleAvatarDelete}
            onPasswordChange={handlePasswordChange}
        />
    );
}