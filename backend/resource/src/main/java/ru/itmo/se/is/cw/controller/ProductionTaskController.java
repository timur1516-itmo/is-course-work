package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.se.is.cw.dto.ProblemDetail;
import ru.itmo.se.is.cw.dto.ProductionTaskResponseDto;
import ru.itmo.se.is.cw.dto.filter.ProductionTaskFilter;
import ru.itmo.se.is.cw.model.ProductionTaskEntity;
import ru.itmo.se.is.cw.model.value.ClientOrderStatus;
import ru.itmo.se.is.cw.model.value.ProductionTaskStatus;
import ru.itmo.se.is.cw.service.OrdersService;
import ru.itmo.se.is.cw.service.ProductionTaskService;

import java.util.List;

// Контроллер отключен - используем простую логику статусов заказов
// @RestController
// @RequestMapping("/production-tasks")
@Tag(name = "Production Tasks", description = "Операции с производственными задачами (отключено)")
@RequiredArgsConstructor
public class ProductionTaskController {

    private final ProductionTaskService productionTaskService;
    private final OrdersService ordersService;

    @GetMapping
    @Operation(
            summary = "Список производственных задач",
            description = "Возвращает пагинированный список производственных задач."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Пагинированный список задач"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещён",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.read')")
    public ResponseEntity<Page<ProductionTaskResponseDto>> getTasks(
            @ParameterObject @ModelAttribute ProductionTaskFilter filter,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<ProductionTaskResponseDto> tasks = productionTaskService.getTasks(pageable, filter);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/current")
    @Operation(
            summary = "Текущая задача оператора",
            description = "Возвращает текущую активную задачу для оператора (QUEUED или IN_PROGRESS)."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Текущая задача найдена",
                    content = @Content(schema = @Schema(implementation = ProductionTaskResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Текущая задача не найдена",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.read')")
    public ResponseEntity<ProductionTaskResponseDto> getCurrentTask() {
        try {
            var tasks = productionTaskService.getTasksForCurrentOperator();
            var currentTask = tasks.stream()
                    .filter(task -> task.getCurrentStatus() != null &&
                            (task.getCurrentStatus().getStatus() == ProductionTaskStatus.QUEUED ||
                             task.getCurrentStatus().getStatus() == ProductionTaskStatus.IN_PROGRESS))
                    .findFirst()
                    .orElse(null);

            if (currentTask == null) {
                return ResponseEntity.notFound().build();
            }

            var mapper = productionTaskService.getMapper();
            return ResponseEntity.ok(mapper.toDto(currentTask));
        } catch (Exception e) {
            System.err.println("Error in getCurrentTask: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/my-tasks")
    @Operation(
            summary = "Мои задачи (для оператора)",
            description = "Возвращает список задач текущего оператора."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список задач оператора"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещён",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.read')")
    public ResponseEntity<List<ProductionTaskResponseDto>> getMyTasks() {
        var tasks = productionTaskService.getTasksForCurrentOperator();
        var dtos = tasks.stream()
                .map(task -> {
                    var dto = new ProductionTaskResponseDto();
                    dto.setId(task.getId());
                    dto.setClientOrderId(task.getClientOrder().getId());
                    dto.setCncOperatorId(task.getCncOperator().getId());
                    dto.setStatus(task.getCurrentStatus() != null ? task.getCurrentStatus().getStatus() : null);
                    dto.setStartedAt(task.getStartedAt());
                    dto.setFinishedAt(task.getFinishedAt());
                    dto.setCreatedAt(task.getCreatedAt());
                    return dto;
                })
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{id}/start")
    @Operation(
            summary = "Начать выполнение задачи",
            description = "Переводит задачу в статус IN_PROGRESS и заказ в статус IN_PRODUCTION."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Задача начата"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Задача не найдена",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.execute')")
    public ResponseEntity<Void> startTask(
            @PathVariable @Parameter(description = "Идентификатор задачи", required = true) Long id
    ) {
        ProductionTaskEntity task;
        try {
            task = productionTaskService.getById(id);
        } catch (ru.itmo.se.is.cw.exception.EntityNotFoundException e) {
            var orderEntity = ordersService.getById(id);
            task = productionTaskService.createProductionTask(orderEntity);
        }
        
        var order = ordersService.getOrderById(task.getClientOrder().getId());

        if (order.getStatus() != ClientOrderStatus.READY_FOR_PRODUCTION) {
            if (order.getStatus() == ClientOrderStatus.IN_PROGRESS || 
                order.getStatus() == ClientOrderStatus.PENDING_APPROVAL) {
                ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto approvedRequest = new ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto();
                approvedRequest.setStatus(ClientOrderStatus.APPROVED);
                approvedRequest.setComment(null);
                ordersService.changeOrderStatus(task.getClientOrder().getId(), approvedRequest);
                order = ordersService.getOrderById(task.getClientOrder().getId());
            }

            if (order.getStatus() == ClientOrderStatus.APPROVED) {
                ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto readyRequest = new ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto();
                readyRequest.setStatus(ClientOrderStatus.READY_FOR_PRODUCTION);
                readyRequest.setComment(null);
                ordersService.changeOrderStatus(task.getClientOrder().getId(), readyRequest);
                order = ordersService.getOrderById(task.getClientOrder().getId());
            }
        }

        order = ordersService.getOrderById(task.getClientOrder().getId());
        
        productionTaskService.updateTaskStatusInNewTransaction(task, ProductionTaskStatus.IN_PROGRESS);
        
        ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto statusRequest = new ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto();
        statusRequest.setStatus(ClientOrderStatus.IN_PRODUCTION);
        statusRequest.setComment(null);
        ordersService.changeOrderStatus(task.getClientOrder().getId(), statusRequest);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/create-for-order/{orderId}")
    @Operation(
            summary = "Создать задачу для заказа",
            description = "Создает production task для заказа, если его еще нет."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Задача создана или уже существует"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заказ не найден",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.read')")
    public ResponseEntity<Void> createTaskForOrder(
            @PathVariable @Parameter(description = "Идентификатор заказа", required = true) Long orderId
    ) {
        try {
            productionTaskService.getByOrderId(orderId);
            return ResponseEntity.ok().build();
        } catch (ru.itmo.se.is.cw.exception.EntityNotFoundException e) {
            var orderEntity = ordersService.getById(orderId);
            productionTaskService.createProductionTask(orderEntity);
            return ResponseEntity.ok().build();
        }
    }

    @PostMapping("/{id}/complete")
    @Operation(
            summary = "Завершить выполнение задачи",
            description = "Переводит задачу в статус COMPLETED и заказ в статус READY_FOR_PICKUP."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Задача завершена"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Задача не найдена",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.execute')")
    public ResponseEntity<Void> completeTask(
            @PathVariable @Parameter(description = "Идентификатор задачи", required = true) Long id
    ) {
        var task = productionTaskService.getById(id);
        productionTaskService.updateTaskStatusInNewTransaction(task, ProductionTaskStatus.COMPLETED);
        ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto statusRequest = new ru.itmo.se.is.cw.dto.ClientOrderStatusChangeRequestDto();
        statusRequest.setStatus(ClientOrderStatus.READY_FOR_PICKUP);
        statusRequest.setComment(null);
        ordersService.changeOrderStatus(task.getClientOrder().getId(), statusRequest);
        return ResponseEntity.ok().build();
    }
}

