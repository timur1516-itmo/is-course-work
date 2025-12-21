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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.se.is.cw.dto.ProblemDetail;
import ru.itmo.se.is.cw.dto.ProductionTaskResponseDto;
import ru.itmo.se.is.cw.dto.filter.ProductionTaskFilter;
import ru.itmo.se.is.cw.service.ProductionService;


@RestController
@RequestMapping("/production-tasks")
@Tag(name = "Production", description = "Операции с производственными задачами")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @GetMapping
    @Operation(
            summary = "Список производственных задач",
            description = "Возвращает список задач"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список производственных задач",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = ProductionTaskResponseDto.class))
                    )
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.read')")
    public ResponseEntity<Page<ProductionTaskResponseDto>> getProductionTasks(
            @ParameterObject @ModelAttribute ProductionTaskFilter filter,
            @ParameterObject @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<ProductionTaskResponseDto> products = productionService.getProductionTasks(pageable, filter);
        return ResponseEntity.ok(products);
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
                            schema = @Schema(implementation = ProductionTaskResponseDto.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Задача не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.read')")
    public ResponseEntity<ProductionTaskResponseDto> getProductionTaskById(
            @PathVariable @Parameter(description = "Идентификатор производственной задачи", required = true) Long id
    ) {
        ProductionTaskResponseDto productionTask = productionService.getProductionTaskById(id);
        return ResponseEntity.ok(productionTask);
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
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.execute')")
    public ResponseEntity<Void> startProductionTask(
            @PathVariable @Parameter(description = "Идентификатор задачи", required = true) Long id
    ) {
        productionService.startProductionTask(id);
        return ResponseEntity.ok().build();
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
                            schema = @Schema(implementation = ProblemDetail.class)
                    )
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_production.execute')")
    public ResponseEntity<Void> finishProductionTask(
            @PathVariable @Parameter(description = "Идентификатор задачи", required = true) Long id
    ) {
        productionService.finishProductionTask(id);
        return ResponseEntity.ok().build();
    }
}
