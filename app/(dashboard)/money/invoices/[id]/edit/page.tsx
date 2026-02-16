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
import { TableSkeleton } from '@/components/ui/loading';
import { useAuthStore } from '@/store/auth';
import { canEditInvoiceTerms, DEFAULT_INVOICE_TERMS } from '@/lib/constants/invoice';

export default function EditInvoicePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { user } = useAuthStore();

    // Form State
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientIdNumber, setClientIdNumber] = useState('');
    const [accountNo, setAccountNo] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [invNumber, setInvNumber] = useState('');

    const [items, setItems] = useState<InvoiceItem[]>([]);

    const [taxRate, setTaxRate] = useState(19.25);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState(DEFAULT_INVOICE_TERMS);
    const [authorizedBy, setAuthorizedBy] = useState('');
    const [authorizedTitle, setAuthorizedTitle] = useState('Sales Manager');
    const canManageTerms = canEditInvoiceTerms(user?.role);

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                const invoice = await invoiceService.getInvoiceById(params.id);
                if (!invoice) {
                    toast.error('Invoice not found');
                    router.push('/money/invoices');
                    return;
                }

                setClientName(invoice.clientName);
                setClientEmail(invoice.clientEmail);
                setClientPhone(invoice.clientPhone || '');
                setClientAddress(invoice.clientAddress);
                setClientIdNumber(invoice.clientIdNumber || '');
                setAccountNo(invoice.accountNo || '');
                setIssueDate(invoice.issueDate.split('T')[0]);
                setDueDate(invoice.dueDate.split('T')[0]);
                setInvNumber(invoice.number);
                setItems(invoice.items);
                setTaxRate(invoice.taxRate);
                setDiscount(invoice.discountAmount);
                setNotes(invoice.notes || '');
                setTerms(invoice.terms || DEFAULT_INVOICE_TERMS);
                setAuthorizedBy(invoice.authorizedBy || '');
                setAuthorizedTitle(invoice.authorizedTitle || 'Sales Manager');
            } catch (error) {
                toast.error('Failed to load invoice');
            } finally {
                setLoading(false);
            }
        };
        loadInvoice();
    }, [params.id, router]);

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

        setSaving(true);
        try {
            await invoiceService.updateInvoice(params.id, {
                number: invNumber,
                accountNo: accountNo || undefined,
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
                notes: notes || undefined,
                terms: terms.trim() || DEFAULT_INVOICE_TERMS,
                authorizedBy: authorizedBy || undefined,
                authorizedTitle: authorizedTitle || undefined
            });
            toast.success('Invoice updated successfully');
            router.push(`/money/invoices/${params.id}`);
        } catch (error) {
            toast.error('Failed to update invoice');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Edit Invoice</h1>
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
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Additional notes (optional)"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Terms & Conditions</Label>
                                <Textarea
                                    placeholder="Invoice terms and conditions"
                                    value={terms}
                                    onChange={e => setTerms(e.target.value)}
                                    rows={6}
                                    disabled={!canManageTerms}
                                />
                                {!canManageTerms && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Only CEO, Admin, CXO, and finance roles can edit terms.
                                    </p>
                                )}
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

                            <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={saving}>
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
