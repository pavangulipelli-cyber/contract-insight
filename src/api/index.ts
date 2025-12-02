import { Document, Attribute } from "@/types";
import { mockDocuments } from "@/data/mockDocuments";
import { mockAttributesByDocument } from "@/data/mockAttributes";

// Reserved for future AKS integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDocuments(): Promise<Document[]> {
  await delay(300);
  
  if (API_BASE_URL) {
    // Future: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/api/documents`);
    // return response.json();
  }
  
  return mockDocuments;
}

export async function getDocumentById(id: string): Promise<Document | null> {
  await delay(200);
  
  if (API_BASE_URL) {
    // Future: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/api/documents/${id}`);
    // return response.json();
  }
  
  return mockDocuments.find((doc) => doc.id === id) || null;
}

export async function getAttributesByDocumentId(docId: string): Promise<Attribute[]> {
  await delay(250);
  
  if (API_BASE_URL) {
    // Future: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/api/documents/${docId}/attributes`);
    // return response.json();
  }
  
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

export async function saveReview(docId: string, payload: SaveReviewPayload): Promise<{ success: boolean }> {
  await delay(500);
  
  if (API_BASE_URL) {
    // Future: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/api/documents/${docId}/review`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });
    // return response.json();
  }
  
  console.log("Review saved:", { docId, payload });
  return { success: true };
}
