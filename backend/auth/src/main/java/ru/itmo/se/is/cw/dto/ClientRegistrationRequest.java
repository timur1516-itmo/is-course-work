package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на регистрацию клиента")
public class ClientRegistrationRequest {
    @Schema(description = "Email клиента", example = "newclient@example.com")
    private String email;

    @Schema(description = "Пароль клиента", example = "password123")
    private String password;

    @Schema(description = "Имя клиента", example = "Иван")
    private String firstName;

    @Schema(description = "Фамилия клиента", example = "Иванов")
    private String lastName;

    @Schema(description = "Номер телефона клиента", example = "+71234567890")
    private String phoneNumber;
}
