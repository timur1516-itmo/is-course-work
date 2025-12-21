package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.itmo.se.is.cw.dto.AccountRegistrationRequestDto;
import ru.itmo.se.is.cw.dto.AccountRegistrationResponseDto;
import ru.itmo.se.is.cw.dto.ClientRegistrationRequestDto;
import ru.itmo.se.is.cw.dto.VerifyEmailRequestDto;
import ru.itmo.se.is.cw.service.AuthService;

@RestController
@RequestMapping
@Tag(name = "Auth", description = "Операции аутентификации и авторизации")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
            summary = "Регистрация клиента",
            description = "Регистрирует нового клиента по логину/паролю."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Клиент зарегистрирован (создан)"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректные данные запроса / нарушены бизнес-правила",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    public ResponseEntity<Void> register(
            @RequestBody ClientRegistrationRequestDto request
    ) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/verify-email")
    @Operation(
            summary = "Подтверждение email",
            description = "Подтверждает email пользователя по токену подтверждения. (Сейчас эндпоинт не реализован.)"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Email подтвержден"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректный токен/формат запроса",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Токен не найден / истёк / пользователь не найден",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "501",
                    description = "Эндпоинт не реализован",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    public ResponseEntity<Void> verifyEmail(
            @RequestBody VerifyEmailRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @PostMapping("/users")
    @Operation(
            summary = "Создание аккаунта",
            description = "Создает аккаунт (пользователя системы) с указанной ролью."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Аккаунт создан",
                    content = @Content(schema = @Schema(implementation = AccountRegistrationResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректные данные запроса / нарушены бизнес-правила",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещён",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    public ResponseEntity<AccountRegistrationResponseDto> createAccount(
            @RequestBody AccountRegistrationRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createAccount(request));
    }
}
