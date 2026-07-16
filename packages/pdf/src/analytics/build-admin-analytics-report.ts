import { jsPDF } from "jspdf";

import type { AdminAnalyticsReportData } from "./types";

const COLOR = {
  text: [17, 17, 17] as const,
  muted: [102, 102, 102] as const,
  border: [236, 236, 236] as const,
  accent: [0, 0, 0] as const,
};

const DEFAULT_DISCLAIMER =
  "Amounts are planned USDC from off-chain milestone metadata. Trustless Work is never custodian of funds. On-chain funded/released balances are not included in this report.";

function formatUsdc(amount: number): string {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} USDC`;
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

function drawDivider(
  doc: jsPDF,
  y: number,
  pageWidth: number,
  margin: number,
): void {
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
  const labelWidth = 140;
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

function ensureSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  pageHeight: number,
  margin: number,
): number {
  if (y + needed < pageHeight - 72) {
    return y;
  }
  doc.addPage();
  return margin;
}

function addTableSection(
  doc: jsPDF,
  title: string,
  rows: AdminAnalyticsReportData["escrowsByStatus"],
  yStart: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  mode: "count-amount" | "count" | "amount",
): number {
  if (rows.length === 0) {
    return yStart;
  }

  let y = ensureSpace(doc, yStart, 40, pageHeight, margin);
  y += 8;
  drawDivider(doc, y, pageWidth, margin);
  y += 20;
  y = addSectionTitle(doc, title, y);

  for (const row of rows) {
    y = ensureSpace(doc, y, 18, pageHeight, margin);
    let value = "—";
    if (mode === "count-amount") {
      const parts: string[] = [];
      if (row.count !== undefined) {
        parts.push(`${row.count}`);
      }
      if (row.amount !== undefined) {
        parts.push(formatUsdc(row.amount));
      }
      value = parts.join(" · ");
    } else if (mode === "count") {
      value = String(row.count ?? 0);
    } else {
      value = formatUsdc(row.amount ?? 0);
    }
    y = addKeyValue(doc, row.label, value, y, pageWidth, margin);
  }

  return y;
}

export async function buildAdminAnalyticsReportPdf(
  data: AdminAnalyticsReportData,
): Promise<Blob> {
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
  doc.text("Analytics Report", pageWidth - margin, y + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.muted);
  doc.text("Admin Dashboard", pageWidth - margin, y + 28, { align: "right" });

  y = 96;
  drawDivider(doc, y, pageWidth, margin);
  y += 24;

  y = addSectionTitle(doc, "Summary", y);
  y = addKeyValue(
    doc,
    "Communities (active)",
    String(data.kpis.communitiesActive),
    y,
    pageWidth,
    margin,
  );
  y = addKeyValue(
    doc,
    "Communities (inactive)",
    String(data.kpis.communitiesInactive),
    y,
    pageWidth,
    margin,
  );
  y = addKeyValue(
    doc,
    "Tasks (active)",
    String(data.kpis.tasksActive),
    y,
    pageWidth,
    margin,
  );
  y = addKeyValue(
    doc,
    "Tasks (inactive)",
    String(data.kpis.tasksInactive),
    y,
    pageWidth,
    margin,
  );
  y = addKeyValue(
    doc,
    "Escrows",
    String(data.kpis.escrowsTotal),
    y,
    pageWidth,
    margin,
  );
  y = addKeyValue(
    doc,
    "Planned USDC",
    formatUsdc(data.kpis.plannedUsdcTotal),
    y,
    pageWidth,
    margin,
  );
  y = addKeyValue(
    doc,
    "Generated",
    formatDateTime(data.generatedAt),
    y,
    pageWidth,
    margin,
  );

  y = addTableSection(
    doc,
    "Escrows by status",
    data.escrowsByStatus,
    y,
    pageWidth,
    pageHeight,
    margin,
    "count-amount",
  );
  y = addTableSection(
    doc,
    "Escrows by community",
    data.escrowsByCommunity,
    y,
    pageWidth,
    pageHeight,
    margin,
    "count-amount",
  );
  y = addTableSection(
    doc,
    "Tasks by category",
    data.tasksByCategory,
    y,
    pageWidth,
    pageHeight,
    margin,
    "count",
  );
  y = addTableSection(
    doc,
    "Planned USDC by task category",
    data.plannedUsdcByTaskCategory,
    y,
    pageWidth,
    pageHeight,
    margin,
    "amount",
  );
  addTableSection(
    doc,
    "Escrows created (last 12 months)",
    data.escrowsCreatedByMonth,
    y,
    pageWidth,
    pageHeight,
    margin,
    "count-amount",
  );

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const footerY = pageHeight - 56;
    drawDivider(doc, footerY - 16, pageWidth, margin);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR.muted);
    doc.text(
      `${formatDateTime(data.generatedAt)}  ·  ${data.networkLabel}  ·  Page ${page}/${pageCount}`,
      margin,
      footerY,
    );

    const disclaimer = data.disclaimer ?? DEFAULT_DISCLAIMER;
    const disclaimerLines = doc.splitTextToSize(
      disclaimer,
      pageWidth - margin * 2,
    ) as string[];
    doc.text(disclaimerLines, margin, footerY + 14);

    doc.setDrawColor(...COLOR.accent);
    doc.setLineWidth(1.5);
    doc.line(margin, 40, margin + 24, 40);
  }

  return doc.output("blob");
}
