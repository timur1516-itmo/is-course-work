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
import ru.itmo.se.is.cw.model.value.ClientOrderStatus;

import java.util.List;


@RestController
@RequestMapping("/orders")
@Tag(name = "Orders", description = "Операции с заказами")
public class OrdersController {

    @PostMapping
    @Operation(
            summary = "Создание заказа на основе клиентской заявки",
            description = "Создает новый заказ по переданной заявке клиента."
    )
    @RequestBody(
            description = "Данные для создания заказа",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = CreateOrderRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Заказ успешно создан",
                    content = @Content(
                            schema = @Schema(implementation = ClientOrder.class)
                    )
            )
    })
    public ResponseEntity<ClientOrder> createOrder(
            @RequestBody CreateOrderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping
    @Operation(
            summary = "Список заказов",
            description = "Возвращает заказы, отфильтрованные по статусу и/или клиенту."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список заказов",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = ClientOrder.class))
                    )
            )
    })
    public ResponseEntity<List<ClientOrder>> getOrders(
            @Parameter(description = "Фильтр по статусу заказа")
            @RequestParam(value = "status", required = false) ClientOrderStatus status,

            @Parameter(description = "Идентификатор клиента")
            @RequestParam(value = "clientId", required = false) Long clientId
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Детали заказа",
            description = "Возвращает подробную информацию о заказе по идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Заказ найден",
                    content = @Content(
                            schema = @Schema(implementation = ClientOrder.class)
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
    public ResponseEntity<ClientOrder> getOrderById(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @GetMapping("/{id}/conversation")
    @Operation(
            summary = "Получить диалог по заказу",
            description = "Возвращает диалог, связанный с указанным заказом.",
            tags = {"Conversations"}
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Диалог",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Conversation.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Диалог не найден",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Conversation> getConversationByOrderId(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id
    ) {
        // TODO: Реализовать логику получения диалога по заказу
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @PostMapping("/{id}/status")
    @Operation(
            summary = "Изменение статуса заказа",
            description = "Меняет статус заказа. Проверяет допустимость перехода."
    )
    @RequestBody(
            description = "Запрос на изменение статуса заказа",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ClientOrderStatusChangeRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Статус успешно изменён",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Недопустимый переход статуса",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
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
    public ResponseEntity<Void> changeOrderStatus(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id,

            @RequestBody ClientOrderStatusChangeRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PatchMapping("/{id}/price")
    @Operation(
            summary = "Обновить цену заказа",
            description = "Обновляет итоговую стоимость заказа."
    )
    @RequestBody(
            description = "Новая цена заказа",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UpdateOrderPriceRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Цена обновлена",
                    content = @Content(
                            schema = @Schema(implementation = ClientOrder.class)
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
    public ResponseEntity<ClientOrder> updateOrderPrice(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id,

            @RequestBody UpdateOrderPriceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @GetMapping("/{id}/materials-consumption")
    @Operation(
            summary = "История расхода материалов по заказу",
            description = "Возвращает записи о расходе материалов по заказу.",
            tags = {"Materials"}
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Расход материалов",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = MaterialConsumptionRecord.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ не найден",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<List<MaterialConsumptionRecord>> getMaterialsConsumption(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id
    ) {
        // TODO: Реализовать логику получения расхода материалов по заказу
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
