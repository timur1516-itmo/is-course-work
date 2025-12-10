package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на вход")
public class LoginRequest {
    @Schema(description = "Имя пользователя или email", example = "ivanov")
    private String username;

    @Schema(description = "Пароль", example = "password123")
    private String password;
}
