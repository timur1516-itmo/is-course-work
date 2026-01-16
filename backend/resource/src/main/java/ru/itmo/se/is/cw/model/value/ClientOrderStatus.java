package ru.itmo.se.is.cw.model.value;

public enum ClientOrderStatus {
    CREATED,
    IN_PROGRESS,
    PENDING_APPROVAL,
    REWORK,
    READY_FOR_PRODUCTION,
    IN_PRODUCTION,
    READY_FOR_PICKUP,
    COMPLETED
}
