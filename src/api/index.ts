import { Document, Attribute } from "@/types";
import { mockDocuments } from "@/data/mockDocuments";
import { mockAttributesByDocument } from "@/data/mockAttributes";

// Azure Functions / AKS API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Helper for API requests
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Simulate network delay for mock data
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDocuments(): Promise<Document[]> {
  if (API_BASE_URL) {
    return apiRequest<Document[]>("/api/documents");
  }
  
  // Mock fallback
  await delay(300);
  return mockDocuments;
}

export async function getDocumentById(id: string): Promise<Document | null> {
  if (API_BASE_URL) {
    try {
      return await apiRequest<Document>(`/api/documents/${id}`);
    } catch {
      return null;
    }
  }
  
  // Mock fallback
  await delay(200);
  return mockDocuments.find((doc) => doc.id === id) || null;
}

export async function getAttributesByDocumentId(docId: string): Promise<Attribute[]> {
  if (API_BASE_URL) {
    return apiRequest<Attribute[]>(`/api/documents/${docId}/attributes`);
  }
  
  // Mock fallback
  await delay(250);
  return mockAttributesByDocument[docId] || [];
}

export interface SaveReviewPayload {
  documentId: string;
  attributes: Array<{
    id: string;
    correctedValue: string;
  }>;
  status: "Reviewed" | "Approved";
}

export async function saveReview(
  docId: string,
  payload: SaveReviewPayload
): Promise<{ success: boolean }> {
  if (API_BASE_URL) {
    return apiRequest<{ success: boolean }>(`/api/documents/${docId}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  
  // Mock fallback
  await delay(500);
  console.log("Review saved:", { docId, payload });
  return { success: true };
}

// Bulk operations
export interface BulkActionPayload {
  documentIds: string[];
  action: "approve" | "review" | "delete";
  reviewedBy?: string;
}

export async function bulkUpdateDocuments(
  payload: BulkActionPayload
): Promise<{ success: boolean; updatedCount: number }> {
  if (API_BASE_URL) {
    return apiRequest<{ success: boolean; updatedCount: number }>("/api/documents/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  
  // Mock fallback
  await delay(600);
  console.log("Bulk action executed:", payload);
  return { success: true, updatedCount: payload.documentIds.length };
}

// Export functionality
export interface ExportOptions {
  documentIds?: string[];
  format: "csv" | "json";
  includeAttributes?: boolean;
}

export async function exportDocuments(options: ExportOptions): Promise<Blob> {
  if (API_BASE_URL) {
    const response = await fetch(`${API_BASE_URL}/api/documents/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    return response.blob();
  }
  
  // Mock fallback - generate export data locally
  await delay(400);
  
  const docs = options.documentIds
    ? mockDocuments.filter((d) => options.documentIds!.includes(d.id))
    : mockDocuments;

  if (options.format === "json") {
    const exportData = options.includeAttributes
      ? docs.map((doc) => ({
          ...doc,
          attributes: mockAttributesByDocument[doc.id] || [],
        }))
      : docs;
    
    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
  }

  // CSV format
  const headers = [
    "ID",
    "Title",
    "Status",
    "Uploaded At",
    "Attribute Count",
    "Confidence",
    "Reviewed By",
  ];

  const rows = docs.map((doc) => [
    doc.id,
    `"${doc.title}"`,
    doc.status,
    doc.uploadedAt,
    doc.attributeCount.toString(),
    `${doc.overallConfidence}%`,
    doc.reviewedBy || "",
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Blob([csvContent], { type: "text/csv" });
}

export async function exportAttributes(
  docId: string,
  format: "csv" | "json"
): Promise<Blob> {
  if (API_BASE_URL) {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/${docId}/attributes/export?format=${format}`
    );
    return response.blob();
  }
  
  // Mock fallback
  await delay(300);
  
  const attributes = mockAttributesByDocument[docId] || [];

  if (format === "json") {
    return new Blob([JSON.stringify(attributes, null, 2)], {
      type: "application/json",
    });
  }

  // CSV format
  const headers = [
    "ID",
    "Name",
    "Category",
    "Section",
    "Page",
    "Confidence",
    "Extracted Value",
    "Corrected Value",
  ];

  const rows = attributes.map((attr) => [
    attr.id,
    `"${attr.name}"`,
    attr.category,
    `"${attr.section}"`,
    attr.page.toString(),
    `${attr.confidenceScore}%`,
    `"${attr.extractedValue}"`,
    `"${attr.correctedValue}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Blob([csvContent], { type: "text/csv" });
}

// PDF URL helper (for Azure Blob Storage integration)
export function getPdfUrl(storageRef?: string): string | undefined {
  if (!storageRef) return undefined;
  
  const storageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL;
  if (storageBaseUrl) {
    return `${storageBaseUrl}/${storageRef}`;
  }
  
  // Return undefined if no storage URL configured
  return undefined;
}
