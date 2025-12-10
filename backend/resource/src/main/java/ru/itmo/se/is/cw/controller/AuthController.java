package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.itmo.se.is.cw.dto.*;

@RestController
@RequestMapping
@Tag(name = "Auth", description = "Операции аутентификации и авторизации")
public class AuthController {

    @PostMapping("/register")
    @Operation(
            summary = "Регистрация нового клиента",
            description = "Создание нового аккаунта клиента и отправка письма для подтверждения email."
    )
    @RequestBody(
            description = "Данные для регистрации клиента",
            required = true,
            content = @Content(
                    schema = @Schema(implementation = ClientRegistrationRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Клиент успешно зарегистрирован",
                    content = @Content(
                            schema = @Schema(implementation = ClientRegistrationResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректные данные",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ClientRegistrationResponse> register(
            @RequestBody ClientRegistrationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/verify-email")
    @Operation(
            summary = "Подтверждение email по токену",
            description = "Подтверждает email клиента по токену, присланному на почту."
    )
    @RequestBody(
            description = "Токен подтверждения email",
            required = true,
            content = @Content(
                    schema = @Schema(implementation = VerifyEmailRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Email подтверждён",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Неверный или просроченный токен",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> verifyEmail(
            @RequestBody VerifyEmailRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/login")
    @Operation(
            summary = "Вход пользователя",
            description = "Проверяет учетные данные и возвращает JWT-токен при успешной аутентификации."
    )
    @RequestBody(
            description = "Учетные данные пользователя",
            required = true,
            content = @Content(
                    schema = @Schema(implementation = LoginRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Успешный вход",
                    content = @Content(
                            schema = @Schema(implementation = LoginResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Неверные учетные данные",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/me")
    @Operation(
            summary = "Информация о текущем пользователе",
            description = "Возвращает профиль авторизованного пользователя."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Профиль текущего пользователя",
                    content = @Content(
                            schema = @Schema(implementation = CurrentUser.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Не авторизован",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<CurrentUser> getCurrentUser() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
