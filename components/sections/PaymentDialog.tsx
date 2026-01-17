import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CashRequest, CashReceive } from '@/types/cash-management';
import { cashManagementService } from '@/lib/api/cash-management';
import toast from 'react-hot-toast';

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: CashRequest;
    onSuccess: () => void;
    currentUser: { id: string; name: string; role: string };
}

export function PaymentDialog({ open, onOpenChange, request, onSuccess, currentUser }: PaymentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        dateOfPayment: new Date().toISOString().split('T')[0],
        method: 'Cash' as 'Cash' | 'Bank' | 'Mobile Money',
        reference: '',
        remarks: ''
    });

    const handleSubmit = async () => {
        if (!formData.reference && formData.method !== 'Cash') {
            toast.error('Reference number is required for non-cash payments');
            return;
        }

        setLoading(true);
        try {
            // Create CashReceive (Disbursement) record
            const receiveData: Omit<CashReceive, 'id' | 'receiptId' | 'auditTrail' | 'createdAt' | 'updatedAt'> = {
                dateOfReceipt: formData.dateOfPayment,
                receiverName: request.requestedBy, // The person who requested gets the money
                department: request.department,
                purposeOfFunds: request.purposeOfRequest,
                amountReceived: request.amountRequested,
                paymentMethod: formData.method,
                paymentReferenceNo: formData.reference || 'CASH',
                linkedRequestId: request.requestId,
                issuedBy: currentUser.id, // Cashier
                approvedBy: request.financeOfficer || 'system', // Already approved
                dateApproved: new Date().toISOString(),
                receiverSignature: false, // Physical signature placeholder
                financeSignature: true,
                remarks: formData.remarks,
                status: 'Completed'
            };

            await cashManagementService.createCashReceive(receiveData);

            // Update request status to Paid
            await cashManagementService.updateCashRequestStatus(
                request.id,
                'Paid',
                `Funds disbursed via ${formData.method}. Ref: ${formData.reference}`,
                currentUser.id
            );

            toast.success('Funds disbursed successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Disburse Funds</DialogTitle>
                    <DialogDescription>
                        Record payment details for Request #{request.requestId}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            value={`${request.amountRequested.toLocaleString()} XAF`}
                            disabled
                            className="col-span-3 bg-muted"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.dateOfPayment}
                            onChange={(e) => setFormData({ ...formData, dateOfPayment: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="method" className="text-right">
                            Method
                        </Label>
                        <Select
                            value={formData.method}
                            onValueChange={(val: any) => setFormData({ ...formData, method: val })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank">Bank Transfer</SelectItem>
                                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reference" className="text-right">
                            Ref No.
                        </Label>
                        <Input
                            id="reference"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            placeholder={formData.method === 'Cash' ? 'Optional' : 'Required'}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="remarks" className="text-right">
                            Remarks
                        </Label>
                        <Textarea
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm Disbursement'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
