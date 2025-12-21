package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на подтверждение email")
public class VerifyEmailRequestDto {

    @Schema(description = "Токен подтверждения", example = "abc123def456", requiredMode = Schema.RequiredMode.REQUIRED)
    private String token;
}
