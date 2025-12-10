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
import org.springframework.web.bind.annotation.*;
import ru.itmo.se.is.cw.dto.ErrorResponse;
import ru.itmo.se.is.cw.dto.ProductionTask;
import ru.itmo.se.is.cw.model.value.ProductionTaskStatus;

import java.util.List;


@RestController
@RequestMapping("/production-tasks")
@Tag(name = "Production", description = "Операции с производственными задачами")
public class ProductionController {

    @GetMapping
    @Operation(
            summary = "Список производственных задач",
            description = "Возвращает список задач, отфильтрованных по статусу."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список производственных задач",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = ProductionTask.class))
                    )
            )
    })
    public ResponseEntity<List<ProductionTask>> getProductionTasks(
            @Parameter(description = "Статус задачи для фильтрации")
            @RequestParam(value = "status", required = false) ProductionTaskStatus status
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Детали производственной задачи",
            description = "Возвращает информацию о задаче по её идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Задача найдена",
                    content = @Content(
                            schema = @Schema(implementation = ProductionTask.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Задача не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProductionTask> getProductionTaskById(
            @Parameter(description = "Идентификатор производственной задачи", required = true)
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/{id}/start")
    @Operation(
            summary = "Старт задачи на производстве",
            description = "Переводит задачу в состояние выполнения."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Задача успешно запущена",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Задача не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> startProductionTask(
            @Parameter(description = "Идентификатор задачи", required = true)
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/{id}/finish")
    @Operation(
            summary = "Завершение задачи на производстве",
            description = "Переводит задачу в состояние завершения."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Задача успешно завершена",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Задача не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> finishProductionTask(
            @Parameter(description = "Идентификатор задачи", required = true)
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
