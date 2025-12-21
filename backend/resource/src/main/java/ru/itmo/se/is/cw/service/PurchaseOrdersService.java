package ru.itmo.se.is.cw.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.dto.filter.PurchaseOrderFilter;
import ru.itmo.se.is.cw.dto.specification.PurchaseOrderSpecification;
import ru.itmo.se.is.cw.exception.EntityNotFoundException;
import ru.itmo.se.is.cw.mapper.PurchaseOrderMapper;
import ru.itmo.se.is.cw.mapper.PurchaseOrderMaterialMapper;
import ru.itmo.se.is.cw.mapper.PurchaseOrderReceiptMapper;
import ru.itmo.se.is.cw.model.EmployeeEntity;
import ru.itmo.se.is.cw.model.PurchaseOrderEntity;
import ru.itmo.se.is.cw.model.PurchaseOrderReceiptEntity;
import ru.itmo.se.is.cw.model.value.PurchaseOrderStatus;
import ru.itmo.se.is.cw.repository.PurchaseOrderReceiptRepository;
import ru.itmo.se.is.cw.repository.PurchaseOrderRepository;
import ru.itmo.se.is.cw.security.CurrentUser;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrdersService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderReceiptRepository purchaseOrderReceiptRepository;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final EntityManager em;
    private final MaterialsService materialsService;
    private final PurchaseOrderReceiptMapper purchaseOrderReceiptMapper;
    private final PurchaseOrderMaterialMapper purchaseOrderMaterialMapper;
    private final EmployeesService employeesService;
    private final CurrentUser currentUser;

    @Transactional
    public PurchaseOrderResponseDto createPurchaseOrder(PurchaseOrderRequestDto request) {
        EmployeeEntity employee = employeesService.getByAccountId(
                currentUser.accountId()
        );
        PurchaseOrderEntity purchaseOrder = purchaseOrderMapper.toEntity(request, employee);
        applyMaterials(purchaseOrder, request.getMaterials());
        purchaseOrder = purchaseOrderRepository.save(purchaseOrder);
        purchaseOrderRepository.updateStatusAndSetCurrent(
                purchaseOrder.getId(),
                PurchaseOrderStatus.CREATED.name()
        );
        em.refresh(purchaseOrder);
        return purchaseOrderMapper.toDto(purchaseOrder);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponseDto> getPurchaseOrders(Pageable pageable, PurchaseOrderFilter filter) {
        return purchaseOrderRepository
                .findAll(PurchaseOrderSpecification.byFilter(filter), pageable)
                .map(purchaseOrderMapper::toDto);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponseDto getPurchaseOrderById(Long id) {
        return purchaseOrderMapper.toDto(getById(id));
    }

    @Transactional
    public PurchaseOrderResponseDto updateMaterialsInPurchaseOrder(Long id, List<PurchaseOrderMaterialDto> materials) {
        PurchaseOrderEntity purchaseOrder = getById(id);
        applyMaterials(purchaseOrder, materials);
        return purchaseOrderMapper.toDto(
                purchaseOrderRepository.save(purchaseOrder)
        );
    }

    @Transactional
    public PurchaseOrderReceiptResponseDto registerReceipt(Long id, PurchaseOrderReceiptRequest request) {
        PurchaseOrderEntity purchaseOrder = getById(id);

        if (purchaseOrder.getCurrentStatus().getStatus().equals(PurchaseOrderStatus.COMPLETED)) {
            throw new IllegalStateException("Order with id " + id + " has already been completed");
        }

        updateReceivedMaterialsBalance(id, request, purchaseOrder);

        purchaseOrderRepository.updateStatusAndSetCurrent(id, PurchaseOrderStatus.COMPLETED.name());
        em.refresh(purchaseOrder);

        EmployeeEntity warehouseWorker = employeesService.getByAccountId(
                currentUser.accountId()
        );
        PurchaseOrderReceiptEntity receipt = purchaseOrderReceiptMapper.toEntity(request, purchaseOrder, warehouseWorker);
        return purchaseOrderReceiptMapper.toDto(
                purchaseOrderReceiptRepository.save(receipt)
        );
    }

    public PurchaseOrderEntity getById(Long id) {
        return purchaseOrderRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase order with id " + id + " not found"));
    }

    private void updateReceivedMaterialsBalance(Long id, PurchaseOrderReceiptRequest request, PurchaseOrderEntity purchaseOrder) {
        List<Long> allowedMaterialsIds = purchaseOrder.getMaterials().stream()
                .map(pm -> pm.getMaterial().getId())
                .toList();

        request.getReceivedItems().forEach(item -> {
            if (!allowedMaterialsIds.contains(item.getMaterialId())) {
                throw new IllegalArgumentException("Material " + item.getMaterialId() + " is not in purchase order " + id);
            }
            materialsService.setMaterialBalance(item.getMaterialId(), item.getAmount());
        });
    }

    private void applyMaterials(PurchaseOrderEntity purchaseOrder, List<PurchaseOrderMaterialDto> materials) {
        purchaseOrder.clearMaterials();
        materials.stream()
                .map(dto ->
                        purchaseOrderMaterialMapper.toEntity(
                                dto,
                                materialsService.getById(dto.getMaterialId()),
                                purchaseOrder
                        )
                )
                .forEach(purchaseOrder::addMaterial);
    }
}
