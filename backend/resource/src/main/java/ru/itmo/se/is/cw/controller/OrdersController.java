package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.service.ConversationsService;
import ru.itmo.se.is.cw.service.MaterialsService;
import ru.itmo.se.is.cw.service.OrdersService;

import java.net.URI;
import java.util.List;


@RestController
@RequestMapping("/orders")
@Tag(name = "Orders", description = "Операции с заказами")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService ordersService;
    private final MaterialsService materialsService;
    private final ConversationsService conversationsService;

    @PostMapping
    @Operation(
            summary = "Создание заказа на основе клиентской заявки",
            description = "Создает новый заказ по переданной заявке клиента."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Заказ успешно создан",
                    content = @Content(
                            schema = @Schema(implementation = ClientOrderResponseDto.class)
                    )
            )
    })
    public ResponseEntity<ClientOrderResponseDto> createOrder(
            @RequestBody CreateOrderRequestDto request,
            UriComponentsBuilder uriBuilder
    ) {
        ClientOrderResponseDto created = ordersService.createOrder(request);
        URI location = uriBuilder
                .path("/orders/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }


    @GetMapping
    @Operation(
            summary = "Список заказов",
            description = "Возвращает заказы"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список заказов",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = ClientOrderResponseDto.class))
                    )
            )
    })
    public ResponseEntity<Page<ClientOrderResponseDto>> getOrders(
            @ParameterObject @ModelAttribute ClientOrderFilter filter,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ordersService.getOrders(pageable, filter));
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
                            schema = @Schema(implementation = ClientOrderResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ не найден",
                    content = @Content(
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<ClientOrderResponseDto> getOrderById(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id
    ) {
        return ResponseEntity.ok(ordersService.getOrderById(id));
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
                            schema = @Schema(implementation = ConversationResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Диалог не найден",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<ConversationResponseDto> getConversationByOrderId(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id
    ) {
        return ResponseEntity.ok(conversationsService.getConversationByOrderId(id));
    }

    @PostMapping("/{id}/status")
    @Operation(
            summary = "Изменение статуса заказа",
            description = "Меняет статус заказа. Проверяет допустимость перехода."
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
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ не найден",
                    content = @Content(
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<Void> changeOrderStatus(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id,
            @RequestBody ClientOrderStatusChangeRequestDto request
    ) {
        ordersService.changeOrderStatus(id, request);
        return ResponseEntity.ok().build();
    }


    @PatchMapping("/{id}/price")
    @Operation(
            summary = "Обновить цену заказа",
            description = "Обновляет итоговую стоимость заказа."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Цена обновлена",
                    content = @Content(
                            schema = @Schema(implementation = ClientOrderResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ не найден",
                    content = @Content(
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<ClientOrderResponseDto> updateOrderPrice(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id,
            @RequestBody UpdateOrderPriceRequestDto request
    ) {
        return ResponseEntity.ok(ordersService.updateOrderPrice(id, request));
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
                            array = @ArraySchema(schema = @Schema(implementation = MaterialConsumptionResponseDto.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ не найден",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    public ResponseEntity<List<MaterialConsumptionResponseDto>> getMaterialsConsumption(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long id
    ) {
        return ResponseEntity.ok(materialsService.getMaterialsConsumptionByOrder(id));
    }
}
