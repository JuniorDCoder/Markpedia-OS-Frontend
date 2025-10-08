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
    Eye,
    Menu
} from 'lucide-react';

interface ProfileClientProps {
    currentUser: User;
    profile: UserProfile;
}

export default function ProfileClient({ currentUser, profile }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState('personal');
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Partial<UserProfile>>({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleEdit = (section: string) => {
        setEditingSection(section);
        setEditedData(prev => ({
            ...prev,
            [section]: profile[section as keyof UserProfile]
        }));
    };

    const handleSave = (section: string) => {
        console.log(`Saving ${section}:`, editedData[section as keyof UserProfile]);
        setEditingSection(null);
        setEditedData(prev => {
            const newData = { ...prev };
            delete newData[section as keyof UserProfile];
            return newData;
        });
    };

    const handleCancel = (section: string) => {
        setEditingSection(null);
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
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <UserIcon className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        {profile.canEdit && (
                            editingSection === 'personalInfo' ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSave('personalInfo')} className="text-xs sm:text-sm">
                                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleCancel('personalInfo')} className="text-xs sm:text-sm">
                                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('personalInfo')} className="text-xs sm:text-sm">
                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Edit
                                </Button>
                            )
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Photo and Basic Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                        <div className="relative self-center sm:self-auto">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                                {data.photo ? (
                                    <img src={data.photo} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
                                ) : (
                                    <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-red-600" />
                                )}
                            </div>
                            {editingSection === 'personalInfo' && (
                                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0">
                                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex-1 w-full grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={data.firstName}
                                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={data.lastName}
                                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile" className="text-sm">Mobile</Label>
                                <Input
                                    id="mobile"
                                    value={data.mobile}
                                    onChange={(e) => handleInputChange('personalInfo', 'mobile', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-base sm:text-lg">
                            <MapPin className="h-4 w-4" />
                            Address
                        </h4>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="street" className="text-sm">Street</Label>
                                <Input
                                    id="street"
                                    value={data.address.street}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'street', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm">City</Label>
                                <Input
                                    id="city"
                                    value={data.address.city}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'city', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region" className="text-sm">Region</Label>
                                <Input
                                    id="region"
                                    value={data.address.region}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'region', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode" className="text-sm">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    value={data.address.postalCode}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'postalCode', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-base sm:text-lg">
                            <Phone className="h-4 w-4" />
                            Emergency Contact
                        </h4>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyName" className="text-sm">Name</Label>
                                <Input
                                    id="emergencyName"
                                    value={data.emergencyContact.name}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'name', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyRelationship" className="text-sm">Relationship</Label>
                                <Input
                                    id="emergencyRelationship"
                                    value={data.emergencyContact.relationship}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'relationship', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyMobile" className="text-sm">Mobile</Label>
                                <Input
                                    id="emergencyMobile"
                                    value={data.emergencyContact.mobile}
                                    onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'mobile', e.target.value)}
                                    readOnly={editingSection !== 'personalInfo'}
                                    className="text-sm sm:text-base"
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
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Briefcase className="h-5 w-5" />
                            Professional Information
                        </CardTitle>
                        {profile.canEdit && (
                            editingSection === 'professionalInfo' ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSave('professionalInfo')} className="text-xs sm:text-sm">
                                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleCancel('professionalInfo')} className="text-xs sm:text-sm">
                                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('professionalInfo')} className="text-xs sm:text-sm">
                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Edit
                                </Button>
                            )
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Professional Info */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="position" className="text-sm">Position</Label>
                            <Input
                                id="position"
                                value={data.position}
                                onChange={(e) => handleInputChange('professionalInfo', 'position', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                                className="text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-sm">Department</Label>
                            <Input
                                id="department"
                                value={data.department}
                                onChange={(e) => handleInputChange('professionalInfo', 'department', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                                className="text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeId" className="text-sm">Employee ID</Label>
                            <Input
                                id="employeeId"
                                value={data.employeeId}
                                onChange={(e) => handleInputChange('professionalInfo', 'employeeId', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                                className="text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade" className="text-sm">Grade</Label>
                            <Input
                                id="grade"
                                value={data.grade}
                                onChange={(e) => handleInputChange('professionalInfo', 'grade', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                                className="text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contractType" className="text-sm">Contract Type</Label>
                            <Input
                                id="contractType"
                                value={data.contractType}
                                onChange={(e) => handleInputChange('professionalInfo', 'contractType', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                                className="text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={data.startDate}
                                onChange={(e) => handleInputChange('professionalInfo', 'startDate', e.target.value)}
                                readOnly={editingSection !== 'professionalInfo'}
                                className="text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* KPIs */}
                    <div>
                        <h4 className="font-medium mb-3 text-base sm:text-lg">Key Performance Indicators</h4>
                        <div className="space-y-3">
                            {data.kpis.map((kpi) => (
                                <div key={kpi.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-2 sm:gap-0">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm sm:text-base">{kpi.name}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">{kpi.period}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-sm sm:text-base">
                                            {kpi.current} / {kpi.target} {kpi.unit}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                            {Math.round((kpi.current / kpi.target) * 100)}% achieved
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* OKRs */}
                    <div>
                        <h4 className="font-medium mb-3 text-base sm:text-lg">Objectives & Key Results</h4>
                        <div className="space-y-4">
                            {data.okrs.map((okr) => (
                                <div key={okr.id} className="p-3 sm:p-4 border rounded-lg">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                                        <div className="font-medium text-sm sm:text-base flex-1">{okr.objective}</div>
                                        <Badge variant="outline" className="text-xs sm:text-sm">{okr.progress}% Complete</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {okr.keyResults.map((kr) => (
                                            <div key={kr.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm gap-1 sm:gap-0">
                                                <span className="flex-1">{kr.description}</span>
                                                <span className="text-muted-foreground text-xs sm:text-sm">
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
                        <h4 className="font-medium mb-3 text-base sm:text-lg">Last Performance Review</h4>
                        <div className="p-3 sm:p-4 border rounded-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                                <div className="font-medium text-sm sm:text-base">Rating: {data.lastReview.rating}/5</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                    {new Date(data.lastReview.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                                Reviewer: {data.lastReview.reviewer}
                            </div>
                            <p className="text-xs sm:text-sm">{data.lastReview.comments}</p>
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
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <CreditCard className="h-5 w-5" />
                            Financial Information
                        </CardTitle>
                        {profile.canEdit && (
                            editingSection === 'financialInfo' ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSave('financialInfo')} className="text-xs sm:text-sm">
                                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleCancel('financialInfo')} className="text-xs sm:text-sm">
                                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit('financialInfo')} className="text-xs sm:text-sm">
                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Edit
                                </Button>
                            )
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Bank Account */}
                    <div>
                        <h4 className="font-medium mb-3 text-base sm:text-lg">Bank Account</h4>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="bankAccount" className="text-sm">Account Number</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="bankAccount"
                                        value={data.bankAccount.tokenized}
                                        onChange={(e) => handleNestedInputChange('financialInfo', 'bankAccount', 'tokenized', e.target.value)}
                                        readOnly={editingSection !== 'financialInfo'}
                                        type="password"
                                        className="text-sm sm:text-base"
                                    />
                                    <Button size="sm" variant="outline" className="shrink-0">
                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankName" className="text-sm">Bank Name</Label>
                                <Input
                                    id="bankName"
                                    value={data.bankAccount.bankName}
                                    onChange={(e) => handleNestedInputChange('financialInfo', 'bankAccount', 'bankName', e.target.value)}
                                    readOnly={editingSection !== 'financialInfo'}
                                    className="text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Money */}
                    <div>
                        <h4 className="font-medium mb-3 text-base sm:text-lg">Mobile Money</h4>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="mobileMoney" className="text-sm">Phone Number</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="mobileMoney"
                                        value={data.mobileMoney.tokenized}
                                        onChange={(e) => handleNestedInputChange('financialInfo', 'mobileMoney', 'tokenized', e.target.value)}
                                        readOnly={editingSection !== 'financialInfo'}
                                        type="password"
                                        className="text-sm sm:text-base"
                                    />
                                    <Button size="sm" variant="outline" className="shrink-0">
                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provider" className="text-sm">Provider</Label>
                                <Input
                                    id="provider"
                                    value={data.mobileMoney.provider}
                                    onChange={(e) => handleNestedInputChange('financialInfo', 'mobileMoney', 'provider', e.target.value)}
                                    readOnly={editingSection !== 'financialInfo'}
                                    className="text-sm sm:text-base"
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
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <FileText className="h-5 w-5" />
                        Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {profile.documents.map((doc) => (
                            <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0">
                                <div className="flex items-center gap-3 flex-1">
                                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <div className="font-medium text-sm sm:text-base truncate">{doc.name}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedBy}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end sm:self-auto">
                                    <Button size="sm" variant="outline" className="text-xs">
                                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Download
                                    </Button>
                                    {profile.canEdit && (
                                        <Button size="sm" variant="outline" className="text-red-600 text-xs">
                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {profile.canEdit && (
                        <Button className="mt-4 w-full sm:w-auto">
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
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Award className="h-5 w-5" />
                        Skills & Certifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {profile.skills.map((skill) => (
                            <div key={skill.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm sm:text-base">{skill.name}</div>
                                    <div className="text-xs sm:text-sm text-muted-foreground capitalize">
                                        {skill.category} • {skill.level}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    {skill.verified ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending
                                        </Badge>
                                    )}
                                    {profile.canEdit && (
                                        <Button size="sm" variant="outline" className="text-xs">
                                            <Edit3 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {profile.canEdit && (
                        <Button className="mt-4 w-full sm:w-auto">
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
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Shield className="h-5 w-5" />
                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 2FA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 sm:gap-0">
                        <div className="flex-1">
                            <div className="font-medium text-sm sm:text-base">Two-Factor Authentication</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                                {data.twoFactorEnabled
                                    ? `Enabled (${data.twoFactorMethod})`
                                    : 'Not enabled'
                                }
                            </div>
                        </div>
                        <Button variant={data.twoFactorEnabled ? "outline" : "default"} className="w-full sm:w-auto mt-2 sm:mt-0">
                            {data.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                        </Button>
                    </div>

                    {/* Trusted Devices */}
                    <div>
                        <h4 className="font-medium mb-3 text-base sm:text-lg">Trusted Devices</h4>
                        <div className="space-y-3">
                            {data.trustedDevices.map((device) => (
                                <div key={device.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm sm:text-base">{device.name}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                            Last used {new Date(device.lastUsed).toLocaleDateString()} • {device.location}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-red-600 text-xs self-end sm:self-auto">
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Login History */}
                    <div>
                        <h4 className="font-medium mb-3 text-base sm:text-lg">Recent Login Activity</h4>
                        <div className="space-y-2">
                            {data.loginHistory.map((login) => (
                                <div key={login.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 text-xs sm:text-sm gap-2 sm:gap-0">
                                    <div className="flex-1">
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

    // Mobile tabs dropdown
    const MobileTabsDropdown = () => (
        <div className="sm:hidden relative">
            <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <span className="capitalize">
                    {activeTab === 'personal' && 'Personal Information'}
                    {activeTab === 'professional' && 'Professional Information'}
                    {activeTab === 'financial' && 'Financial Information'}
                    {activeTab === 'documents' && 'Documents'}
                    {activeTab === 'skills' && 'Skills & Certifications'}
                    {activeTab === 'security' && 'Security'}
                </span>
                <Menu className="h-4 w-4" />
            </Button>
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                    {['personal', 'professional', 'financial', 'documents', 'skills', 'security'].map((tab) => (
                        <button
                            key={tab}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                activeTab === tab ? 'bg-red-50 text-red-600' : ''
                            }`}
                            onClick={() => {
                                setActiveTab(tab);
                                setMobileMenuOpen(false);
                            }}
                        >
                            <span className="capitalize">
                                {tab === 'personal' && 'Personal Information'}
                                {tab === 'professional' && 'Professional Information'}
                                {tab === 'financial' && 'Financial Information'}
                                {tab === 'documents' && 'Documents'}
                                {tab === 'skills' && 'Skills & Certifications'}
                                {tab === 'security' && 'Security'}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-red-600" />
                        My Profile
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Manage your personal and professional information
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none text-xs sm:text-sm">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Export Profile
                    </Button>
                </div>
            </div>

            {/* Profile Overview */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shrink-0">
                            {profile.personalInfo.photo ? (
                                <img
                                    src={profile.personalInfo.photo}
                                    alt="Profile"
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold">
                                {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                            </h2>
                            <p className="text-muted-foreground text-sm sm:text-base">{profile.professionalInfo.position}</p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center justify-center sm:justify-start gap-1">
                                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="truncate">{profile.personalInfo.email}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-1">
                                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>{profile.personalInfo.mobile}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-1">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>Member since {new Date(profile.professionalInfo.startDate).getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Active
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="space-y-6">
                {/* Mobile Dropdown */}
                <MobileTabsDropdown />

                {/* Desktop Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 p-1 bg-muted/50">
                        <TabsTrigger value="personal" className="text-xs px-2 py-2">
                            Personal
                        </TabsTrigger>
                        <TabsTrigger value="professional" className="text-xs px-2 py-2">
                            Professional
                        </TabsTrigger>
                        <TabsTrigger value="financial" className="text-xs px-2 py-2">
                            Financial
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="text-xs px-2 py-2">
                            Documents
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="text-xs px-2 py-2">
                            Skills
                        </TabsTrigger>
                        <TabsTrigger value="security" className="text-xs px-2 py-2">
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="mt-6">
                        <PersonalInfoSection />
                    </TabsContent>

                    <TabsContent value="professional" className="mt-6">
                        <ProfessionalInfoSection />
                    </TabsContent>

                    <TabsContent value="financial" className="mt-6">
                        <FinancialInfoSection />
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                        <DocumentsSection />
                    </TabsContent>

                    <TabsContent value="skills" className="mt-6">
                        <SkillsSection />
                    </TabsContent>

                    <TabsContent value="security" className="mt-6">
                        <SecuritySection />
                    </TabsContent>
                </Tabs>

                {/* Mobile Content */}
                <div className="sm:hidden">
                    {activeTab === 'personal' && <PersonalInfoSection />}
                    {activeTab === 'professional' && <ProfessionalInfoSection />}
                    {activeTab === 'financial' && <FinancialInfoSection />}
                    {activeTab === 'documents' && <DocumentsSection />}
                    {activeTab === 'skills' && <SkillsSection />}
                    {activeTab === 'security' && <SecuritySection />}
                </div>
            </div>
        </div>
    );
}