package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.repository.PurchaseOrderMaterialRepository;
import ru.itmo.se.is.cw.repository.PurchaseOrderReceiptRepository;
import ru.itmo.se.is.cw.repository.PurchaseOrderRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrdersService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderMaterialRepository purchaseOrderMaterialRepository;
    private final PurchaseOrderReceiptRepository purchaseOrderReceiptRepository;

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderCreateRequest request) {
        return null;
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchaseOrders() {
        return List.of();
    }

    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrderById(Long id) {
        return null;
    }

    @Transactional
    public void updateMaterialsInPurchaseOrder(Long id, List<PurchaseOrderMaterialItem> materials) {
    }

    @Transactional
    public void approvePurchaseOrder(Long id) {
    }

    @Transactional
    public PurchaseOrderReceipt registerReceipt(Long id, PurchaseOrderReceiptCreateRequest request) {
        return null;
    }
}
