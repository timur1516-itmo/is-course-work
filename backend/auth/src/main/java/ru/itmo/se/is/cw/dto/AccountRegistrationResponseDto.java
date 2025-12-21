package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Ответ на создание аккаунта")
public class AccountRegistrationResponseDto {

    @Schema(description = "Идентификатор созданного аккаунта", example = "123")
    private Long accountId;
}
