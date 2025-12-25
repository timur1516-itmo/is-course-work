package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на регистрацию клиента")
public class AuthClientRegistrationRequestDto {

    @Schema(description = "Имя пользователя (логин)", example = "client.user", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @Schema(description = "Пароль", example = "P@ssw0rd!", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;
}