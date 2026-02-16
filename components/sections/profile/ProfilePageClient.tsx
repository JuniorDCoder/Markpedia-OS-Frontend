'use client';

import { useState, useRef } from 'react';
import { ProfileData } from '@/services/profileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    User as UserIcon,
    Briefcase,
    Shield,
    Edit3,
    Save,
    X,
    Camera,
    Trash2,
    Plus,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    Building2,
    Clock
} from 'lucide-react';

interface ProfilePageClientProps {
    profileData: ProfileData;
    onProfileUpdate: (data: Partial<ProfileData>) => Promise<boolean>;
    onAvatarUpload: (file: File) => Promise<string | null>;
    onAvatarDelete: () => Promise<boolean>;
    onPasswordChange: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export default function ProfilePageClient({
    profileData,
    onProfileUpdate,
    onAvatarUpload,
    onAvatarDelete,
    onPasswordChange
}: ProfilePageClientProps) {
    const [activeTab, setActiveTab] = useState('personal');
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Partial<ProfileData>>({});
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    const [skills, setSkills] = useState<string[]>(profileData.skills || []);
    const [newSkill, setNewSkill] = useState('');
    const [avatarCacheBuster, setAvatarCacheBuster] = useState(Date.now());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEdit = (section: string) => {
        setEditingSection(section);
        setEditedData({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            mobile: profileData.mobile,
            date_of_birth: profileData.date_of_birth,
            gender: profileData.gender,
            country: profileData.country,
            address: profileData.address,
            about: profileData.about,
            marital_status: profileData.marital_status,
        });
        setSkills(profileData.skills || []);
    };

    const handleSave = async (section: string) => {
        setSaving(true);
        const success = await onProfileUpdate({
            ...editedData,
            skills: skills
        });
        setSaving(false);
        if (success) {
            setEditingSection(null);
            setEditedData({});
        }
    };

    const handleCancel = () => {
        setEditingSection(null);
        setEditedData({});
        setSkills(profileData.skills || []);
    };

    const handleInputChange = (field: keyof ProfileData, value: string) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                return;
            }
            setUploadingAvatar(true);
            await onAvatarUpload(file);
            setAvatarCacheBuster(Date.now());
            setUploadingAvatar(false);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteAvatar = async () => {
        setUploadingAvatar(true);
        await onAvatarDelete();
        setUploadingAvatar(false);
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handlePasswordSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return;
        }
        if (passwordData.newPassword.length < 8) {
            return;
        }
        setChangingPassword(true);
        const success = await onPasswordChange(passwordData.currentPassword, passwordData.newPassword);
        setChangingPassword(false);
        if (success) {
            setShowPasswordDialog(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    };

    const getInitials = () => {
        return `${profileData.first_name?.charAt(0) || ''}${profileData.last_name?.charAt(0) || ''}`.toUpperCase();
    };

    const getApiUrl = () => {
        // Return empty string so avatar paths stay relative (served through proxy)
        return '';
    };

    const getAvatarUrl = () => {
        if (!profileData.avatar) return null;
        // If it's already a full URL, return as is
        if (profileData.avatar.startsWith('http')) return profileData.avatar;
        // Otherwise, prepend the API URL and add cache-busting to force reload after upload
        return `${getApiUrl()}${profileData.avatar}?t=${avatarCacheBuster}`;
    };

    return (
        <div className="container mx-auto py-6 space-y-6 px-4 md:px-6">
            {/* Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <Avatar className="w-24 h-24 md:w-32 md:h-32">
                                <AvatarImage src={getAvatarUrl() || undefined} alt={`${profileData.first_name} ${profileData.last_name}`} />
                                <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-red-100 to-red-200 text-red-600">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                            />
                            <div className="absolute -bottom-2 -right-2 flex gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full w-8 h-8 p-0 bg-white"
                                    onClick={handleAvatarClick}
                                    disabled={uploadingAvatar}
                                >
                                    {uploadingAvatar ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4" />
                                    )}
                                </Button>
                                {profileData.avatar && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full w-8 h-8 p-0 bg-white text-red-500 hover:text-red-600"
                                        onClick={handleDeleteAvatar}
                                        disabled={uploadingAvatar}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {profileData.first_name} {profileData.last_name}
                            </h1>
                            <p className="text-muted-foreground text-lg">{profileData.position || profileData.role}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                                <Badge variant="outline" className="gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {profileData.department || 'No Department'}
                                </Badge>
                                <Badge variant={profileData.is_active ? 'default' : 'secondary'} className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    {profileData.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                {profileData.employment_type && (
                                    <Badge variant="outline" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {profileData.employment_type}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {profileData.email}
                                </span>
                                {profileData.mobile && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {profileData.mobile}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 md:w-auto md:inline-flex">
                    <TabsTrigger value="personal" className="gap-2">
                        <UserIcon className="h-4 w-4 hidden sm:inline" />
                        Personal
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="gap-2">
                        <Briefcase className="h-4 w-4 hidden sm:inline" />
                        Professional
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4 hidden sm:inline" />
                        Security
                    </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                {editingSection === 'personal' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSave('personal')} disabled={saving}>
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-1" />
                                            )}
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleEdit('personal')}>
                                        <Edit3 className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={editingSection === 'personal' ? editedData.first_name || '' : profileData.first_name}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                        readOnly={editingSection !== 'personal'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={editingSection === 'personal' ? editedData.last_name || '' : profileData.last_name}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                        readOnly={editingSection !== 'personal'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={profileData.email} readOnly disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile</Label>
                                    <Input
                                        value={editingSection === 'personal' ? editedData.mobile || '' : profileData.mobile || ''}
                                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                                        readOnly={editingSection !== 'personal'}
                                        placeholder="e.g., +237 6 12 34 56 78"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={editingSection === 'personal' ? editedData.date_of_birth || '' : profileData.date_of_birth || ''}
                                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                        readOnly={editingSection !== 'personal'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    {editingSection === 'personal' ? (
                                        <Select
                                            value={editedData.gender || ''}
                                            onValueChange={(value) => handleInputChange('gender', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            value={profileData.gender || ''}
                                            readOnly
                                            className="capitalize"
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Input
                                        value={editingSection === 'personal' ? editedData.country || '' : profileData.country || ''}
                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                        readOnly={editingSection !== 'personal'}
                                        placeholder="e.g., Cameroon"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Marital Status</Label>
                                    {editingSection === 'personal' ? (
                                        <Select
                                            value={editedData.marital_status || ''}
                                            onValueChange={(value) => handleInputChange('marital_status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="single">Single</SelectItem>
                                                <SelectItem value="married">Married</SelectItem>
                                                <SelectItem value="divorced">Divorced</SelectItem>
                                                <SelectItem value="widowed">Widowed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            value={profileData.marital_status || ''}
                                            readOnly
                                            className="capitalize"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Address
                                </h4>
                                <div className="space-y-2">
                                    <Textarea
                                        value={editingSection === 'personal' ? editedData.address || '' : profileData.address || ''}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        readOnly={editingSection !== 'personal'}
                                        placeholder="Enter your full address"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* About */}
                            <div className="space-y-4">
                                <h4 className="font-medium">About Me</h4>
                                <Textarea
                                    value={editingSection === 'personal' ? editedData.about || '' : profileData.about || ''}
                                    onChange={(e) => handleInputChange('about', e.target.value)}
                                    readOnly={editingSection !== 'personal'}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Professional Information Tab */}
                <TabsContent value="professional" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Professional Details
                            </CardTitle>
                            <CardDescription>Your work-related information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input value={profileData.role} readOnly disabled className="bg-muted capitalize" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input value={profileData.position || '-'} readOnly disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input value={profileData.department || '-'} readOnly disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        value={profileData.start_date ? new Date(profileData.start_date).toLocaleDateString() : '-'}
                                        readOnly
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Employment Type</Label>
                                    <Input
                                        value={profileData.employment_type || '-'}
                                        readOnly
                                        disabled
                                        className="bg-muted capitalize"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Member Since</Label>
                                    <Input
                                        value={new Date(profileData.created_at).toLocaleDateString()}
                                        readOnly
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Skills</h4>
                                    {editingSection === 'personal' && (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                placeholder="Add a skill"
                                                className="w-40"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                            />
                                            <Button size="sm" variant="outline" onClick={handleAddSkill}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(editingSection === 'personal' ? skills : profileData.skills || []).length > 0 ? (
                                        (editingSection === 'personal' ? skills : profileData.skills || []).map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="gap-1">
                                                {skill}
                                                {editingSection === 'personal' && (
                                                    <X
                                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                    />
                                                )}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No skills added yet</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Manage your account security</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Password Change */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                        <h4 className="font-medium">Password</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Change your password to keep your account secure
                                    </p>
                                </div>
                                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Change Password</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                            <DialogDescription>
                                                Enter your current password and a new password to update your credentials.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="currentPassword"
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        placeholder="Enter current password"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        placeholder="Enter new password"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                                                    <p className="text-xs text-destructive">Password must be at least 8 characters</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    placeholder="Confirm new password"
                                                />
                                                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                                    <p className="text-xs text-destructive">Passwords do not match</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowPasswordDialog(false);
                                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handlePasswordSubmit}
                                                disabled={
                                                    changingPassword ||
                                                    !passwordData.currentPassword ||
                                                    !passwordData.newPassword ||
                                                    passwordData.newPassword !== passwordData.confirmPassword ||
                                                    passwordData.newPassword.length < 8
                                                }
                                            >
                                                {changingPassword ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Changing...
                                                    </>
                                                ) : (
                                                    'Change Password'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Account Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Account Information</h4>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">Account Created</span>
                                        </div>
                                        <p className="font-medium">
                                            {new Date(profileData.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-sm">Account Status</span>
                                        </div>
                                        <Badge variant={profileData.is_active ? 'default' : 'destructive'}>
                                            {profileData.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
