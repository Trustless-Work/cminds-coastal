import { jsPDF } from "jspdf";

import type { TaskInvoiceData } from "./types";

const COLOR = {
  text: [17, 17, 17] as const,
  muted: [102, 102, 102] as const,
  border: [236, 236, 236] as const,
  accent: [0, 0, 0] as const,
};

const DEFAULT_DISCLAIMER =
  "Trustless Work is never custodian of funds. This receipt reflects on-chain escrow settlement for the Coastal Communities Escrow Pilot.";

function formatAmount(amount: number, symbol: string): string {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  })} ${symbol}`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function settlementLabel(type: TaskInvoiceData["payment"]["settlementType"]): string {
  return type === "released" ? "Released" : "Dispute resolved";
}

function drawDivider(doc: jsPDF, y: number, pageWidth: number, margin: number): void {
  doc.setDrawColor(...COLOR.border);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.text);
  doc.text(title, 48, y);
  return y + 16;
}

function addKeyValue(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  pageWidth: number,
  margin: number,
): number {
  const labelWidth = 120;
  const valueX = margin + labelWidth;
  const maxWidth = pageWidth - valueX - margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.muted);
  doc.text(label, margin, y);

  doc.setTextColor(...COLOR.text);
  const lines = doc.splitTextToSize(value || "—", maxWidth) as string[];
  doc.text(lines, valueX, y);
  return y + Math.max(14, lines.length * 12);
}

export async function buildTaskInvoicePdf(data: TaskInvoiceData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = 48;

  if (data.logoDataUrl) {
    try {
      doc.addImage(data.logoDataUrl, "PNG", margin, y, 96, 28);
    } catch {
      // Logo is optional — continue without it if format fails.
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLOR.text);
  doc.text("Task Invoice", pageWidth - margin, y + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.muted);
  doc.text("Payment Receipt", pageWidth - margin, y + 28, { align: "right" });

  y = 96;
  drawDivider(doc, y, pageWidth, margin);
  y += 24;

  y = addSectionTitle(doc, "Escrow", y);
  y = addKeyValue(doc, "Title", data.escrow.title, y, pageWidth, margin);
  if (data.escrow.communityName) {
    y = addKeyValue(
      doc,
      "Community",
      data.escrow.communityName,
      y,
      pageWidth,
      margin,
    );
  }
  y = addKeyValue(
    doc,
    "Contract",
    data.escrow.contractId,
    y,
    pageWidth,
    margin,
  );
  if (data.escrow.engagementId) {
    y = addKeyValue(
      doc,
      "Engagement",
      data.escrow.engagementId,
      y,
      pageWidth,
      margin,
    );
  }
  if (data.escrow.geographicArea) {
    y = addKeyValue(
      doc,
      "Area",
      data.escrow.geographicArea,
      y,
      pageWidth,
      margin,
    );
  }

  y += 8;
  drawDivider(doc, y, pageWidth, margin);
  y += 20;

  y = addSectionTitle(doc, "Task", y);
  y = addKeyValue(doc, "Code", data.task.code, y, pageWidth, margin);
  y = addKeyValue(doc, "Name", data.task.name, y, pageWidth, margin);
  if (data.task.category) {
    y = addKeyValue(doc, "Category", data.task.category, y, pageWidth, margin);
  }
  y = addKeyValue(
    doc,
    "Milestone",
    `#${data.task.milestoneIndex + 1}`,
    y,
    pageWidth,
    margin,
  );
  if (data.task.deliverable) {
    y = addKeyValue(
      doc,
      "Deliverable",
      data.task.deliverable,
      y,
      pageWidth,
      margin,
    );
  }

  y += 8;
  drawDivider(doc, y, pageWidth, margin);
  y += 20;

  y = addSectionTitle(doc, "Settlement", y);
  y = addKeyValue(
    doc,
    "Status",
    settlementLabel(data.payment.settlementType),
    y,
    pageWidth,
    margin,
  );
  y = addKeyValue(
    doc,
    "Amount",
    formatAmount(data.payment.amount, data.escrow.assetSymbol),
    y,
    pageWidth,
    margin,
  );

  if (data.payment.payees.length === 0) {
    y = addKeyValue(
      doc,
      "Payee",
      data.payment.settlementType === "resolved"
        ? "Distributed on-chain (dispute resolution)"
        : "—",
      y,
      pageWidth,
      margin,
    );
  } else {
    for (const [index, payee] of data.payment.payees.entries()) {
      const label =
        payee.label ??
        (data.payment.payees.length > 1 ? `Payee ${index + 1}` : "Payee");
      const amountPart =
        payee.amount !== undefined
          ? ` · ${formatAmount(payee.amount, data.escrow.assetSymbol)}`
          : "";
      y = addKeyValue(
        doc,
        label,
        `${payee.address}${amountPart}`,
        y,
        pageWidth,
        margin,
      );
    }
  }

  y = addKeyValue(
    doc,
    "Generated",
    formatDateTime(data.payment.generatedAt),
    y,
    pageWidth,
    margin,
  );

  if (data.roles) {
    y += 8;
    drawDivider(doc, y, pageWidth, margin);
    y += 20;
    y = addSectionTitle(doc, "Roles", y);
    if (data.roles.approver) {
      y = addKeyValue(doc, "Approver", data.roles.approver, y, pageWidth, margin);
    }
    if (data.roles.releaseSigner) {
      y = addKeyValue(
        doc,
        "Release signer",
        data.roles.releaseSigner,
        y,
        pageWidth,
        margin,
      );
    }
    if (data.roles.disputeResolver) {
      y = addKeyValue(
        doc,
        "Dispute resolver",
        data.roles.disputeResolver,
        y,
        pageWidth,
        margin,
      );
    }
  }

  const footerY = pageHeight - 56;
  drawDivider(doc, footerY - 16, pageWidth, margin);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.muted);
  doc.text(
    `${formatDateTime(data.payment.generatedAt)}  ·  ${data.footer.networkLabel}`,
    margin,
    footerY,
  );

  const disclaimer = data.footer.disclaimer ?? DEFAULT_DISCLAIMER;
  const disclaimerLines = doc.splitTextToSize(
    disclaimer,
    pageWidth - margin * 2,
  ) as string[];
  doc.text(disclaimerLines, margin, footerY + 14);

  doc.setDrawColor(...COLOR.accent);
  doc.setLineWidth(1.5);
  doc.line(margin, 40, margin + 24, 40);

  return doc.output("blob");
}
