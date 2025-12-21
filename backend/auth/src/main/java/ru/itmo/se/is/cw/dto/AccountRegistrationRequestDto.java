package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import ru.itmo.se.is.cw.model.value.AccountRole;

@Data
@Schema(description = "Запрос на создание аккаунта")
public class AccountRegistrationRequestDto {

    @Schema(description = "Имя пользователя (логин)", example = "john.doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @Schema(description = "Пароль", example = "P@ssw0rd!", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(description = "Роль аккаунта", example = "MANAGER", requiredMode = Schema.RequiredMode.REQUIRED)
    private AccountRole role;
}
