package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.itmo.se.is.cw.dto.Client;
import ru.itmo.se.is.cw.dto.ErrorResponse;

import java.util.List;


@RestController
@RequestMapping("/clients")
@Tag(name = "Clients", description = "Операции с клиентами")
public class ClientsController {

    @GetMapping
    @Operation(
            summary = "Список клиентов",
            description = "Возвращает список всех клиентов. Доступно администраторам и менеджерам."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список клиентов",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = Client.class))
                    )
            )
    })
    public ResponseEntity<List<Client>> getClients() {
        // TODO: Реализовать логику получения списка клиентов
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Детали клиента",
            description = "Возвращает информацию о клиенте по его идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Информация о клиенте",
                    content = @Content(
                            schema = @Schema(implementation = Client.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Клиент не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Client> getClientById(
            @PathVariable @Parameter(description = "Идентификатор клиента", required = true) Long id
    ) {
        // TODO: Реализовать логику получения клиента по ID
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
