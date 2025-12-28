package ru.itmo.se.is.cw.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.ClientOrderResponseDto;
import ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto;
import ru.itmo.se.is.cw.dto.CreateOrderRequestDto;
import ru.itmo.se.is.cw.dto.UpdateOrderPriceRequestDto;
import ru.itmo.se.is.cw.dto.filter.ClientOrderFilter;
import ru.itmo.se.is.cw.dto.specification.ClientOrderSpecification;
import ru.itmo.se.is.cw.exception.EntityNotFoundException;
import ru.itmo.se.is.cw.mapper.ClientOrderMapper;
import ru.itmo.se.is.cw.model.*;
import ru.itmo.se.is.cw.model.value.AccountRole;
import ru.itmo.se.is.cw.model.value.ClientOrderStatus;
import ru.itmo.se.is.cw.repository.ClientOrderRepository;
import ru.itmo.se.is.cw.repository.ClientOrderStatusRepository;
import ru.itmo.se.is.cw.repository.ProductDesignRepository;

import java.math.BigDecimal;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrdersService {

    private final ClientOrderRepository clientOrderRepository;
    private final ClientOrderStatusRepository clientOrderStatusRepository;
    private final ProductDesignRepository productDesignRepository;
    private final ClientApplicationsService clientApplicationsService;
    private final EmployeesService employeesService;
    private final DesignsService designsService;
    private final EntityManager em;
    private final ClientOrderMapper clientOrderMapper;
    private final ClientsService clientsService;
    private final CurrentUserService currentUserService;
    private final ConversationsService conversationsService;

    @Transactional
    public ClientOrderResponseDto createOrder(CreateOrderRequestDto request) {
        ClientApplicationEntity application = clientApplicationsService.getById(request.getClientApplicationId());
        EmployeeEntity manager = employeesService.getByAccountId(currentUserService.getAccountId());
        ProductDesignEntity design = application.getTemplateProductDesign() == null
                ? designsService.createEmptyDesign()
                : application.getTemplateProductDesign();

        ClientOrderEntity order = new ClientOrderEntity();
        order.setClientApplication(application);
        order.setManager(manager);
        order.setProductDesign(design);

        order = clientOrderRepository.save(order);

        ConversationEntity conversation = conversationsService.createConversationForOrder(order);
        conversationsService.addParticipantToConversation(conversation, application.getClient().getAccountId());
        conversationsService.addParticipantToConversation(conversation, manager.getAccountId());

        clientOrderRepository.updateStatusAndSetCurrent(order.getId(), ClientOrderStatus.CREATED.name());
        em.refresh(order);

        return clientOrderMapper.toDto(order);
    }

    @Transactional(readOnly = true)
    public Page<ClientOrderResponseDto> getOrders(Pageable pageable, ClientOrderFilter filter) {
        ClientOrderFilter effective = (filter == null) ? new ClientOrderFilter() : filter;

        if (currentUserService.hasRole(AccountRole.CLIENT)) {
            ClientEntity client = clientsService.getByAccountId(currentUserService.getAccountId());
            effective.setClientId(client.getId());
        }

        return clientOrderRepository
                .findAll(ClientOrderSpecification.byFilter(effective), pageable)
                .map(order -> {
                    ClientOrderResponseDto dto = clientOrderMapper.toDto(order);
                    if (dto.getStatus() == ClientOrderStatus.COMPLETED) {
                        clientOrderStatusRepository
                                .findSetAtByClientOrderIdAndStatus(order.getId(), ClientOrderStatus.COMPLETED)
                                .ifPresent(dto::setCompletedAt);
                    }
                    return dto;
                });
    }

    @Transactional(readOnly = true)
    public ClientOrderResponseDto getOrderById(Long id) {
        ClientOrderEntity order = getById(id);
        ClientOrderResponseDto dto = clientOrderMapper.toDto(order);
        if (dto.getStatus() == ClientOrderStatus.COMPLETED) {
            clientOrderStatusRepository
                    .findSetAtByClientOrderIdAndStatus(order.getId(), ClientOrderStatus.COMPLETED)
                    .ifPresent(dto::setCompletedAt);
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public ClientOrderEntity getById(Long id) {
        return clientOrderRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order with id " + id + " not found"));
    }

    @Transactional
    public void changeOrderStatus(Long id, ClientOrderStatusChangeRequestDto request) {
        ClientOrderEntity order = getById(id);

        ClientOrderStatus current = order.getCurrentStatus() == null ? null : order.getCurrentStatus().getStatus();
        ClientOrderStatus next = request.getStatus();

        if (next == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        if (current != null && !isAllowedTransition(current, next)) {
            throw new IllegalArgumentException("Invalid status transition: " + current + " -> " + next);
        }

        clientOrderRepository.updateStatusAndSetCurrent(id, next.name());
        em.refresh(order);

        if (next == ClientOrderStatus.REWORK && order.getProductDesign() != null) {
            try {
                if (order.getProductDesign().getConstructor() == null) {
                    EmployeeEntity constructor = employeesService.getByAccountId(currentUserService.getAccountId());
                    order.getProductDesign().setConstructor(constructor);
                    productDesignRepository.save(order.getProductDesign());
                }

                ConversationEntity conversation = conversationsService.getConversationByOrderIdInternal(order.getId());
                if (conversation != null) {
                    Long constructorAccountId = order.getProductDesign().getConstructor().getAccountId();
                    conversationsService.addParticipantToConversation(conversation, constructorAccountId);

                    if (request.getComment() != null && !request.getComment().trim().isEmpty()) {
                        conversationsService.sendMessageAsUser(conversation.getId(), constructorAccountId, request.getComment());
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Transactional
    public ClientOrderResponseDto updateOrderPrice(Long id, UpdateOrderPriceRequestDto request) {
        ClientOrderEntity order = getById(id);
        order.setPrice(BigDecimal.valueOf(request.getPrice()));
        return clientOrderMapper.toDto(
                clientOrderRepository.save(order)
        );
    }

    @Transactional(readOnly = true)
    public boolean hasOrderBeenInStatus(Long orderId, ClientOrderStatus status) {
        return clientOrderStatusRepository.existsByClientOrderIdAndStatus(orderId, status);
    }

    @Transactional
    public ClientOrderResponseDto updateOrderDesign(Long id, Long designId) {
        ClientOrderEntity order = getById(id);
        ProductDesignEntity design = designsService.getById(designId);
        order.setProductDesign(design);
        return clientOrderMapper.toDto(clientOrderRepository.save(order));
    }

    private boolean isAllowedTransition(ClientOrderStatus from, ClientOrderStatus to) {
        if (from == to) return true;

        return switch (from) {
            case CREATED -> Set.of(ClientOrderStatus.IN_PROGRESS, ClientOrderStatus.PENDING_APPROVAL).contains(to);
            case IN_PROGRESS ->
                    Set.of(ClientOrderStatus.PENDING_APPROVAL, ClientOrderStatus.REWORK, ClientOrderStatus.APPROVED).contains(to);
            case PENDING_APPROVAL -> Set.of(ClientOrderStatus.REWORK, ClientOrderStatus.APPROVED).contains(to);
            case REWORK -> Set.of(ClientOrderStatus.PENDING_APPROVAL, ClientOrderStatus.APPROVED).contains(to);
            case APPROVED ->
                    Set.of(ClientOrderStatus.AWAITING_PAYMENT, ClientOrderStatus.READY_FOR_PRODUCTION).contains(to);
            case AWAITING_PAYMENT -> Set.of(ClientOrderStatus.PAID).contains(to);
            case PAID -> Set.of(ClientOrderStatus.READY_FOR_PRODUCTION).contains(to);
            case READY_FOR_PRODUCTION -> Set.of(ClientOrderStatus.IN_PRODUCTION).contains(to);
            case IN_PRODUCTION -> Set.of(ClientOrderStatus.READY_FOR_PICKUP).contains(to);
            case READY_FOR_PICKUP -> Set.of(ClientOrderStatus.COMPLETED).contains(to);
            case COMPLETED -> false;
        };
    }
}
