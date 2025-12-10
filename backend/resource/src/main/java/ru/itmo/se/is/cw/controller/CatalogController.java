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
@RequestMapping("/catalog")
@Tag(name = "Catalog", description = "Операции с каталогом товаров")
public class CatalogController {

    @GetMapping
    @Operation(
            summary = "Список товаров каталога",
            description = "Возвращает пагинированный список товаров. Поддерживает фильтрацию по категории и поиску."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Пагинированный список товаров",
                    content = @Content(
                            schema = @Schema(implementation = ProductCatalogPage.class)
                    )
            )
    })
    public ResponseEntity<ProductCatalogPage> getProducts(
            @Parameter(description = "Номер страницы (0..N)", required = true)
            @RequestParam("page") int page,

            @Parameter(description = "Размер страницы", required = true)
            @RequestParam("size") int size,

            @Parameter(description = "Категория товара для фильтрации")
            @RequestParam(value = "category", required = false) String category,

            @Parameter(description = "Поисковый запрос по каталогу")
            @RequestParam(value = "search", required = false) String search
    ) {
        // TODO: Реализовать логику получения списка товаров
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping
    @Operation(
            summary = "Создать товар каталога (админ)",
            description = "Создает новый товар каталога. Доступно только администраторам."
    )
    @RequestBody(
            description = "Данные для создания товара",
            required = true,
            content = @Content(
                    schema = @Schema(implementation = ProductCatalogItemCreateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Товар создан",
                    content = @Content(
                            schema = @Schema(implementation = ProductCatalogItem.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещён",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProductCatalogItem> createProduct(
            @RequestBody ProductCatalogItemCreateRequest request
    ) {
        // TODO: Реализовать логику создания товара
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Детали товара",
            description = "Возвращает полную информацию о товаре каталога по его идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Товар найден",
                    content = @Content(
                            schema = @Schema(implementation = ProductCatalogItem.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Товар не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProductCatalogItem> getProductById(
            @PathVariable @Parameter(description = "Идентификатор товара", required = true) Long id
    ) {
        // TODO: Реализовать логику получения товара по ID
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PutMapping("/{id}")
    @Operation(
            summary = "Обновить товар каталога (админ)",
            description = "Обновляет существующий товар каталога по ID. Доступно только администраторам."
    )
    @RequestBody(
            description = "Обновлённые данные товара",
            required = true,
            content = @Content(
                    schema = @Schema(implementation = ProductCatalogItemUpdateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Товар обновлён",
                    content = @Content(
                            schema = @Schema(implementation = ProductCatalogItem.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Товар не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProductCatalogItem> updateProduct(
            @PathVariable @Parameter(description = "Идентификатор товара", required = true) Long id,

            @RequestBody ProductCatalogItemUpdateRequest request
    ) {
        // TODO: Реализовать логику обновления товара
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @DeleteMapping("/{id}")
    @Operation(
            summary = "Удалить товар каталога (админ)",
            description = "Удаляет товар каталога по ID. Доступно только администраторам."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Товар удалён",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Товар не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> deleteProduct(
            @PathVariable @Parameter(description = "Идентификатор товара", required = true) Long id
    ) {
        // TODO: Реализовать логику удаления товара
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}/photos")
    @Operation(
            summary = "Фото товара",
            description = "Возвращает список фотографий для указанного товара."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список фото товара",
                    content = @Content(
                            array = @ArraySchema(
                                    schema = @Schema(implementation = ProductPhoto.class)
                            )
                    )
            )
    })
    public ResponseEntity<List<ProductPhoto>> getProductPhotos(
            @PathVariable @Parameter(description = "Идентификатор товара", required = true) Long id
    ) {
        // TODO: Реализовать логику получения фото товара
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
