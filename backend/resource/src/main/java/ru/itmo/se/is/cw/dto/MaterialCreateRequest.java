package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на создание материала")
public class MaterialCreateRequest {
    @Schema(description = "Название материала", example = "Дуб")
    private String name;

    @Schema(description = "Единица измерения", example = "м3")
    private String unitOfMeasure;

    @Schema(description = "Точка заказа", example = "10.0")
    private Double orderPoint;
}
