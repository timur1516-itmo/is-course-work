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
import org.springframework.web.util.UriComponentsBuilder;
import ru.itmo.se.is.cw.dto.ProblemDetail;
import ru.itmo.se.is.cw.dto.ProductDesignRequestDto;
import ru.itmo.se.is.cw.dto.ProductDesignResponseDto;
import ru.itmo.se.is.cw.dto.filter.ProductDesignFilter;
import ru.itmo.se.is.cw.service.DesignsService;

import java.net.URI;


@RestController
@RequestMapping("/designs")
@Tag(name = "Designs", description = "Операции с дизайнами продуктов")
@RequiredArgsConstructor
public class DesignsController {

    private final DesignsService designsService;

    @GetMapping
    @Operation(
            summary = "Список дизайнов",
            description = "Возвращает пагинированный список дизайнов с возможностью фильтрации."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Пагинированный список дизайнов"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректные параметры запроса",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_designs.read')")
    public ResponseEntity<Page<ProductDesignResponseDto>> getDesigns(
            @ParameterObject @ModelAttribute ProductDesignFilter filter,
            @ParameterObject @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProductDesignResponseDto> designs = designsService.getDesigns(pageable, filter);
        return ResponseEntity.ok(designs);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Получить дизайн по ID",
            description = "Возвращает дизайн по его идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Дизайн найден",
                    content = @Content(schema = @Schema(implementation = ProductDesignResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Дизайн не найден",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_designs.read')")
    public ResponseEntity<ProductDesignResponseDto> getDesignById(
            @PathVariable @Parameter(description = "Идентификатор дизайна", required = true) Long id
    ) {
        ProductDesignResponseDto design = designsService.getDesignById(id);
        return ResponseEntity.ok(design);
    }

    @PostMapping
    @Operation(
            summary = "Создать дизайн",
            description = "Создаёт новый дизайн продукта."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Дизайн создан",
                    content = @Content(schema = @Schema(implementation = ProductDesignResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректное тело запроса",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_designs.write')")
    public ResponseEntity<ProductDesignResponseDto> createDesign(
            @RequestBody ProductDesignRequestDto request,
            UriComponentsBuilder uriBuilder
    ) {
        ProductDesignResponseDto created = designsService.createDesign(request);

        URI location = uriBuilder
                .path("/designs/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Обновить дизайн",
            description = "Обновляет существующий дизайн по ID."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Дизайн обновлён",
                    content = @Content(schema = @Schema(implementation = ProductDesignResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Дизайн не найден",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректное тело запроса",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_designs.write')")
    public ResponseEntity<ProductDesignResponseDto> updateDesign(
            @PathVariable @Parameter(description = "Идентификатор дизайна", required = true) Long id,
            @RequestBody ProductDesignRequestDto request
    ) {
        ProductDesignResponseDto updated = designsService.updateDesign(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Удалить дизайн",
            description = "Удаляет дизайн по ID."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Дизайн удалён",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Дизайн не найден",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PreAuthorize("hasAuthority('SCOPE_designs.delete')")
    public ResponseEntity<Void> deleteDesign(
            @PathVariable @Parameter(description = "Идентификатор дизайна", required = true) Long id
    ) {
        designsService.deleteDesign(id);
        return ResponseEntity.noContent().build();
    }
}
