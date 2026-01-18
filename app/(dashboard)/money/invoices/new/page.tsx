'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { invoiceService } from '@/lib/api/invoices';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { InvoiceItem } from '@/types/invoice';

export default function NewInvoicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientIdNumber, setClientIdNumber] = useState('');
    const [accountNo, setAccountNo] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0]);
    const [invNumber, setInvNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'Service Description', quantity: 1, unitPrice: 0, amount: 0 }
    ]);

    const [taxRate, setTaxRate] = useState(19.25);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [authorizedBy, setAuthorizedBy] = useState('');
    const [authorizedTitle, setAuthorizedTitle] = useState('Sales Manager');

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const total = subtotal + taxAmount - discount;

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updates = { [field]: value };
                if (field === 'quantity' || field === 'unitPrice') {
                    const qty = field === 'quantity' ? Number(value) : item.quantity;
                    const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
                    updates.amount = qty * price;
                }
                return { ...item, ...updates };
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems(prev => [...prev, {
            id: Math.random().toString(36),
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0
        }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleSubmit = async () => {
        if (!clientName) return toast.error('Client name is required');

        setLoading(true);
        try {
            await invoiceService.createInvoice({
                number: invNumber,
                accountNo: accountNo || undefined,
                clientId: 'new', // simplified for now
                clientName,
                clientEmail,
                clientPhone: clientPhone || undefined,
                clientAddress,
                clientIdNumber: clientIdNumber || undefined,
                issueDate: new Date(issueDate).toISOString(),
                dueDate: new Date(dueDate).toISOString(),
                items,
                subtotal,
                taxRate,
                taxAmount,
                discountAmount: discount,
                total,
                status: 'Draft',
                notes,
                terms: notes || 'Net 14',
                authorizedBy: authorizedBy || undefined,
                authorizedTitle: authorizedTitle || undefined
            });
            toast.success('Invoice created successfully');
            router.push('/money/invoices');
        } catch (error) {
            toast.error('Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">New Invoice</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Form Area */}
                <div className="md:col-span-2 space-y-6">
                    {/* Client Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Bill To</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Client Name</Label>
                                <Input
                                    placeholder="Enter client or company name"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="client@email.com"
                                        value={clientEmail}
                                        onChange={e => setClientEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        placeholder="+237 6 XX XX XX XX"
                                        value={clientPhone}
                                        onChange={e => setClientPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Address</Label>
                                    <Input
                                        placeholder="Street, City, Country"
                                        value={clientAddress}
                                        onChange={e => setClientAddress(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>ID/Tax Number (Optional)</Label>
                                    <Input
                                        placeholder="Client ID or Tax Number"
                                        value={clientIdNumber}
                                        onChange={e => setClientIdNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-base">Items</CardTitle>
                            <Button variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                                    <div className="col-span-6">
                                        {index === 0 && <Label className="text-xs mb-1 block">Description</Label>}
                                        <Input
                                            placeholder="Item description"
                                            value={item.description}
                                            onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        {index === 0 && <Label className="text-xs mb-1 block">Qty</Label>}
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        {index === 0 && <Label className="text-xs mb-1 block">Price</Label>}
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.unitPrice}
                                            onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1 pt-6 text-center">
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-10 w-10 text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Authorized By</Label>
                                    <Input
                                        placeholder="Your name"
                                        value={authorizedBy}
                                        onChange={e => setAuthorizedBy(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="Sales Manager"
                                        value={authorizedTitle}
                                        onChange={e => setAuthorizedTitle(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Notes/Terms</Label>
                                <Textarea
                                    placeholder="Payment terms, special instructions, etc."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Invoice Number</Label>
                                <Input value={invNumber} onChange={e => setInvNumber(e.target.value)} />
                            </div>
                            <div>
                                <Label>Account No (Optional)</Label>
                                <Input
                                    placeholder="Client account number"
                                    value={accountNo}
                                    onChange={e => setAccountNo(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Issue Date</Label>
                                <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                            </div>
                            <div>
                                <Label>Due Date</Label>
                                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                        <CardHeader>
                            <CardTitle className="text-base">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{subtotal.toLocaleString()} XAF</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Tax Rate (%)</span>
                                <Input
                                    className="w-16 h-8 text-right bg-white"
                                    type="number"
                                    value={taxRate}
                                    onChange={e => setTaxRate(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax Amount</span>
                                <span>{taxAmount.toLocaleString()} XAF</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Discount</span>
                                <Input
                                    className="w-24 h-8 text-right bg-white"
                                    type="number"
                                    value={discount}
                                    onChange={e => setDiscount(Number(e.target.value))}
                                />
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{total.toLocaleString()} XAF</span>
                            </div>

                            <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Invoice'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
