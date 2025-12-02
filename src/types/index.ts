export type DocumentStatus = "Pending Review" | "Reviewed" | "Approved";
export type DocumentSource = "salesforce" | "conga" | "sftp";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface Document {
  id: string;
  title: string;
  uploadedAt: string;
  status: DocumentStatus;
  attributeCount: number;
  overallConfidence: number;
  reviewedBy?: string;
  source?: DocumentSource;
  storageRef?: string;
}

export interface Attribute {
  id: string;
  name: string;
  category: string;
  section: string;
  page: number;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  extractedValue: string;
  correctedValue: string;
  highlightedText: string;
}

export interface User {
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
