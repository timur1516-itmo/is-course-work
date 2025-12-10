package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Страница списка товаров каталога")
public class ProductCatalogPage {
    @Schema(description = "Содержимое страницы")
    private List<ProductCatalogItem> content;

    @Schema(description = "Номер страницы", example = "0")
    private Integer page;

    @Schema(description = "Размер страницы", example = "20")
    private Integer size;

    @Schema(description = "Общее количество элементов", example = "100")
    private Long totalElements;
}
