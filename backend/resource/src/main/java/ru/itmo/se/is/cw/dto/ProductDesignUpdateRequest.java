package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Запрос на обновление дизайна продукта")
public class ProductDesignUpdateRequest {
    @Schema(description = "Название продукта", example = "Кухонный стол - Проект Beta")
    private String productName;

    @Schema(description = "Список идентификаторов файлов дизайна", example = "[201, 202]")
    private List<Long> fileIds;

    @Schema(description = "Список требуемых материалов")
    private List<RequiredMaterial> requiredMaterials;
}
