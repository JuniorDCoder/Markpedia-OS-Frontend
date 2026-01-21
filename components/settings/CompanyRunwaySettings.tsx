'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import { moneyService } from '@/lib/api/money';
import toast from 'react-hot-toast';
import { DollarSign, Save, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CompanyRunwaySettings() {
    const { user } = useAuthStore();
    const [runway, setRunway] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [updatedBy, setUpdatedBy] = useState<string | null>(null);

    // Check if user is Admin or CEO
    const canManageRunway = user?.role === 'Admin' || user?.role === 'CEO';

    useEffect(() => {
        if (canManageRunway) {
            loadRunway();
        } else {
            setLoading(false);
        }
    }, [canManageRunway]);

    const loadRunway = async () => {
        try {
            setLoading(true);
            const data = await moneyService.getCompanyRunway();
            setRunway(data.runway);
            setLastUpdated(data.last_updated);
            setUpdatedBy(data.updated_by);
        } catch (error: any) {
            console.error('Error loading runway:', error);
            if (error?.message?.includes('403')) {
                toast.error('You do not have permission to view company runway');
            } else {
                toast.error('Failed to load company runway');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (runway < 0) {
            toast.error('Runway value must be non-negative');
            return;
        }

        try {
            setSaving(true);
            const data = await moneyService.setCompanyRunway(runway);
            setLastUpdated(data.last_updated);
            setUpdatedBy(data.updated_by);
            toast.success('Company runway updated successfully');
        } catch (error: any) {
            console.error('Error saving runway:', error);
            if (error?.message?.includes('403')) {
                toast.error('You do not have permission to set company runway');
            } else {
                toast.error('Failed to save company runway');
            }
        } finally {
            setSaving(false);
        }
    };

    if (!canManageRunway) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Company Runway
                    </CardTitle>
                    <CardDescription>
                        Annual operational budget for the company
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Only Admins and CEOs can view and manage the company runway.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Company Runway
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Company Runway
                </CardTitle>
                <CardDescription>
                    Set the annual operational budget for the company. This value is used to calculate the company's runway in months.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        The company runway represents the total amount needed to operate the company for one year.
                        This is used to calculate how many months the company can operate with current available cash.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Label htmlFor="runway">Annual Operational Budget (XAF)</Label>
                    <Input
                        id="runway"
                        type="number"
                        min="0"
                        step="1000"
                        value={runway}
                        onChange={(e) => setRunway(parseFloat(e.target.value) || 0)}
                        placeholder="Enter annual budget in XAF"
                        className="text-lg font-semibold"
                    />
                    <p className="text-sm text-muted-foreground">
                        Current value: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'XAF',
                            maximumFractionDigits: 0
                        }).format(runway)}
                    </p>
                </div>

                {lastUpdated && (
                    <div className="text-sm text-muted-foreground">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                        {updatedBy && ` by ${updatedBy}`}
                    </div>
                )}

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Runway
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
