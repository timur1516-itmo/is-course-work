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
@RequestMapping("/materials")
@Tag(name = "Materials", description = "Операции с материалами")
public class MaterialsController {

    @GetMapping
    @Operation(
            summary = "Список материалов",
            description = "Возвращает список всех доступных материалов."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Материалы",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = Material.class))
                    )
            )
    })
    public ResponseEntity<List<Material>> getMaterials() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping
    @Operation(
            summary = "Создать материал (админ/снабжение)",
            description = "Создает новый материал. Доступно администраторам и сотрудникам снабжения."
    )
    @RequestBody(
            description = "Данные для создания материала",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = MaterialCreateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Материал создан",
                    content = @Content(
                            schema = @Schema(implementation = Material.class)
                    )
            )
    })
    public ResponseEntity<Material> createMaterial(
            @RequestBody MaterialCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Детали материала",
            description = "Возвращает информацию о материале по его идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Материал найден",
                    content = @Content(
                            schema = @Schema(implementation = Material.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Материал не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Material> getMaterialById(
            @PathVariable @Parameter(description = "Идентификатор материала", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PutMapping("/{id}")
    @Operation(
            summary = "Обновить материал (админ/снабжение)",
            description = "Обновляет информацию о существующем материале."
    )
    @RequestBody(
            description = "Новые параметры материала",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = MaterialUpdateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Материал обновлён",
                    content = @Content(
                            schema = @Schema(implementation = Material.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Материал не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Material> updateMaterial(
            @PathVariable @Parameter(description = "Идентификатор материала", required = true) Long id,

            @RequestBody MaterialUpdateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @DeleteMapping("/{id}")
    @Operation(
            summary = "Удалить материал (админ)",
            description = "Удаляет материал по идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Материал удалён",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Материал не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> deleteMaterial(
            @PathVariable @Parameter(description = "Идентификатор материала", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/low-stock")
    @Operation(
            summary = "Материалы ниже точки заказа",
            description = "Возвращает список материалов, требующих пополнения."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список материалов",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = Material.class))
                    )
            )
    })
    public ResponseEntity<List<Material>> getLowStockMaterials() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}/balance-history")
    @Operation(
            summary = "История изменений остатка материала",
            description = "Возвращает историю движения и баланса материала."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "История балансов/списаний",
                    content = @Content(
                            schema = @Schema(implementation = MaterialBalanceHistory.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Материал не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<MaterialBalanceHistory> getMaterialBalanceHistory(
            @PathVariable @Parameter(description = "Идентификатор материала", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
