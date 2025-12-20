package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на подтверждение email")
public class VerifyEmailRequest {
    @Schema(description = "Токен подтверждения", example = "abc123def456")
    private String token;
}
