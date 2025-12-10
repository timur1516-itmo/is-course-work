package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.model.value.ClientOrderStatus;
import ru.itmo.se.is.cw.repository.ClientApplicationRepository;
import ru.itmo.se.is.cw.repository.ClientOrderRepository;
import ru.itmo.se.is.cw.repository.ClientOrderStatusRepository;
import ru.itmo.se.is.cw.repository.MaterialConsumptionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdersService {

    private final ClientOrderRepository clientOrderRepository;
    private final ClientOrderStatusRepository clientOrderStatusRepository;
    private final ClientApplicationRepository clientApplicationRepository;
    private final MaterialConsumptionRepository materialConsumptionRepository;

    @Transactional
    public ClientOrder createOrder(CreateOrderRequest request) {
        return null;
    }

    @Transactional(readOnly = true)
    public List<ClientOrder> getOrders(ClientOrderStatus status, Long clientId) {
        return List.of();
    }

    @Transactional(readOnly = true)
    public ClientOrder getOrderById(Long id) {
        return null;
    }

    @Transactional
    public void changeOrderStatus(Long id, ClientOrderStatusChangeRequest request) {
    }

    @Transactional
    public ClientOrder updateOrderPrice(Long id, UpdateOrderPriceRequest request) {
        return null;
    }

    @Transactional(readOnly = true)
    public List<MaterialConsumptionRecord> getMaterialsConsumption(Long orderId) {
        return List.of();
    }
}
