package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import ru.itmo.se.is.cw.model.value.AccountRole;

@Data
@Schema(description = "Ответ на вход")
public class LoginResponse {
    @Schema(description = "Токен доступа JWT", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @Schema(description = "Тип токена", example = "Bearer")
    private String tokenType;

    @Schema(description = "Время жизни токена в секундах", example = "3600")
    private Integer expiresIn;

    @Schema(description = "Роль пользователя")
    private AccountRole role;
}
