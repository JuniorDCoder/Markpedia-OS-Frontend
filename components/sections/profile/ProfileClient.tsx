'use client';

import { useState } from 'react';
import { User } from '@/types/chat';
import { UserProfile, PersonalInfo, ProfessionalInfo, FinancialInfo, SecurityInfo, Skill, Document } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User as UserIcon,
    Briefcase,
    CreditCard,
    Shield,
    FileText,
    Award,
    Edit3,
    Save,
    X,
    Camera,
    Download,
    Trash2,
    Plus,
    CheckCircle,
    Clock,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Lock,
    Eye
} from 'lucide-react';

interface ProfileClientProps {
    currentUser: User;
    profile: UserProfile;
}

export default function ProfileClient({ currentUser, profile }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState('personal');
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Partial<UserProfile>>({});

    const handleEdit = (section: string) => {
        setEditingSection(section);
        // Initialize edited data with current profile data
        setEditedData(prev => ({
            ...prev,
            [section]: profile[section as keyof UserProfile]
        }));
    };

    const handleSave = (section: string) => {
        // In a real app, you would save to the backend here
        console.log(`Saving ${section}:`, editedData[section as keyof UserProfile]);
        setEditingSection(null);
        // Reset edited data for this section
        setEditedData(prev => {
            const newData = { ...prev };
            delete newData[section as keyof UserProfile];
            return newData;
        });
    };

    const handleCancel = (section: string) => {
        setEditingSection(null);
        // Remove edited data for this section
        setEditedData(prev => {
            const newData = { ...prev };
            delete newData[section as keyof UserProfile];
            return newData;
        });
    };

    const handleInputChange = (section: string, field: string, value: any) => {
        setEditedData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof UserProfile] as any),
                [field]: value
            }
        }));
    };

    const handleNestedInputChange = (section: string, parent: string, field: string, value: any) => {
        setEditedData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof UserProfile] as any),
                [parent]: {
                    ...(prev[section as keyof UserProfile] as any)?.[parent],
                    [field]: value
                }
            }
        }));
    };

    const PersonalInfoSection = () => {
        const data = editingSection === 'personalInfo'
            ? (editedData.personalInfo as PersonalInfo)
            : profile.personalInfo;

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        {profile.canEdit && (
                            editingSection === 'personalInfo' ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSave('personalInfo')}>
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleCancel('personalInfo')}>
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('personalInfo')}>
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Photo and Basic Info */}
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                                {data.photo ? (
                                    <img src={data.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                                ) : (
                                    <UserIcon className="h-12 w-12 text-red-600" />
                                )}
                            </div>
                            {editingSection === 'personalInfo' && (
                                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                                    <Camera className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex-1 grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={data.firstName}
                                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={data.lastName}
                                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="mobile">Mobile</Label>
                                <Input
                                    id="mobile"
                                    value={data.mobile}
                                    onChange={(e) => handleInputChange('personalInfo', 'mobile', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Address
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="street">Street</Label>
                                <Input
                                    id="street"
                                    value={data.address.street}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'street', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={data.address.city}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'city', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="region">Region</Label>
                                <Input
                                    id="region"
                                    value={data.address.region}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'region', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    value={data.address.postalCode}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'postalCode', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Emergency Contact
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="emergencyName">Name</Label>
                                <Input
                                    id="emergencyName"
                                    value={data.emergencyContact.name}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'name', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emergencyRelationship">Relationship</Label>
                                <Input
                                    id="emergencyRelationship"
                                    value={data.emergencyContact.relationship}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'relationship', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emergencyMobile">Mobile</Label>
                                <Input
                                    id="emergencyMobile"
                                    value={data.emergencyContact.mobile}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'mobile', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const ProfessionalInfoSection = () => {
        const data = editingSection === 'professionalInfo'
            ? (editedData.professionalInfo as ProfessionalInfo)
            : profile.professionalInfo;

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Professional Information
                        </CardTitle>
                        {profile.canEdit && (
                            editingSection === 'professionalInfo' ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSave('professionalInfo')}>
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleCancel('professionalInfo')}>
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('professionalInfo')}>
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Professional Info */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                value={data.position}
                                onChange={(e) => handleInputChange('professionalInfo', 'position', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                            />
                        </div>
                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={data.department}
                                onChange={(e) => handleInputChange('professionalInfo', 'department', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                            />
                        </div>
                        <div>
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                value={data.employeeId}
                                onChange={(e) => handleInputChange('professionalInfo', 'employeeId', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                            />
                        </div>
                        <div>
                            <Label htmlFor="grade">Grade</Label>
                            <Input
                                id="grade"
                                value={data.grade}
                                onChange={(e) => handleInputChange('professionalInfo', 'grade', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                            />
                        </div>
                        <div>
                            <Label htmlFor="contractType">Contract Type</Label>
                            <Input
                                id="contractType"
                                value={data.contractType}
                                onChange={(e) => handleInputChange('professionalInfo', 'contractType', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                            />
                        </div>
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={data.startDate}
                                onChange={(e) => handleInputChange('professionalInfo', 'startDate', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                            />
                        </div>
                    </div>

                    {/* KPIs */}
                    <div>
                        <h4 className="font-medium mb-3">Key Performance Indicators</h4>
                        <div className="space-y-3">
                            {data.kpis.map((kpi) => (
                                <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{kpi.name}</div>
                                        <div className="text-sm text-muted-foreground">{kpi.period}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {kpi.current} / {kpi.target} {kpi.unit}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {Math.round((kpi.current / kpi.target) * 100)}% achieved
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* OKRs */}
                    <div>
                        <h4 className="font-medium mb-3">Objectives & Key Results</h4>
                        <div className="space-y-4">
                            {data.okrs.map((okr) => (
                                <div key={okr.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-medium">{okr.objective}</div>
                                        <Badge variant="outline">{okr.progress}% Complete</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {okr.keyResults.map((kr) => (
                                            <div key={kr.id} className="flex items-center justify-between text-sm">
                                                <span>{kr.description}</span>
                                                <span className="text-muted-foreground">
                          {kr.current} / {kr.target} {kr.unit}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Last Review */}
                    <div>
                        <h4 className="font-medium mb-3">Last Performance Review</h4>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">Rating: {data.lastReview.rating}/5</div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(data.lastReview.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                                Reviewer: {data.lastReview.reviewer}
                            </div>
                            <p className="text-sm">{data.lastReview.comments}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const FinancialInfoSection = () => {
        const data = editingSection === 'financialInfo'
            ? (editedData.financialInfo as FinancialInfo)
            : profile.financialInfo;

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Financial Information
                        </CardTitle>
                        {profile.canEdit && (
                            editingSection === 'financialInfo' ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSave('financialInfo')}>
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleCancel('financialInfo')}>
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('financialInfo')}>
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Bank Account */}
                    <div>
                        <h4 className="font-medium mb-3">Bank Account</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="bankAccount">Account Number</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="bankAccount"
                                        value={data.bankAccount.tokenized}
                                        onChange={(e) => handleNestedInputChange('financialInfo', 'bankAccount', 'tokenized', e.target.value)}
                                        readOnly={editingSection !== 'financialInfo'}
                                        type="password"
                                    />
                                    <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Input
                                    id="bankName"
                                    value={data.bankAccount.bankName}
                                    onChange={(e) => handleNestedInputChange('financialInfo', 'bankAccount', 'bankName', e.target.value)}
                                    readOnly={editingSection !== 'financialInfo'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Money */}
                    <div>
                        <h4 className="font-medium mb-3">Mobile Money</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="mobileMoney">Phone Number</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="mobileMoney"
                                        value={data.mobileMoney.tokenized}
                                        onChange={(e) => handleNestedInputChange('financialInfo', 'mobileMoney', 'tokenized', e.target.value)}
                                        readOnly={editingSection !== 'financialInfo'}
                                        type="password"
                                    />
                                    <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="provider">Provider</Label>
                                <Input
                                    id="provider"
                                    value={data.mobileMoney.provider}
                                    onChange={(e) => handleNestedInputChange('financialInfo', 'mobileMoney', 'provider', e.target.value)}
                                    readOnly={editingSection !== 'financialInfo'}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const DocumentsSection = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {profile.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{doc.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedBy}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                    {profile.canEdit && (
                                        <Button size="sm" variant="outline" className="text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {profile.canEdit && (
                        <Button className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Document
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    };

    const SkillsSection = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Skills & Certifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {profile.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">{skill.name}</div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                        {skill.category} • {skill.level}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {skill.verified ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending
                                        </Badge>
                                    )}
                                    {profile.canEdit && (
                                        <Button size="sm" variant="outline">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {profile.canEdit && (
                        <Button className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Skill
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    };

    const SecuritySection = () => {
        const data = profile.securityInfo;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 2FA */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-muted-foreground">
                                {data.twoFactorEnabled
                                    ? `Enabled (${data.twoFactorMethod})`
                                    : 'Not enabled'
                                }
                            </div>
                        </div>
                        <Button variant={data.twoFactorEnabled ? "outline" : "default"}>
                            {data.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                        </Button>
                    </div>

                    {/* Trusted Devices */}
                    <div>
                        <h4 className="font-medium mb-3">Trusted Devices</h4>
                        <div className="space-y-3">
                            {data.trustedDevices.map((device) => (
                                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{device.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Last used {new Date(device.lastUsed).toLocaleDateString()} • {device.location}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Login History */}
                    <div>
                        <h4 className="font-medium mb-3">Recent Login Activity</h4>
                        <div className="space-y-2">
                            {data.loginHistory.map((login) => (
                                <div key={login.id} className="flex items-center justify-between p-2 text-sm">
                                    <div>
                                        <div className="font-medium">{login.device}</div>
                                        <div className="text-muted-foreground">{login.location} • {login.ip}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={login.success ? 'text-green-600' : 'text-red-600'}>
                                            {login.success ? 'Success' : 'Failed'}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {new Date(login.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <UserIcon className="h-8 w-8 mr-3 text-red-600" />
                        My Profile
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your personal and professional information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Profile
                    </Button>
                </div>
            </div>

            {/* Profile Overview */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                            {profile.personalInfo.photo ? (
                                <img
                                    src={profile.personalInfo.photo}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-10 w-10 text-red-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">
                                {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                            </h2>
                            <p className="text-muted-foreground">{profile.professionalInfo.position}</p>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {profile.personalInfo.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {profile.personalInfo.mobile}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Member since {new Date(profile.professionalInfo.startDate).getFullYear()}
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Active
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                    <PersonalInfoSection />
                </TabsContent>

                <TabsContent value="professional">
                    <ProfessionalInfoSection />
                </TabsContent>

                <TabsContent value="financial">
                    <FinancialInfoSection />
                </TabsContent>

                <TabsContent value="documents">
                    <DocumentsSection />
                </TabsContent>

                <TabsContent value="skills">
                    <SkillsSection />
                </TabsContent>

                <TabsContent value="security">
                    <SecuritySection />
                </TabsContent>
            </Tabs>
        </div>
    );
}