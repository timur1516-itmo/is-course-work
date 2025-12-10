package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import ru.itmo.se.is.cw.model.value.AccountRole;

@Data
@Schema(description = "Информация о текущем пользователе")
public class CurrentUser {
    @Schema(description = "Уникальный идентификатор аккаунта", example = "789")
    private Long accountId;

    @Schema(description = "Имя пользователя", example = "ivanov")
    private String username;

    @Schema(description = "Роль пользователя")
    private AccountRole role;

    @Schema(description = "Персональные данные пользователя")
    private Person person;

    @Schema(description = "Информация о клиенте (если пользователь является клиентом)")
    private Client client;
}
