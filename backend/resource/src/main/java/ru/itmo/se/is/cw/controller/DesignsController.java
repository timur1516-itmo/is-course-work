package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.se.is.cw.dto.ErrorResponse;
import ru.itmo.se.is.cw.dto.ProductDesign;
import ru.itmo.se.is.cw.dto.ProductDesignUpdateRequest;


@RestController
@RequestMapping("/orders/{orderId}/design")
@Tag(name = "Designs", description = "Операции с дизайнами")
public class DesignsController {

    @GetMapping
    @Operation(
            summary = "Получить дизайн по заказу",
            description = "Возвращает текущий дизайн, прикрепленный к заказу."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Дизайн найден",
                    content = @Content(
                            schema = @Schema(implementation = ProductDesign.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ или дизайн не найдены",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProductDesign> getDesign(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long orderId
    ) {
        // TODO: Реализовать логику получения дизайна
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping
    @Operation(
            summary = "Создать или обновить дизайн заказа",
            description = "Создаёт новый дизайн или обновляет существующий дизайн для указанного заказа."
    )
    @RequestBody(
            description = "Данные для создания/обновления дизайна",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProductDesignUpdateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Дизайн создан или обновлён",
                    content = @Content(
                            schema = @Schema(implementation = ProductDesign.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProductDesign> updateDesign(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long orderId,

            @RequestBody ProductDesignUpdateRequest request
    ) {
        // TODO: Реализовать логику обновления дизайна
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
