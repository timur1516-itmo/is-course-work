export type OrderStatus =
  | "REQUEST"
  | "CREATED"
  | "PROCESSING"
  | "ON_APPROVAL"
  | "REVISION"
  | "APPROVED"
  | "WAITING_PAYMENT"
  | "PAID"
  | "READY_FOR_PRODUCTION"
  | "IN_PRODUCTION"
  | "COMPLETED"
  | "CANCELLED";

export interface Order {
  id: string;
  name: string;
  clientName: string;
  createdAt: string;
  completedAt?: string;
  status: OrderStatus;
}

export interface Application {
  id: string;
  clientName: string;
  createdAt: string;
  status: OrderStatus;
}

export interface ManagerStats {
  newApplicationsCount: number;
  currentApplicationsCount: number;
  pendingApprovalCount: number;
}

export interface DesignerOrder {
  id: string;
  name: string;
  clientName: string;
  orderDate: string;
  expectedDate: string;
  status: OrderStatus;
  attachedFiles: string[];
}

