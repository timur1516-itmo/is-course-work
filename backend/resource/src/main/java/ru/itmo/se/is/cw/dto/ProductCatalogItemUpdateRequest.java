package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на обновление товара каталога")
public class ProductCatalogItemUpdateRequest {
    @Schema(description = "Название товара", example = "Кухонный стол (обновленный)")
    private String name;

    @Schema(description = "Описание товара", example = "Стол из натурального дуба")
    private String description;

    @Schema(description = "Цена товара", example = "16000.0")
    private Double price;

    @Schema(description = "Минимальное количество для заказа", example = "2")
    private Integer minimalAmount;

    @Schema(description = "Категория товара", example = "Мебель")
    private String category;
}
