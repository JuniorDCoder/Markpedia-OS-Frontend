'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { Organization } from "@/types/settings";
import { ArrowLeft, Save, Building, Globe, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrganizationEditClient({ organization, user }: { organization: Organization; user: User }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: organization.name,
        legalName: organization.legalName,
        registrationNumber: organization.registrationNumber,
        taxId: organization.taxId,
        industry: organization.industry,
        size: organization.size,
        foundedYear: organization.foundedYear,
        website: organization.website || '',
        phone: organization.phone,
        email: organization.email,
        timezone: organization.timezone,
        fiscalYearStart: organization.fiscalYearStart
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/settings/organization', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update organization');

            toast.success('Organization details updated successfully');
            router.push('/settings');
        } catch (error) {
            toast.error('Failed to update organization details');
        } finally {
            setIsLoading(false);
        }
    };

    const industries = [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
        'Retail', 'Hospitality', 'Construction', 'Transportation', 'Energy'
    ];

    const timezones = [
        'Africa/Douala', 'Africa/Lagos', 'Africa/Johannesburg', 'Europe/London',
        'Europe/Paris', 'America/New_York', 'Asia/Dubai', 'Asia/Shanghai'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/settings">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                        <p className="text-muted-foreground mt-1">Update your company information and details</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Company Information
                                </CardTitle>
                                <CardDescription>Basic details about your organization</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Company Name *</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Legal Name *</label>
                                        <Input
                                            value={formData.legalName}
                                            onChange={(e) => handleInputChange('legalName', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Registration Number *</label>
                                        <Input
                                            value={formData.registrationNumber}
                                            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tax ID *</label>
                                        <Input
                                            value={formData.taxId}
                                            onChange={(e) => handleInputChange('taxId', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Industry *</label>
                                        <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {industries.map(industry => (
                                                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Company Size *</label>
                                        <Select value={formData.size} onValueChange={(value: any) => handleInputChange('size', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                                <SelectItem value="201-500">201-500 employees</SelectItem>
                                                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                                                <SelectItem value="1000+">1000+ employees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Founded Year *</label>
                                        <Input
                                            type="number"
                                            value={formData.foundedYear}
                                            onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Website</label>
                                        <Input
                                            value={formData.website}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                                <CardDescription>How people can reach your organization</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email *</label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Regional Settings
                                </CardTitle>
                                <CardDescription>Timezone and financial calendar</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Timezone *</label>
                                        <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timezones.map(tz => (
                                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fiscal Year Start *</label>
                                        <Input
                                            type="text"
                                            value={formData.fiscalYearStart}
                                            onChange={(e) => handleInputChange('fiscalYearStart', e.target.value)}
                                            placeholder="MM-DD"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/settings">
                                        Cancel
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Current Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Name:</span>
                                    <span>{organization.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Industry:</span>
                                    <span>{organization.industry}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Size:</span>
                                    <span>{organization.size} employees</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Timezone:</span>
                                    <span>{organization.timezone}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}