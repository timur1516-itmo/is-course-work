package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Объект ошибки API")
public class ErrorResponse {
    @Schema(description = "Код ошибки", example = "VALIDATION_ERROR")
    private String code;

    @Schema(description = "Сообщение об ошибке", example = "Поле 'email' не является действительным адресом электронной почты")
    private String message;

    @Schema(description = "Дополнительные детали ошибки")
    private Object details;
}
