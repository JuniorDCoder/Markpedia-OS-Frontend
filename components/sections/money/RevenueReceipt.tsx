import { RevenueTransaction } from '@/types/cash-management';

interface RevenueReceiptProps {
    transaction: RevenueTransaction;
    receivedByName?: string;
}

export function RevenueReceipt({ transaction, receivedByName = 'Finance Officer' }: RevenueReceiptProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
        }).format(val);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Company Letterhead */}
            <div className="border-b-4 border-green-600 pb-4 mb-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">MARKPEDIA OS</h1>
                    <p className="text-sm text-gray-600 mt-1">Business Management System</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Email: info@markpedia.com | Phone: +237 XXX XXX XXX
                    </p>
                </div>
            </div>

            {/* Receipt Title */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 uppercase">Payment Receipt</h2>
                <div className="mt-2 inline-block bg-green-100 px-4 py-2 rounded">
                    <p className="text-lg font-semibold text-green-800">
                        Receipt No: {transaction.receiptNumber}
                    </p>
                </div>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">RECEIVED FROM:</h3>
                    <p className="text-base font-medium text-gray-800">{transaction.clientName}</p>
                    <p className="text-sm text-gray-500">{transaction.project}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">DATE:</h3>
                    <p className="text-base font-medium text-gray-800">{formatDate(transaction.dateReceived)}</p>
                </div>
            </div>

            {/* Amount Section */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">AMOUNT RECEIVED:</h3>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">PAYMENT METHOD:</h3>
                        <p className="text-lg font-medium text-gray-800">{transaction.paymentMethod}</p>
                    </div>
                </div>
            </div>

            {/* Transaction Details */}
            <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600">REFERENCE NUMBER:</h3>
                        <p className="text-base text-gray-800 font-mono">{transaction.referenceNo}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600">CATEGORY:</h3>
                        <p className="text-base text-gray-800">{transaction.category}</p>
                    </div>
                </div>

                {transaction.description && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">DESCRIPTION:</h3>
                        <p className="text-base text-gray-800">{transaction.description}</p>
                    </div>
                )}
            </div>

            {/* Received By Section */}
            <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">RECEIVED BY:</h3>
                        <div className="border-b-2 border-gray-400 pb-1 mb-1">
                            <p className="text-base font-medium text-gray-800">{receivedByName}</p>
                        </div>
                        <p className="text-xs text-gray-500">Signature</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">DATE:</h3>
                        <div className="border-b-2 border-gray-400 pb-1 mb-1">
                            <p className="text-base font-medium text-gray-800">
                                {formatDate(transaction.createdAt)}
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">Date Issued</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center">
                <p className="text-xs text-gray-500">
                    This is an official receipt from Markpedia OS. For any queries, please contact our finance department.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Generated on {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
}
