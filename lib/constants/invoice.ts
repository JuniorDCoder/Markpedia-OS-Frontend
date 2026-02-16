export const DEFAULT_INVOICE_TERMS = `1. Payment must be completed before shipment. Goods are released only after full payment is received.
2. All products are inspected before packaging. Markpedia is not responsible for damage during transport unless insurance is purchased.
3. No returns or refunds after shipment; all quantities and product details have been confirmed by the buyer.`;

export const INVOICE_TERMS_EDITOR_ROLES = [
    'ceo',
    'admin',
    'cxo',
    'finance',
    'cfo',
    'accountant'
];

export function canEditInvoiceTerms(role?: string): boolean {
    if (!role) return false;
    return INVOICE_TERMS_EDITOR_ROLES.includes(role.trim().toLowerCase());
}
