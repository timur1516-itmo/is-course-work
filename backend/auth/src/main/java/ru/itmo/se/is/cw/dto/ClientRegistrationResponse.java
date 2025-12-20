package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Ответ на регистрацию клиента")
public class ClientRegistrationResponse {
    @Schema(description = "Уникальный идентификатор клиента", example = "456")
    private Long clientId;

    @Schema(description = "Уникальный идентификатор аккаунта", example = "789")
    private Long accountId;

    @Schema(description = "Email клиента", example = "newclient@example.com")
    private String email;

    @Schema(description = "Статус аккаунта (включен/выключен)", example = "true")
    private Boolean enabled;
}
