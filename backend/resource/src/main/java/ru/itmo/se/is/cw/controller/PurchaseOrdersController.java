package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.se.is.cw.dto.*;

import java.util.List;


@RestController
@RequestMapping("/purchase-orders")
@Tag(name = "PurchaseOrders", description = "Операции с заявками на закупку")
public class PurchaseOrdersController {

    @PostMapping
    @Operation(
            summary = "Создание заявки на закупку",
            description = "Создает новую заявку на закупку материалов."
    )
    @RequestBody(
            description = "Данные для создания заявки",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PurchaseOrderCreateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Заявка создана",
                    content = @Content(
                            schema = @Schema(implementation = PurchaseOrder.class)
                    )
            )
    })
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(
            @RequestBody PurchaseOrderCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping
    @Operation(
            summary = "Список заявок на закупку",
            description = "Возвращает список всех заявок на закупку."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Заявки на закупку",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = PurchaseOrder.class))
                    )
            )
    })
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrders() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Детали заявки на закупку",
            description = "Возвращает подробную информацию о заявке на закупку по её идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Заявка найдена",
                    content = @Content(
                            schema = @Schema(implementation = PurchaseOrder.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заявка не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(
            @Parameter(description = "Идентификатор заявки", required = true)
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/{id}/materials")
    @Operation(
            summary = "Добавить или обновить материалы в заявке",
            description = "Обновляет список материалов, включённых в заявку на закупку."
    )
    @RequestBody(
            description = "Список материалов, включаемых в заявку",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = PurchaseOrderMaterialItem.class))
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Материалы обновлены",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заявка не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> updateMaterialsInPurchaseOrder(
            @Parameter(description = "Идентификатор заявки", required = true)
            @PathVariable("id") Long id,

            @RequestBody List<PurchaseOrderMaterialItem> materials
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/{id}/approve")
    @Operation(
            summary = "Утвердить заявку на закупку",
            description = "Утверждает заявку и передает её в дальнейшую обработку."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Заявка утверждена",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заявка не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> approvePurchaseOrder(
            @Parameter(description = "Идентификатор заявки", required = true)
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/{id}/receipt")
    @Operation(
            summary = "Зарегистрировать приход материалов по заявке",
            description = "Создает запись о приходе материалов по утверждённой заявке."
    )
    @RequestBody(
            description = "Данные о фактическом приходе материалов",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PurchaseOrderReceiptCreateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Приход зарегистрирован",
                    content = @Content(
                            schema = @Schema(implementation = PurchaseOrderReceipt.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заявка не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<PurchaseOrderReceipt> registerReceipt(
            @Parameter(description = "Идентификатор заявки", required = true)
            @PathVariable("id") Long id,

            @RequestBody PurchaseOrderReceiptCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
