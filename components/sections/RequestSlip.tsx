'use client';

import { CashRequest } from "@/types/cash-management";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
    request: CashRequest;
}

export const RequestSlip = ({ request }: Props) => {
    // Utility to format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US').format(val) + " XAF";
    };

    // Helper to find approval entry for a specific status transition
    const getApproval = (status: string) => {
        return request.auditTrail?.find(entry => entry.action.includes(status));
    };

    const approvalSteps = {
        accountant: getApproval('Pending CFO') || getApproval('Approved'),
        cfo: getApproval('Pending CEO') || (request.ceoApprovalRequired ? null : getApproval('Approved')),
        ceo: getApproval('Approved')
    };

    const amountToWords = (amount: number) => {
        // Basic placeholder for "Amount in words" as requested by design
        return `Amount in words: __________________________________________________________________________`;
    };

    return (
        <div id="request-slip-content" className="p-10 bg-white text-black max-w-[800px] mx-auto border" style={{ fontFamily: 'serif' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">CASH REQUEST SLIP</h1>
                    <p className="text-sm font-bold mt-1">MARKPEDIA OS - FINANCIAL SERVICES</p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-mono font-bold">{request.requestId}</div>
                    <p className="text-xs text-gray-500 uppercase">Unique Reference Number</p>
                </div>
            </div>

            {/* Basic Info Box */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">Requester Name</span>
                        <p className="text-sm border-b border-gray-300 pb-1">{request.requestedByName}</p>
                    </div>
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">Department</span>
                        <p className="text-sm border-b border-gray-300 pb-1">{request.department}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">Date of Request</span>
                        <p className="text-sm border-b border-gray-300 pb-1">{new Date(request.dateOfRequest).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">Urgency Level</span>
                        <p className="text-sm font-bold uppercase">{request.urgencyLevel}</p>
                    </div>
                </div>
            </div>

            {/* Financial Details */}
            <div className="bg-gray-50 p-4 border border-gray-200 mb-8">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">Amount Requested</span>
                        <p className="text-2xl font-bold">{formatCurrency(request.amountRequested)}</p>
                    </div>
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">Payment Method</span>
                        <p className="text-sm font-medium">{request.paymentMethodPreferred}</p>
                    </div>
                </div>
                <div className="mt-4 border-t border-gray-300 pt-4">
                    <span className="text-xs uppercase font-bold text-gray-500 block">Purpose / Description</span>
                    <p className="text-sm mt-1 font-medium">{request.purposeOfRequest}</p>
                    <p className="text-xs text-gray-600 mt-1 italic">{request.description}</p>
                </div>
                <div className="mt-6">
                    <p className="text-xs font-bold uppercase text-gray-400">{amountToWords(request.amountRequested)}</p>
                </div>
            </div>

            {/* Payment Info Table */}
            {(request.bankName || request.momoNumber) && (
                <div className="mb-8 border border-black">
                    <div className="bg-black text-white text-[10px] uppercase font-bold px-2 py-1">Disbursement Details</div>
                    <div className="p-3 grid grid-cols-2 gap-y-2 text-xs">
                        {request.paymentMethodPreferred === 'Bank Transfer' ? (
                            <>
                                <div className="font-bold">Bank Name:</div><div>{request.bankName}</div>
                                <div className="font-bold">Account Name:</div><div>{request.accountName}</div>
                                <div className="font-bold">Account Number:</div><div className="font-mono">{request.accountNumber}</div>
                            </>
                        ) : (
                            <>
                                <div className="font-bold">Provider:</div><div>{request.momoProvider}</div>
                                <div className="font-bold">Registered Name:</div><div>{request.momoName}</div>
                                <div className="font-bold">Momo Number:</div><div className="font-mono">{request.momoNumber}</div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Allocation */}
            <div className="mb-8 flex gap-10 text-xs">
                <div>
                    <span className="font-bold uppercase text-gray-500">Project/Cost Center:</span>
                    <span className="ml-2 px-2 py-0.5 border border-black font-mono font-bold">{request.projectCostCenterCode}</span>
                </div>
                <div>
                    <span className="font-bold uppercase text-gray-500">Expense Category:</span>
                    <span className="ml-2">{request.expenseCategory}</span>
                </div>
            </div>

            {/* Approval Chain / Signature Block */}
            <div className="mt-12">
                <h3 className="text-xs font-bold uppercase mb-4 border-b border-black w-fit">Digital Approval & Authorization Records</h3>
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-10">
                        {/* Requester */}
                        <div className="border-t border-black pt-2">
                            <p className="text-xs font-bold uppercase">Requester Submission</p>
                            <p className="text-[10px] text-gray-700 mt-1 font-mono uppercase bg-gray-50 p-1 border border-dashed border-gray-300">
                                Verified: {request.requestedByName} • {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        {/* Accountant */}
                        <div className={`border-t border-black pt-2 ${!approvalSteps.accountant ? 'opacity-30' : ''}`}>
                            <p className="text-xs font-bold uppercase">Accountant Validation</p>
                            {approvalSteps.accountant ? (
                                <p className="text-[10px] text-green-700 mt-1 font-mono uppercase bg-green-50 p-1 border border-dashed border-green-300">
                                    Approved by Accountant on {new Date(approvalSteps.accountant.timestamp).toLocaleString()}
                                </p>
                            ) : (
                                <p className="text-[10px] text-red-400 mt-1 font-mono uppercase">Not Approved by Accountant</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-10">
                        {/* CFO */}
                        <div className={`border-t border-black pt-2 ${!approvalSteps.cfo ? 'opacity-30' : ''}`}>
                            <p className="text-xs font-bold uppercase">CFO Review</p>
                            {approvalSteps.cfo ? (
                                <p className="text-[10px] text-blue-700 mt-1 font-mono uppercase bg-blue-50 p-1 border border-dashed border-blue-300">
                                    Approved by CFO on {new Date(approvalSteps.cfo.timestamp).toLocaleString()}
                                </p>
                            ) : (
                                <p className="text-[10px] text-red-400 mt-1 font-mono uppercase">Not Approved by CFO</p>
                            )}
                        </div>
                        {/* CEO */}
                        <div className={`border-t border-black pt-2 ${!approvalSteps.ceo ? 'opacity-30' : ''}`}>
                            <p className="text-xs font-bold uppercase">CEO Final Authorization</p>
                            {approvalSteps.ceo ? (
                                <p className="text-[10px] text-purple-700 mt-1 font-mono uppercase bg-purple-50 p-1 border border-dashed border-purple-300">
                                    Approved by CEO on {new Date(approvalSteps.ceo.timestamp).toLocaleString()}
                                </p>
                            ) : (
                                <p className="text-[10px] text-red-400 mt-1 font-mono uppercase">Not Approved by CEO</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="mt-20 pt-4 border-t border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        This document is an official record generated by Markpedia OS. Valid only with required physical signatures for auditing.
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">Printed on {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};
