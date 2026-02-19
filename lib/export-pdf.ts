/**
 * Client-side PDF export utilities using jsPDF.
 * Generates real downloadable PDF documents from structured data.
 */
import { jsPDF } from 'jspdf';
import { stripHtml } from '@/lib/rich-text';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Wrap long text to fit within a max width, returning lines */
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
    return doc.splitTextToSize(text, maxWidth);
}

/** Add a new page if we're about to overflow */
function ensureSpace(doc: jsPDF, y: number, needed: number, margin: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - margin) {
        doc.addPage();
        return margin;
    }
    return y;
}

/** Draw a horizontal rule */
function drawHR(doc: jsPDF, y: number, marginLeft: number, width: number): number {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, marginLeft + width, y);
    return y + 6;
}

/** Format a date string nicely */
function fmtDate(d?: string | null): string {
    if (!d) return 'N/A';
    try {
        return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return d;
    }
}

// ─── Framework PDF ─────────────────────────────────────────────────────────────

export interface FrameworkPDFData {
    name: string;
    department: string;
    description: string;
    version: number | string;
    status: string;
    createdBy?: string;
    createdAt?: string;
    lastReviewed?: string | null;
    nextReview?: string | null;
    sections: { id?: string; title: string; content: string; order?: number }[];
}

export function exportFrameworkToPDF(fw: FrameworkPDFData, departmentName?: string): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ── Header band ──
    doc.setFillColor(55, 48, 163); // indigo-700
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Departmental Framework', margin, 18);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(fw.name, margin, 28);
    doc.setFontSize(10);
    doc.text(`${departmentName || fw.department}  •  Version ${fw.version}  •  ${fw.status}`, margin, 35);
    y = 50;

    // ── Meta table ──
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    const meta = [
        ['Created By', fw.createdBy || 'N/A'],
        ['Created At', fmtDate(fw.createdAt)],
        ['Last Reviewed', fmtDate(fw.lastReviewed)],
        ['Next Review', fmtDate(fw.nextReview)],
    ];
    meta.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 35, y);
        y += 5;
    });
    y += 4;
    y = drawHR(doc, y, margin, contentWidth);

    // ── Description ──
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = wrapText(doc, stripHtml(fw.description || 'No description provided.'), contentWidth);
    descLines.forEach(line => {
        y = ensureSpace(doc, y, 6, margin);
        doc.text(line, margin, y);
        y += 5;
    });
    y += 4;
    y = drawHR(doc, y, margin, contentWidth);

    // ── Sections ──
    const sortedSections = [...fw.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    sortedSections.forEach((section, idx) => {
        y = ensureSpace(doc, y, 20, margin);

        // Section heading
        doc.setFillColor(243, 244, 246);
        doc.rect(margin, y - 4, contentWidth, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 48, 163);
        doc.text(`${idx + 1}. ${section.title}`, margin + 2, y + 1);
        y += 10;
        doc.setTextColor(60, 60, 60);

        // Section content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const contentLines = wrapText(doc, stripHtml(section.content || ''), contentWidth);
        contentLines.forEach(line => {
            y = ensureSpace(doc, y, 6, margin);
            doc.text(line, margin, y);
            y += 5;
        });
        y += 6;
    });

    // ── Footer on every page ──
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}  •  Page ${i} of ${totalPages}`, margin, pageH - 10);
    }

    const filename = `Framework_${fw.name.replace(/[^a-zA-Z0-9]/g, '_')}_v${fw.version}.pdf`;
    doc.save(filename);
}

// ─── Job Description PDF ───────────────────────────────────────────────────────

export interface JDPDFData {
    title: string;
    department: string;
    summary: string;
    purpose?: string;
    vision?: string;
    mission?: string;
    reportsTo?: string;
    responsibilities: string[];
    kpis: string[];
    okrs: string[];
    skills: string[];
    tools: string[];
    careerPath?: string;
    probationPeriod?: string;
    reviewCadence?: string;
    status?: string;
    version?: string;
    createdBy?: string;
    createdAt?: string;
    lastReviewed?: string | null;
    nextReview?: string | null;
}

export function exportJDToPDF(jd: JDPDFData, departmentName?: string): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ── Header band ──
    doc.setFillColor(30, 64, 175); // blue-800
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Description', margin, 18);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(jd.title, margin, 28);
    doc.setFontSize(10);
    doc.text(`${departmentName || jd.department}  •  Version ${jd.version || '1'}  •  ${jd.status || 'Draft'}`, margin, 35);
    y = 50;

    // ── Meta ──
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    const meta = [
        ['Reports To', jd.reportsTo || 'N/A'],
        ['Probation', jd.probationPeriod ? `${jd.probationPeriod} months` : 'N/A'],
        ['Review Cadence', jd.reviewCadence || 'N/A'],
        ['Created By', jd.createdBy || 'N/A'],
        ['Last Reviewed', fmtDate(jd.lastReviewed)],
    ];
    meta.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 35, y);
        y += 5;
    });
    y += 4;
    y = drawHR(doc, y, margin, contentWidth);

    // Helper to add a text section
    const addSection = (title: string, body?: string) => {
        if (!body) return;
        y = ensureSpace(doc, y, 16, margin);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text(title, margin, y);
        y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const lines = wrapText(doc, stripHtml(body), contentWidth);
        lines.forEach(line => {
            y = ensureSpace(doc, y, 6, margin);
            doc.text(line, margin, y);
            y += 5;
        });
        y += 4;
    };

    // Helper to add a bullet list section
    const addListSection = (title: string, items: string[]) => {
        if (!items || items.length === 0) return;
        y = ensureSpace(doc, y, 16, margin);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text(title, margin, y);
        y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        items.forEach(item => {
            const cleaned = stripHtml(item);
            const lines = wrapText(doc, cleaned, contentWidth - 6);
            lines.forEach((line, li) => {
                y = ensureSpace(doc, y, 6, margin);
                doc.text(li === 0 ? `•  ${line}` : `   ${line}`, margin, y);
                y += 5;
            });
        });
        y += 4;
    };

    addSection('Summary', jd.summary);
    addSection('Purpose', jd.purpose);
    addSection('Vision', jd.vision);
    addSection('Mission', jd.mission);
    addListSection('Responsibilities', jd.responsibilities);
    addListSection('KPIs', jd.kpis);
    addListSection('OKRs', jd.okrs);
    addListSection('Skills Required', jd.skills);
    addListSection('Tools & Software', jd.tools);
    addSection('Career Path', jd.careerPath);

    // ── Footer ──
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}  •  Page ${i} of ${totalPages}`, margin, pageH - 10);
    }

    const filename = `JD_${jd.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${jd.version || '1'}.pdf`;
    doc.save(filename);
}
