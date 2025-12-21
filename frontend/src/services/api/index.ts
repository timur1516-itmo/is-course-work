export * from './config';
export { catalogService } from './catalog.service';
export { filesService } from './files.service';
export { designsService } from './designs.service';
export { materialsService } from './materials.service';
export { applicationsService } from './applications.service';
export { ordersService } from './orders.service';
export { conversationsService, chatWebSocket } from './conversations.service';
export { clientsService } from './clients.service';
export { employeesService } from './employees.service';
export { authService } from './auth.service';
export { productionService } from './production.service';
export { purchaseOrdersService } from './purchaseOrders.service';

export type { 
  LoginRequestDto, 
  LoginResponseDto, 
  ClientRegistrationRequestDto,
  ClientRegistrationResponseDto,
  AccountRole,
  CurrentUserDto,
  UpdateProfileRequestDto,
  ChangePasswordRequestDto
} from './auth.service';

export type * from './types';

// Explicitly export ProductDesignRequestDto to ensure it's available
export type { ProductDesignRequestDto, ProductDesignResponseDto } from './types';

export type { ProductionTaskResponseDto, ProductionTaskStatus } from './production.service';

export type { PurchaseOrderResponseDto, PurchaseOrderStatus, PurchaseOrderMaterialDto, PurchaseOrderReceiptResponseDto } from './purchaseOrders.service';

