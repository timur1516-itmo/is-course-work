package ru.itmo.se.is.cw.model.value;

public enum ClientOrderStatus {
    CREATED,
    IN_PROGRESS,
    PENDING_APPROVAL,
    REWORK,
    APPROVED,
    AWAITING_PAYMENT,
    PAID,
    READY_FOR_PRODUCTION,
    IN_PRODUCTION,
    COMPLETED
}
