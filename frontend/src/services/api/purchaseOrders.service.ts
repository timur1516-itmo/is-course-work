import { apiClient, extractApiError } from './config';

export type PurchaseOrderStatus = 'CREATED' | 'COMPLETED';

export interface PurchaseOrderMaterialDto {
  materialId: number;
  amount: number;
  priceForUnit: number;
  supplier: string;
}

export interface PurchaseOrderResponseDto {
  id: number;
  supplyManagerId: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  materials: PurchaseOrderMaterialDto[];
}

export const purchaseOrdersService = {
  getPurchaseOrders: async (params?: {
    supplyManagerId?: number;
    currentStatusId?: number;
    status?: PurchaseOrderStatus;
    createdFrom?: string;
    createdTo?: string;
    withoutCurrentStatus?: boolean;
    page?: number;
    size?: number;
    sort?: string[];
  }): Promise<PurchaseOrderResponseDto[]> => {
    try {
      const response = await apiClient.get<PurchaseOrderResponseDto[]>('/purchase-orders', { params });
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  getPurchaseOrderById: async (id: number): Promise<PurchaseOrderResponseDto> => {
    try {
      const response = await apiClient.get<PurchaseOrderResponseDto>(`/purchase-orders/${id}`);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  registerReceipt: async (
    purchaseOrderId: number,
    data: {
      invoiceNumber: string;
      receivedItems: Array<{
        materialId: number;
        amount: number;
      }>;
    }
  ): Promise<PurchaseOrderReceiptResponseDto> => {
    try {
      const response = await apiClient.post<PurchaseOrderReceiptResponseDto>(
        `/purchase-orders/${purchaseOrderId}/receipt`,
        data
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};

export interface PurchaseOrderReceiptResponseDto {
  id: number;
  purchaseOrderId: number;
  warehouseWorkerId: number;
  invoiceNumber: string;
  receiptedAt: string;
}

