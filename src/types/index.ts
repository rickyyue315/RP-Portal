export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export interface CustomFieldDef {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  required: boolean;
  sortOrder: number;
}

export interface SubmissionItem {
  id: string;
  userId: string;
  sku: string;
  siteCode: string;
  quantity: number | null;
  unitPrice: number | null;
  remarks: string | null;
  customFields: Record<string, unknown> | null;
  status: "PENDING" | "PROCESSED";
  submittedAt: string;
  updatedAt: string;
  updatedById: string | null;
  processedAt: string | null;
  processedById: string | null;
  user: {
    name: string;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
